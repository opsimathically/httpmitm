// @ts-nocheck
import "reflect-metadata";
import FS from "fs";
import path from "path";
import { isIP } from "net";
import {
  createPrivateKey,
  createPublicKey,
  randomBytes,
  webcrypto,
} from "node:crypto";
import {
  BasicConstraintsExtension,
  DNS,
  ExtendedKeyUsage,
  ExtendedKeyUsageExtension,
  IP,
  KeyUsageFlags,
  KeyUsagesExtension,
  SubjectAlternativeNameExtension,
  SubjectKeyIdentifierExtension,
  X509Certificate,
  X509CertificateGenerator,
  cryptoProvider,
} from "@peculiar/x509";
import async from "async";
import { parse as parseDomain } from "tldts";

type ErrnoException = NodeJS.ErrnoException;
type certificate_key_algorithm_t = "rsa_2048" | "ecdsa_p256";

const DEFAULT_SSL_CA_DIR = path.resolve(process.cwd(), ".http-mitm-proxy");
const DEFAULT_LEAF_CACHE_MAX_ENTRIES = 1000;
const DEFAULT_LEAF_CACHE_TTL_MS = 3_600_000;
const DEFAULT_ROOT_KEY_ALGORITHM: certificate_key_algorithm_t = "rsa_2048";
const DEFAULT_LEAF_KEY_ALGORITHM: certificate_key_algorithm_t = "ecdsa_p256";
const ROOT_SUBJECT = "CN=NodeMITMProxyCA,C=Internet,ST=Internet,L=Internet,O=Node MITM Proxy CA,OU=CA";
const LEAF_SUBJECT_SUFFIX = "C=Internet,ST=Internet,L=Internet,O=Node MITM Proxy CA,OU=Node MITM Proxy Server Certificate";

cryptoProvider.set(webcrypto);

