// @ts-nocheck
import FS from "fs";
import path from "path";
import { isIP } from "net";
import Forge from "node-forge";
const { pki, md } = Forge;
import async from "async";
import { parse as parseDomain } from "tldts";

type ErrnoException = NodeJS.ErrnoException;

const DEFAULT_SSL_CA_DIR = path.resolve(process.cwd(), ".http-mitm-proxy");
const DEFAULT_LEAF_CACHE_MAX_ENTRIES = 1000;
const DEFAULT_LEAF_CACHE_TTL_MS = 3_600_000;

const CAattrs = [
  {
    name: "commonName",
    value: "NodeMITMProxyCA",
  },
  {
    name: "countryName",
    value: "Internet",
  },
  {
    shortName: "ST",
    value: "Internet",
  },
  {
    name: "localityName",
    value: "Internet",
  },
  {
    name: "organizationName",
    value: "Node MITM Proxy CA",
  },
  {
    shortName: "OU",
    value: "CA",
  },
];

const CAextensions = [
  {
    name: "basicConstraints",
    cA: true,
  },
  {
    name: "keyUsage",
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true,
  },
  {
    name: "extKeyUsage",
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true,
  },
  {
    name: "nsCertType",
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true,
  },
  {
    name: "subjectKeyIdentifier",
  },
];

const ServerAttrs = [
  {
    name: "countryName",
    value: "Internet",
  },
  {
    shortName: "ST",
    value: "Internet",
  },
  {
    name: "localityName",
    value: "Internet",
  },
  {
    name: "organizationName",
    value: "Node MITM Proxy CA",
  },
  {
    shortName: "OU",
    value: "Node MITM Proxy Server Certificate",
  },
];

const ServerExtensions = [
  {
    name: "basicConstraints",
    cA: false,
  },
  {
    name: "keyUsage",
    keyCertSign: false,
    digitalSignature: true,
    nonRepudiation: false,
    keyEncipherment: true,
    dataEncipherment: true,
  },
  {
    name: "extKeyUsage",
    serverAuth: true,
    clientAuth: true,
    codeSigning: false,
    emailProtection: false,
    timeStamping: false,
  },
  {
    name: "nsCertType",
    client: true,
    server: true,
    email: false,
    objsign: false,
    sslCA: false,
    emailCA: false,
    objCA: false,
  },
  {
    name: "subjectKeyIdentifier",
  },
] as any[];

export class CA {
  baseCAFolder!: string;
  certsFolder!: string;
  keysFolder!: string;
  CAcert!: ReturnType<typeof Forge.pki.createCertificate>;
  CAkeys!: ReturnType<typeof Forge.pki.rsa.generateKeyPair>;
  rootStorage = "disk";
  leafStorage = "disk";
  leafWildcard = "registrable_domain";
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
    // generate random 16 bytes hex string
    let sn = "";
    for (let i = 0; i < 4; i++) {
      sn += `00000000${Math.floor(Math.random() * 256 ** 4).toString(
        16
      )}`.slice(-8);
    }
    return sn;
  }

  getPem() {
    return pki.certificateToPem(this.CAcert);
  }

  getStorage() {
    return this.rootStorage;
  }

  generateCA(
    callback: (
      err?: ErrnoException | null | undefined,
      results?: unknown[] | undefined
    ) => void
  ) {
    const self = this;
    pki.rsa.generateKeyPair({ bits: 2048 }, (err, keys) => {
      if (err) {
        return callback(err);
      }
      const cert = pki.createCertificate();
      cert.publicKey = keys.publicKey;
      cert.serialNumber = self.randomSerialNumber();
      cert.validity.notBefore = new Date();
      cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1);
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(
        cert.validity.notBefore.getFullYear() + 1
      );
      cert.setSubject(CAattrs);
      cert.setIssuer(CAattrs);
      cert.setExtensions(CAextensions);
      cert.sign(keys.privateKey, md.sha256.create());
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
          pki.certificateToPem(cert)
        ),
        FS.writeFile.bind(
          null,
          path.join(self.keysFolder, "ca.private.key"),
          pki.privateKeyToPem(keys.privateKey)
        ),
        FS.writeFile.bind(
          null,
          path.join(self.keysFolder, "ca.public.key"),
          pki.publicKeyToPem(keys.publicKey)
        ),
      ];
      async.parallel(tasks, callback);
    });
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
        self.CAcert = pki.certificateFromPem(results!.certPEM);
        self.CAkeys = {
          privateKey: pki.privateKeyFromPem(results!.keyPrivatePEM),
          publicKey: pki.publicKeyFromPem(results!.keyPublicPEM),
        };
        return callback();
      }
    );
  }

  generateServerCertificateKeys(hosts: string | string[], cb) {
    const self = this;
    if (typeof hosts === "string") {
      hosts = [hosts];
    }
    const mainHost = hosts[0];
    const keysServer = pki.rsa.generateKeyPair(2048);
    const certServer = pki.createCertificate();
    certServer.publicKey = keysServer.publicKey;
    certServer.serialNumber = this.randomSerialNumber();
    certServer.validity.notBefore = new Date();
    certServer.validity.notBefore.setDate(
      certServer.validity.notBefore.getDate() - 1
    );
    certServer.validity.notAfter = new Date();
    certServer.validity.notAfter.setFullYear(
      certServer.validity.notBefore.getFullYear() + 1
    );
    const attrsServer = ServerAttrs.slice(0);
    attrsServer.unshift({
      name: "commonName",
      value: mainHost,
    });
    certServer.setSubject(attrsServer);
    certServer.setIssuer(this.CAcert.issuer.attributes);
    certServer.setExtensions(
      ServerExtensions.concat([
        {
          name: "subjectAltName",
          altNames: hosts.map((host) => {
            if (host.match(/^[\d.]+$/)) {
              return { type: 7, ip: host };
            }
            return { type: 2, value: host };
          }),
        },
      ])
    );
    certServer.sign(this.CAkeys.privateKey, md.sha256.create());
    const certPem = pki.certificateToPem(certServer);
    const keyPrivatePem = pki.privateKeyToPem(keysServer.privateKey);
    const keyPublicPem = pki.publicKeyToPem(keysServer.publicKey);
    if (this.leafStorage === "disk") {
      FS.writeFile(
        `${this.certsFolder}/${mainHost.replace(/\*/g, "_")}.pem`,
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
        `${this.keysFolder}/${mainHost.replace(/\*/g, "_")}.key`,
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
        `${this.keysFolder}/${mainHost.replace(/\*/g, "_")}.public.key`,
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
        cacheKey: this.getLeafCertificateIdentity(mainHost).cacheKey,
        certPem,
        keyPem: keyPrivatePem,
        hosts,
      });
    }
    // returns synchronously even before files get written to disk
    cb(certPem, keyPrivatePem);
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
      cacheKey: `wildcard:${domain}`,
      fileName: `_.${domain}`,
      hosts: [domain, `*.${domain}`],
    };
  }

  getExactLeafCertificateIdentity(hostname) {
    return {
      cacheKey: `host:${hostname}`,
      fileName: hostname.replace(/\*/g, "_"),
      hosts: [hostname],
    };
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