function pemFromDer(label: string, data: ArrayBuffer): string {
  const base64 = Buffer.from(data).toString("base64");
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

function normalizeKeyAlgorithm(
  value: unknown,
  fallback: certificate_key_algorithm_t
): certificate_key_algorithm_t {
  return value === "ecdsa_p256" || value === "rsa_2048" ? value : fallback;
}

function getWebCryptoAlgorithm(algorithm: certificate_key_algorithm_t) {
  if (algorithm === "ecdsa_p256") {
    return {
      name: "ECDSA",
      namedCurve: "P-256",
    };
  }
  return {
    name: "RSASSA-PKCS1-v1_5",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256",
  };
}

function getWebCryptoImportAlgorithm(algorithm: certificate_key_algorithm_t) {
  if (algorithm === "ecdsa_p256") {
    return {
      name: "ECDSA",
      namedCurve: "P-256",
    };
  }
  return {
    name: "RSASSA-PKCS1-v1_5",
    hash: "SHA-256",
  };
}

async function generateKeyPair(algorithm: certificate_key_algorithm_t) {
  return await webcrypto.subtle.generateKey(
    getWebCryptoAlgorithm(algorithm),
    true,
    ["sign", "verify"]
  );
}

function detectPrivateKeyAlgorithm(privateKeyPem: string): certificate_key_algorithm_t {
  const privateKey = createPrivateKey(privateKeyPem);
  if (privateKey.asymmetricKeyType === "rsa") {
    return "rsa_2048";
  }
  if (privateKey.asymmetricKeyType === "ec") {
    const namedCurve = privateKey.asymmetricKeyDetails?.namedCurve;
    if (
      namedCurve === "prime256v1" ||
      namedCurve === "secp256r1" ||
      namedCurve === "P-256"
    ) {
      return "ecdsa_p256";
    }
  }
  throw new Error(`Unsupported certificate private key type: ${privateKey.asymmetricKeyType || "unknown"}.`);
}

async function importKeyPairFromPrivatePem(params: {
  privateKeyPem: string;
  algorithm: certificate_key_algorithm_t;
}) {
  const nodePrivateKey = createPrivateKey(params.privateKeyPem);
  const nodePublicKey = createPublicKey(nodePrivateKey);
  const privateKeyDer = nodePrivateKey.export({
    format: "der",
    type: "pkcs8",
  });
  const publicKeyDer = nodePublicKey.export({
    format: "der",
    type: "spki",
  });
  const importAlgorithm = getWebCryptoImportAlgorithm(params.algorithm);
  return {
    privateKey: await webcrypto.subtle.importKey(
      "pkcs8",
      privateKeyDer,
      importAlgorithm,
      true,
      ["sign"]
    ),
    publicKey: await webcrypto.subtle.importKey(
      "spki",
      publicKeyDer,
      importAlgorithm,
      true,
      ["verify"]
    ),
  };
}

async function exportPrivateKeyPem(privateKey: CryptoKey): Promise<string> {
  return pemFromDer(
    "PRIVATE KEY",
    await webcrypto.subtle.exportKey("pkcs8", privateKey)
  );
}

async function exportPublicKeyPem(publicKey: CryptoKey): Promise<string> {
  return pemFromDer(
    "PUBLIC KEY",
    await webcrypto.subtle.exportKey("spki", publicKey)
  );
}

function createValidityWindow() {
  const notBefore = new Date();
  notBefore.setDate(notBefore.getDate() - 1);
  const notAfter = new Date();
  notAfter.setFullYear(notBefore.getFullYear() + 1);
  return { notBefore, notAfter };
}

export class CA {
  baseCAFolder!: string;
  certsFolder!: string;
  keysFolder!: string;
  CAcert!: X509Certificate;
  CAkeys!: CryptoKeyPair;
  rootStorage = "disk";
  leafStorage = "disk";
  leafWildcard = "registrable_domain";
  rootKeyAlgorithm: certificate_key_algorithm_t = DEFAULT_ROOT_KEY_ALGORITHM;
  leafKeyAlgorithm: certificate_key_algorithm_t = DEFAULT_LEAF_KEY_ALGORITHM;
  rootKeyAlgorithmWasExplicit = false;
  leafCacheMaxEntries = DEFAULT_LEAF_CACHE_MAX_ENTRIES;
  leafCacheTtlMs = DEFAULT_LEAF_CACHE_TTL_MS;
  leafCache = new Map();

  static normalizeCreateOptions(optionsOrFolder) {
    if (typeof optionsOrFolder === "string") {
      return {
        sslCaDir: optionsOrFolder,
        certificates: {},
      };
    }

    return {
      sslCaDir: optionsOrFolder?.sslCaDir || DEFAULT_SSL_CA_DIR,
      certificates: optionsOrFolder?.certificates || {},
    };
  }

  static normalizePositiveNumber(value, fallback) {
    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? value
      : fallback;
  }

  static create(optionsOrFolder, callback) {
    const createOptions = CA.normalizeCreateOptions(optionsOrFolder);
    const rootOptions = createOptions.certificates.rootCA || {};
    const leafOptions = createOptions.certificates.leafCertificates || {};
    const leafCacheOptions = leafOptions.cache || {};
    const ca = new CA();
    ca.rootStorage = rootOptions.storage || "disk";
    ca.leafStorage = leafOptions.storage || "disk";
    ca.leafWildcard = leafOptions.wildcard || "registrable_domain";
    ca.rootKeyAlgorithmWasExplicit =
      typeof rootOptions.keyAlgorithm !== "undefined";
    ca.rootKeyAlgorithm = normalizeKeyAlgorithm(
      rootOptions.keyAlgorithm,
      DEFAULT_ROOT_KEY_ALGORITHM
    );
    ca.leafKeyAlgorithm = normalizeKeyAlgorithm(
      leafOptions.keyAlgorithm,
      DEFAULT_LEAF_KEY_ALGORITHM
    );
    ca.leafCacheMaxEntries = CA.normalizePositiveNumber(
      leafCacheOptions.maxEntries,
      DEFAULT_LEAF_CACHE_MAX_ENTRIES
    );
    ca.leafCacheTtlMs = CA.normalizePositiveNumber(
      leafCacheOptions.ttlMs,
      DEFAULT_LEAF_CACHE_TTL_MS
    );
    ca.baseCAFolder = rootOptions.sslCaDir || createOptions.sslCaDir;
    ca.certsFolder = path.join(ca.baseCAFolder, "certs");
    ca.keysFolder = path.join(ca.baseCAFolder, "keys");
    if (ca.rootStorage === "memory" && ca.leafStorage === "disk") {
      FS.mkdirSync(ca.baseCAFolder, { recursive: true });
      FS.mkdirSync(ca.certsFolder, { recursive: true });
      FS.mkdirSync(ca.keysFolder, { recursive: true });
    }
    if (ca.rootStorage === "disk") {
      FS.mkdirSync(ca.baseCAFolder, { recursive: true });
      FS.mkdirSync(ca.certsFolder, { recursive: true });
      FS.mkdirSync(ca.keysFolder, { recursive: true });
    }
    async.series(
      [
        (callback) => {
          if (ca.rootStorage === "memory") {
            ca.generateCA(callback);
            return;
          }
          const exists = FS.existsSync(path.join(ca.certsFolder, "ca.pem"));
          if (exists) {
            ca.loadCA(callback);
          } else {
            ca.generateCA(callback);
          }
        },
      ],
      (err) => {
        if (err) {
          return callback(err);
        }
        return callback(null, ca);
      }
    );
  }

  randomSerialNumber() {
    return randomBytes(16).toString("hex");
  }

  getPem() {
    return this.CAcert.toString("pem");
  }

  getStorage() {
    return this.rootStorage;
  }

  getRootKeyAlgorithm() {
    return this.rootKeyAlgorithm;
  }

  generateCA(
    callback: (
      err?: ErrnoException | null | undefined,
      results?: unknown[] | undefined
    ) => void
  ) {
    const self = this;
    (async () => {
      const keys = await generateKeyPair(self.rootKeyAlgorithm);
      const validity = createValidityWindow();
      const cert = await X509CertificateGenerator.createSelfSigned({
        serialNumber: self.randomSerialNumber(),
        name: ROOT_SUBJECT,
        keys,
        notBefore: validity.notBefore,
        notAfter: validity.notAfter,
        extensions: [
          new BasicConstraintsExtension(true, undefined, true),
          new KeyUsagesExtension(
            KeyUsageFlags.keyCertSign |
              KeyUsageFlags.cRLSign |
              KeyUsageFlags.digitalSignature,
            true
          ),
          await SubjectKeyIdentifierExtension.create(keys.publicKey),
        ],
      });
      const certPem = cert.toString("pem");
      const keyPrivatePem = await exportPrivateKeyPem(keys.privateKey);
      const keyPublicPem = await exportPublicKeyPem(keys.publicKey);
      self.CAcert = cert;
      self.CAkeys = keys;
      if (self.rootStorage === "memory") {
        callback(null, []);
        return;
      }
      const tasks = [
        FS.writeFile.bind(
          null,
          path.join(self.certsFolder, "ca.pem"),
          certPem
        ),
        FS.writeFile.bind(
          null,
          path.join(self.keysFolder, "ca.private.key"),
          keyPrivatePem
        ),
        FS.writeFile.bind(
          null,
          path.join(self.keysFolder, "ca.public.key"),
          keyPublicPem
        ),
      ];
      async.parallel(tasks, callback);
    })().catch((error) => callback(error));
  }

  loadCA(callback: Function) {
    const self = this;
    async.auto(
      {
        certPEM(callback) {
          FS.readFile(path.join(self.certsFolder, "ca.pem"), "utf-8", callback);
        },
        keyPrivatePEM(callback) {
          FS.readFile(
            path.join(self.keysFolder, "ca.private.key"),
            "utf-8",
            callback
          );
        },
        keyPublicPEM(callback) {
          FS.readFile(
            path.join(self.keysFolder, "ca.public.key"),
            "utf-8",
            callback
          );
        },
      },
      (
        err,
        results:
          | { certPEM: string; keyPrivatePEM: string; keyPublicPEM: string }
          | undefined
      ) => {
        if (err) {
          return callback(err);
        }
        (async () => {
          const detectedAlgorithm = detectPrivateKeyAlgorithm(
            results!.keyPrivatePEM
          );
          if (
            self.rootKeyAlgorithmWasExplicit &&
            detectedAlgorithm !== self.rootKeyAlgorithm
          ) {
            throw new Error(
              `Existing root CA key algorithm is ${detectedAlgorithm}, but ${self.rootKeyAlgorithm} was requested. Use a different ssl_ca_dir or remove the existing CA files.`
            );
          }
          self.rootKeyAlgorithm = detectedAlgorithm;
          self.CAcert = new X509Certificate(results!.certPEM);
          self.CAkeys = await importKeyPairFromPrivatePem({
            privateKeyPem: results!.keyPrivatePEM,
            algorithm: detectedAlgorithm,
          });
          return callback();
        })().catch((error) => callback(error));
      }
    );
  }

  generateServerCertificateKeys(hosts: string | string[], cb) {
    const self = this;
    (async () => {
      if (typeof hosts === "string") {
        hosts = [hosts];
      }
      const mainHost = hosts[0];
      const keysServer = await generateKeyPair(this.leafKeyAlgorithm);
      const validity = createValidityWindow();
      const keyUsage =
        this.leafKeyAlgorithm === "rsa_2048"
          ? KeyUsageFlags.digitalSignature | KeyUsageFlags.keyEncipherment
          : KeyUsageFlags.digitalSignature;
      const certServer = await X509CertificateGenerator.create({
        serialNumber: this.randomSerialNumber(),
        subject: `CN=${mainHost},${LEAF_SUBJECT_SUFFIX}`,
        issuer: this.CAcert.subjectName,
        publicKey: keysServer.publicKey,
        signingKey: this.CAkeys.privateKey,
        notBefore: validity.notBefore,
        notAfter: validity.notAfter,
        extensions: [
          new BasicConstraintsExtension(false, undefined, true),
          new KeyUsagesExtension(keyUsage, true),
          new ExtendedKeyUsageExtension([ExtendedKeyUsage.serverAuth]),
          new SubjectAlternativeNameExtension(
            hosts.map((host) =>
              isIP(host) ? { type: IP, value: host } : { type: DNS, value: host }
            )
          ),
          await SubjectKeyIdentifierExtension.create(keysServer.publicKey),
        ],
      });
      const certPem = certServer.toString("pem");
      const keyPrivatePem = await exportPrivateKeyPem(keysServer.privateKey);
      const keyPublicPem = await exportPublicKeyPem(keysServer.publicKey);
      const identity = this.getLeafCertificateIdentity(mainHost);
      if (this.leafStorage === "disk") {
        FS.writeFile(
          `${this.certsFolder}/${identity.fileName}.pem`,
          certPem,
          (error) => {
            if (error) {
              console.error(
                `Failed to save certificate to disk in ${self.certsFolder}`,
                error
              );
            }
          }
        );
        FS.writeFile(
          `${this.keysFolder}/${identity.fileName}.key`,
          keyPrivatePem,
          (error) => {
            if (error) {
              console.error(
                `Failed to save private key to disk in ${self.keysFolder}`,
                error
              );
            }
          }
        );
        FS.writeFile(
          `${this.keysFolder}/${identity.fileName}.public.key`,
          keyPublicPem,
          (error) => {
            if (error) {
              console.error(
                `Failed to save public key to disk in ${self.keysFolder}`,
                error
              );
            }
          }
        );
      } else {
        this.storeLeafCertificate({
          cacheKey: identity.cacheKey,
          certPem,
          keyPem: keyPrivatePem,
          hosts,
        });
      }
      cb(certPem, keyPrivatePem);
    })().catch((error) => cb(undefined, undefined, error));
  }

  getCACertPath() {
    if (this.rootStorage === "memory") {
      return undefined;
    }
    return `${this.certsFolder}/ca.pem`;
  }

  getLeafCertificateDetails(hostname) {
    const identity = this.getLeafCertificateIdentity(hostname);
    if (this.leafStorage === "memory") {
      const cached = this.getCachedLeafCertificate(identity.cacheKey);
      if (cached) {
        return {
          keyFileData: cached.keyPem,
          certFileData: cached.certPem,
          cacheKey: identity.cacheKey,
          hosts: cached.hosts,
        };
      }
      return {
        cacheKey: identity.cacheKey,
        hosts: identity.hosts,
      };
    }

    const fileName = identity.fileName;
    return {
      keyFile: `${this.keysFolder}/${fileName}.key`,
      certFile: `${this.certsFolder}/${fileName}.pem`,
      cacheKey: identity.cacheKey,
      hosts: identity.hosts,
    };
  }

  getLeafCertificateIdentity(hostname) {
    const normalizedHostname = String(hostname || "").toLowerCase();
    if (
      this.leafWildcard === "exact_host" ||
      normalizedHostname === "localhost" ||
      !normalizedHostname.includes(".") ||
      isIP(normalizedHostname)
    ) {
      return this.getExactLeafCertificateIdentity(normalizedHostname);
    }

    const parsed = parseDomain(normalizedHostname, {
      allowPrivateDomains: true,
    });
    const domain = parsed?.domain;
    const subdomain = parsed?.subdomain;
    const wildcardIsValidForHost =
      domain &&
      (normalizedHostname === domain ||
        (typeof subdomain === "string" &&
          subdomain.length > 0 &&
          !subdomain.includes(".")));

    if (!wildcardIsValidForHost) {
      return this.getExactLeafCertificateIdentity(normalizedHostname);
    }

    return {
      cacheKey: `${this.leafKeyAlgorithm}:wildcard:${domain}`,
      fileName: this.getLeafCertificateFileName(`_.${domain}`),
      hosts: [domain, `*.${domain}`],
    };
  }

  getExactLeafCertificateIdentity(hostname) {
    return {
      cacheKey: `${this.leafKeyAlgorithm}:host:${hostname}`,
      fileName: this.getLeafCertificateFileName(hostname.replace(/\*/g, "_")),
      hosts: [hostname],
    };
  }

  getLeafCertificateFileName(baseName) {
    if (this.leafKeyAlgorithm === "rsa_2048") {
      return baseName;
    }
    return `${baseName}.${this.leafKeyAlgorithm}`;
  }

  getCachedLeafCertificate(cacheKey) {
    const cached = this.leafCache.get(cacheKey);
    if (!cached) {
      return undefined;
    }

    const now = Date.now();
    if (cached.expiresAtMs <= now) {
      this.leafCache.delete(cacheKey);
      return undefined;
    }

    cached.lastUsedAtMs = now;
    this.leafCache.delete(cacheKey);
    this.leafCache.set(cacheKey, cached);
    return cached;
  }

  storeLeafCertificate(params) {
    const now = Date.now();
    this.leafCache.set(params.cacheKey, {
      certPem: params.certPem,
      keyPem: params.keyPem,
      hosts: params.hosts,
      expiresAtMs: now + this.leafCacheTtlMs,
      lastUsedAtMs: now,
    });

    while (this.leafCache.size > this.leafCacheMaxEntries) {
      let oldestKey;
      let oldestLastUsed = Number.POSITIVE_INFINITY;
      for (const [cacheKey, entry] of this.leafCache.entries()) {
        if (entry.lastUsedAtMs < oldestLastUsed) {
          oldestKey = cacheKey;
          oldestLastUsed = entry.lastUsedAtMs;
        }
      }
      if (!oldestKey) {
        break;
      }
      this.leafCache.delete(oldestKey);
    }
  }
}

export default CA;
