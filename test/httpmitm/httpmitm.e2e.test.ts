import assert from 'node:assert';
import { once } from 'node:events';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import https from 'node:https';
import type { AddressInfo } from 'node:net';
import net from 'node:net';
import path from 'node:path';
import tls from 'node:tls';
import {
  X509Certificate as NodeX509Certificate,
  webcrypto
} from 'node:crypto';
import test from 'node:test';
import {
  brotliCompressSync,
  brotliDecompressSync,
  deflateSync,
  gunzipSync,
  gzipSync,
  inflateSync,
  zstdCompressSync,
  zstdDecompressSync
} from 'node:zlib';
import Forge from 'node-forge';
import 'reflect-metadata';
import {
  BasicConstraintsExtension,
  KeyUsageFlags,
  KeyUsagesExtension,
  SubjectKeyIdentifierExtension,
  X509CertificateGenerator,
  cryptoProvider
} from '@peculiar/x509';
import WebSocket, { WebSocketServer } from 'ws';

import { HTTPMITM } from '../../src';
import type { httpmitm_start_params_t } from '../../src';

type http_server_result_t = {
  server: http.Server;
  port: number;
};

type https_server_result_t = {
  server: https.Server;
  port: number;
};

type http_proxy_request_result_t = {
  status_code: number;
  headers: IncomingMessage['headers'];
  raw_body: Buffer;
  body: string;
};

type root_ca_material_for_test_t = {
  cert_pem: string;
  private_key_pem: string;
  private_key_passphrase?: string;
};

cryptoProvider.set(webcrypto);

function GetCertificatePublicKeyType(params: { cert_pem: string }): string {
  const key_type = new NodeX509Certificate(
    params.cert_pem
  ).publicKey.asymmetricKeyType;
  assert.ok(key_type);
  return key_type;
}

function Delay(params: { ms: number }): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, params.ms);
  });
}

async function WithTimeout<T>(params: {
  promise: Promise<T>;
  label: string;
  timeout_ms?: number;
}): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      params.promise,
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${params.label} timed out.`)),
          params.timeout_ms || 5000
        );
      })
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

class LsbBitReaderForTest {
  private input_data: Buffer;
  private input_index = 0;
  private bit_buffer = 0;
  private bit_count = 0;

  constructor(params: { input_data: Buffer }) {
    this.input_data = params.input_data;
  }

  readCode(params: { bit_width: number }): number | null {
    while (this.bit_count < params.bit_width) {
      if (this.input_index >= this.input_data.length) {
        return null;
      }
      this.bit_buffer |= this.input_data[this.input_index] << this.bit_count;
      this.input_index += 1;
      this.bit_count += 8;
    }

    const mask = (1 << params.bit_width) - 1;
    const code = this.bit_buffer & mask;
    this.bit_buffer >>>= params.bit_width;
    this.bit_count -= params.bit_width;
    return code;
  }
}

function DecodeUnixCompressForTest(params: { encoded_data: Buffer }): Buffer {
  assert.ok(params.encoded_data.length >= 3);
  assert.equal(params.encoded_data[0], 0x1f);
  assert.equal(params.encoded_data[1], 0x9d);

  const flags = params.encoded_data[2];
  const block_mode = (flags & 0x80) !== 0;
  const max_bits = flags & 0x1f;
  assert.ok(max_bits >= 9 && max_bits <= 16);

  const max_code_value = 1 << max_bits;
  const clear_code = 256;
  let next_code = block_mode ? clear_code + 1 : 256;
  let bit_width = 9;
  let max_code_for_width = (1 << bit_width) - 1;

  const prefix = new Int32Array(max_code_value);
  const suffix = new Uint8Array(max_code_value);
  prefix.fill(-1);
  for (let code = 0; code < 256; code += 1) {
    suffix[code] = code;
  }

  const reader = new LsbBitReaderForTest({
    input_data: params.encoded_data.subarray(3)
  });
  const first_code = reader.readCode({ bit_width });
  if (first_code === null) {
    return Buffer.alloc(0);
  }
  assert.ok(first_code <= 255);

  const output_bytes: number[] = [first_code];
  let previous_code = first_code;
  let previous_first_byte = first_code;
  const decode_stack = new Uint8Array(max_code_value);

  while (true) {
    const current_code_value = reader.readCode({ bit_width });
    if (current_code_value === null) {
      break;
    }

    if (block_mode && current_code_value === clear_code) {
      bit_width = 9;
      max_code_for_width = (1 << bit_width) - 1;
      next_code = clear_code + 1;
      const reset_code = reader.readCode({ bit_width });
      if (reset_code === null) {
        break;
      }
      assert.ok(reset_code <= 255);
      output_bytes.push(reset_code);
      previous_code = reset_code;
      previous_first_byte = reset_code;
      continue;
    }

    let current_code = current_code_value;
    let stack_length = 0;

    if (current_code >= next_code) {
      decode_stack[stack_length] = previous_first_byte;
      stack_length += 1;
      current_code = previous_code;
    }

    while (current_code > 255) {
      assert.ok(current_code < max_code_value);
      assert.ok(prefix[current_code] >= 0);
      decode_stack[stack_length] = suffix[current_code];
      stack_length += 1;
      current_code = prefix[current_code];
    }

    const first_decoded_byte = current_code;
    decode_stack[stack_length] = first_decoded_byte;
    stack_length += 1;

    for (let index = stack_length - 1; index >= 0; index -= 1) {
      output_bytes.push(decode_stack[index]);
    }

    if (next_code < max_code_value) {
      prefix[next_code] = previous_code;
      suffix[next_code] = first_decoded_byte;
      next_code += 1;

      if (next_code > max_code_for_width && bit_width < max_bits) {
        bit_width += 1;
        max_code_for_width = (1 << bit_width) - 1;
      }
    }

    previous_code = current_code_value;
    previous_first_byte = first_decoded_byte;
  }

  return Buffer.from(output_bytes);
}

async function StartHttpServer(params: {
  handler: (request: IncomingMessage, response: ServerResponse) => void;
}): Promise<http_server_result_t> {
  const server = http.createServer(params.handler);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  return {
    server,
    port: (server.address() as AddressInfo).port
  };
}

async function CloseHttpServer(params: {
  server: http.Server | https.Server;
}): Promise<void> {
  await new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) {
        return;
      }
      resolved = true;
      clearTimeout(timeout);
      resolve();
    };
    const timeout = setTimeout(() => {
      params.server.closeAllConnections?.();
      params.server.closeIdleConnections?.();
      finish();
    }, 5000);
    params.server.close(() => finish());
    setImmediate(() => {
      params.server.closeIdleConnections?.();
      params.server.closeAllConnections?.();
    });
  });
}

function GenerateSelfSignedCertificate(): { key: string; cert: string } {
  const keys = Forge.pki.rsa.generateKeyPair(2048);
  const cert = Forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setSubject([{ name: 'commonName', value: '127.0.0.1' }]);
  cert.setIssuer([{ name: 'commonName', value: '127.0.0.1' }]);
  cert.setExtensions([
    {
      name: 'subjectAltName',
      altNames: [
        { type: 2, value: 'localhost' },
        { type: 7, ip: '127.0.0.1' }
      ]
    }
  ]);
  cert.sign(keys.privateKey, Forge.md.sha256.create());
  return {
    key: Forge.pki.privateKeyToPem(keys.privateKey),
    cert: Forge.pki.certificateToPem(cert)
  };
}

function PemFromDerForTest(params: {
  label: string;
  data: ArrayBuffer;
}): string {
  const base64 = Buffer.from(params.data).toString('base64');
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${params.label}-----\n${lines.join('\n')}\n-----END ${params.label}-----\n`;
}

function GenerateForgeRootCaMaterial(params?: {
  private_key_passphrase?: string;
}): root_ca_material_for_test_t {
  const keys = Forge.pki.rsa.generateKeyPair(2048);
  const cert = Forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '03';
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setSubject([
    { name: 'commonName', value: 'HTTPMITM Supplied Root CA' },
    { name: 'countryName', value: 'Internet' },
    { shortName: 'ST', value: 'Internet' },
    { name: 'localityName', value: 'Internet' },
    { name: 'organizationName', value: 'HTTPMITM Test CA' },
    { shortName: 'OU', value: 'CA' }
  ]);
  cert.setIssuer(cert.subject.attributes);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true, critical: true },
    {
      name: 'keyUsage',
      keyCertSign: true,
      cRLSign: true,
      digitalSignature: true,
      critical: true
    },
    { name: 'subjectKeyIdentifier' }
  ]);
  cert.sign(keys.privateKey, Forge.md.sha256.create());

  return {
    cert_pem: Forge.pki.certificateToPem(cert),
    private_key_pem:
      typeof params?.private_key_passphrase === 'string'
        ? Forge.pki.encryptRsaPrivateKey(
            keys.privateKey,
            params.private_key_passphrase
          )
        : Forge.pki.privateKeyToPem(keys.privateKey),
    private_key_passphrase: params?.private_key_passphrase
  };
}

async function GenerateEcdsaRootCaMaterial(): Promise<root_ca_material_for_test_t> {
  const keys = await webcrypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256'
    },
    true,
    ['sign', 'verify']
  );
  const not_before = new Date();
  not_before.setDate(not_before.getDate() - 1);
  const not_after = new Date();
  not_after.setFullYear(not_before.getFullYear() + 1);
  const cert = await X509CertificateGenerator.createSelfSigned({
    serialNumber: randomSerialNumberForTest(),
    name: 'CN=HTTPMITM Supplied ECDSA Root CA,C=Internet,ST=Internet,L=Internet,O=HTTPMITM Test CA,OU=CA',
    keys,
    notBefore: not_before,
    notAfter: not_after,
    extensions: [
      new BasicConstraintsExtension(true, undefined, true),
      new KeyUsagesExtension(
        KeyUsageFlags.keyCertSign |
          KeyUsageFlags.cRLSign |
          KeyUsageFlags.digitalSignature,
        true
      ),
      await SubjectKeyIdentifierExtension.create(keys.publicKey)
    ]
  });

  return {
    cert_pem: cert.toString('pem'),
    private_key_pem: PemFromDerForTest({
      label: 'PRIVATE KEY',
      data: await webcrypto.subtle.exportKey('pkcs8', keys.privateKey)
    })
  };
}

function randomSerialNumberForTest(): string {
  return `${Date.now().toString(16)}${Math.floor(Math.random() * 0xffffffff)
    .toString(16)
    .padStart(8, '0')}`;
}

function WriteLegacyForgeRootCa(params: { ssl_ca_dir: string }): void {
  const certs_dir = path.join(params.ssl_ca_dir, 'certs');
  const keys_dir = path.join(params.ssl_ca_dir, 'keys');
  mkdirSync(certs_dir, { recursive: true });
  mkdirSync(keys_dir, { recursive: true });

  const keys = Forge.pki.rsa.generateKeyPair(2048);
  const cert = Forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '02';
  cert.validity.notBefore = new Date();
  cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1);
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  cert.setSubject([
    { name: 'commonName', value: 'NodeMITMProxyCA' },
    { name: 'countryName', value: 'Internet' },
    { shortName: 'ST', value: 'Internet' },
    { name: 'localityName', value: 'Internet' },
    { name: 'organizationName', value: 'Node MITM Proxy CA' },
    { shortName: 'OU', value: 'CA' }
  ]);
  cert.setIssuer(cert.subject.attributes);
  cert.setExtensions([
    { name: 'basicConstraints', cA: true, critical: true },
    {
      name: 'keyUsage',
      keyCertSign: true,
      cRLSign: true,
      digitalSignature: true,
      critical: true
    },
    { name: 'subjectKeyIdentifier' }
  ]);
  cert.sign(keys.privateKey, Forge.md.sha256.create());

  writeFileSync(path.join(certs_dir, 'ca.pem'), Forge.pki.certificateToPem(cert));
  writeFileSync(
    path.join(keys_dir, 'ca.private.key'),
    Forge.pki.privateKeyToPem(keys.privateKey)
  );
  writeFileSync(
    path.join(keys_dir, 'ca.public.key'),
    Forge.pki.publicKeyToPem(keys.publicKey)
  );
}

async function StartHttpsServer(params: {
  handler: (request: IncomingMessage, response: ServerResponse) => void;
}): Promise<https_server_result_t> {
  const tls_options = GenerateSelfSignedCertificate();
  const server = https.createServer(tls_options, params.handler);
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve());
  });

  return {
    server,
    port: (server.address() as AddressInfo).port
  };
}

async function SendHttpsConnectRequestViaProxy(params: {
  proxy_port: number;
  target_port: number;
  ca_cert_path?: string;
  ca_cert_pem?: string;
  connect_host?: string;
  servername?: string;
  request_host?: string;
  path: string;
}): Promise<http_proxy_request_result_t> {
  const connect_host = params.connect_host || 'localhost';
  const requested_servername = params.servername || connect_host;
  const servername = net.isIP(requested_servername)
    ? undefined
    : requested_servername;
  const check_server_identity = net.isIP(requested_servername)
    ? (_host: string, cert: tls.PeerCertificate) =>
        tls.checkServerIdentity(requested_servername, cert)
    : undefined;
  const request_host = params.request_host || 'localhost';
  const socket = net.connect({
    host: '127.0.0.1',
    port: params.proxy_port
  });
  await WithTimeout({
    promise: once(socket, 'connect'),
    label: `CONNECT socket to proxy for ${connect_host}`
  });

  socket.write(
    [
      `CONNECT ${connect_host}:${params.target_port} HTTP/1.1`,
      `Host: ${connect_host}:${params.target_port}`,
      '',
      ''
    ].join('\r\n')
  );

  let connect_response = Buffer.alloc(0);
  while (!connect_response.includes(Buffer.from('\r\n\r\n'))) {
    const [chunk] = (await WithTimeout({
      promise: once(socket, 'data'),
      label: `CONNECT response for ${connect_host}`
    })) as [Buffer];
    connect_response = Buffer.concat([connect_response, chunk]);
  }
  assert.match(connect_response.toString('utf8'), /^HTTP\/1\.1 200 OK/);

  const tls_options: tls.ConnectionOptions = {
    socket,
    servername,
    ca:
      typeof params.ca_cert_pem === 'string'
        ? Buffer.from(params.ca_cert_pem)
        : readFileSync(params.ca_cert_path || ''),
    rejectUnauthorized: true
  };
  if (check_server_identity) {
    tls_options.checkServerIdentity = check_server_identity;
  }
  const tls_socket = tls.connect(tls_options);
  await WithTimeout({
    promise: once(tls_socket, 'secureConnect'),
    label: `TLS secureConnect for ${requested_servername}`
  });

  tls_socket.write(
    [
      `GET ${params.path} HTTP/1.1`,
      `Host: ${request_host}:${params.target_port}`,
      'Connection: close',
      '',
      ''
    ].join('\r\n')
  );

  const response_chunks: Buffer[] = [];
  tls_socket.on('data', (chunk) => {
    response_chunks.push(Buffer.from(chunk));
  });
  await WithTimeout({
    promise: once(tls_socket, 'end'),
    label: `TLS response end for ${requested_servername}`
  });

  const raw_response = Buffer.concat(response_chunks);
  const response_text = raw_response.toString('utf8');
  const header_end = response_text.indexOf('\r\n\r\n');
  const header_text = response_text.slice(0, header_end);
  const body = response_text.slice(header_end + 4);
  const status_code = Number(header_text.match(/^HTTP\/\d\.\d\s+(\d+)/)?.[1]);

  return {
    status_code,
    headers: {},
    raw_body: Buffer.from(body),
    body
  };
}

async function CloseWebSocketServer(params: {
  websocket_server: WebSocketServer;
}): Promise<void> {
  await new Promise<void>((resolve) => {
    params.websocket_server.close(() => resolve());
  });
}

async function CloseGeneratedSslServers(params: {
  proxy: Awaited<ReturnType<HTTPMITM['start']>>['proxy'];
}): Promise<void> {
  const servers = new Set(
    Object.values(params.proxy.sslServers)
      .map((ssl_server) => ssl_server.server)
      .filter((server): server is https.Server => typeof server !== 'undefined')
  );
  const websocket_servers = new Set(
    Object.values(params.proxy.sslServers)
      .map((ssl_server) => ssl_server.wsServer)
      .filter(
        (websocket_server): websocket_server is WebSocketServer =>
          typeof websocket_server !== 'undefined'
      )
  );

  await Promise.all([
    ...[...websocket_servers].map(
      (websocket_server) =>
        new Promise<void>((resolve) => {
          websocket_server.close(() => resolve());
        })
    ),
    ...[...servers].map(
      (server) =>
        new Promise<void>((resolve) => {
          server.close(() => resolve());
        })
    )
  ]);
  params.proxy.sslServers = {};
}

function CreateSslCaDir(params: { test_name: string }): string {
  const safe_test_name = params.test_name.replace(/[^a-zA-Z0-9]/g, '_');
  return path.join('/tmp', `httpmitm_${safe_test_name}_${Date.now()}`);
}

async function WaitForPath(params: { file_path: string }): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (existsSync(params.file_path)) {
      return;
    }
    await Delay({ ms: 25 });
  }
  assert.ok(existsSync(params.file_path), `${params.file_path} should exist`);
}

async function StartHttpMitm(params: {
  start_params: httpmitm_start_params_t;
}): Promise<Awaited<ReturnType<HTTPMITM['start']>> & { httpmitm: HTTPMITM }> {
  const httpmitm = new HTTPMITM();
  const server = await httpmitm.start(params.start_params);
  return {
    ...server,
    httpmitm
  };
}

async function SendHttpRequestViaProxy(params: {
  proxy_port: number;
  target_port: number;
  method: string;
  path: string;
  body?: string | Buffer;
  headers?: Record<string, string>;
}): Promise<http_proxy_request_result_t> {
  return new Promise((resolve, reject) => {
    const request_body =
      typeof params.body === 'undefined'
        ? Buffer.alloc(0)
        : Buffer.isBuffer(params.body)
          ? params.body
          : Buffer.from(params.body);
    const request_headers: Record<string, string> = {
      host: `127.0.0.1:${params.target_port}`,
      ...params.headers
    };

    if (request_body.length > 0 && !request_headers['content-length']) {
      request_headers['content-length'] = String(request_body.length);
    }

    const request = http.request(
      {
        host: '127.0.0.1',
        port: params.proxy_port,
        method: params.method,
        path: `http://127.0.0.1:${params.target_port}${params.path}`,
        headers: request_headers
      },
      (response) => {
        const response_chunks: Buffer[] = [];
        response.on('data', (chunk) => {
          response_chunks.push(Buffer.from(chunk));
        });
        response.on('end', () => {
          const raw_body = Buffer.concat(response_chunks);
          resolve({
            status_code: response.statusCode || 0,
            headers: response.headers,
            raw_body,
            body: raw_body.toString('utf8')
          });
        });
      }
    );

    request.on('error', (error) => reject(error));

    if (request_body.length > 0) {
      request.write(request_body);
    }

    request.end();
  });
}

async function SendHttpRequestViaProxyAllowError(params: {
  proxy_port: number;
  target_port: number;
  method: string;
  path: string;
  body?: string | Buffer;
}): Promise<{
  response: http_proxy_request_result_t | null;
  error: Error | null;
}> {
  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: params.proxy_port,
      target_port: params.target_port,
      method: params.method,
      path: params.path,
      body: params.body
    });
    return { response, error: null };
  } catch (error) {
    return { response: null, error: error as Error };
  }
}

test('HTTP requestData callback blocks forwarding until callback resolves', async () => {
  let upstream_received_at_ms = 0;
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const body_chunks: Buffer[] = [];
      request.on('data', (chunk) => body_chunks.push(Buffer.from(chunk)));
      request.on('end', () => {
        upstream_received_at_ms = Date.now();
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.end(Buffer.concat(body_chunks).toString('utf8'));
      });
    }
  });

  let callback_resolved_at_ms = 0;
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'blocking' }),
      http: {
        client_to_server: {
          requestData: async () => {
            await Delay({ ms: 150 });
            callback_resolved_at_ms = Date.now();
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'POST',
      path: '/blocking',
      body: 'blocking-test'
    });

    assert.equal(response.status_code, 200);
    assert.equal(response.body, 'blocking-test');
    assert.ok(callback_resolved_at_ms > 0);
    assert.ok(upstream_received_at_ms >= callback_resolved_at_ms);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP PASSTHROUGH keeps request/response unchanged', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const body_chunks: Buffer[] = [];
      request.on('data', (chunk) => body_chunks.push(Buffer.from(chunk)));
      request.on('end', () => {
        response.writeHead(200, {
          'content-type': 'text/plain',
          'x-upstream': 'present'
        });
        response.end(Buffer.concat(body_chunks).toString('utf8'));
      });
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'passthrough' }),
      http: {
        client_to_server: {
          requestHeaders: async () => ({ state: 'PASSTHROUGH' }),
          requestData: async () => ({ state: 'PASSTHROUGH' })
        },
        server_to_client: {
          responseHeaders: async () => ({ state: 'PASSTHROUGH' }),
          responseData: async () => ({ state: 'PASSTHROUGH' })
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'POST',
      path: '/passthrough',
      body: 'hello world',
      headers: { 'x-client': 'present' }
    });

    assert.equal(response.status_code, 200);
    assert.equal(response.body, 'hello world');
    assert.equal(response.headers['x-upstream'], 'present');
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP TERMINATE aborts the connection', async () => {
  let upstream_request_count = 0;
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      upstream_request_count += 1;
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('unexpected');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'terminate' }),
      http: {
        client_to_server: {
          requestHeaders: async () => ({ state: 'TERMINATE' })
        }
      }
    }
  });

  try {
    const result = await SendHttpRequestViaProxyAllowError({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/terminate'
    });

    await Delay({ ms: 75 });
    assert.equal(result.response, null);
    assert.ok(result.error);
    assert.equal(upstream_request_count, 0);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP MODIFIED updates body, headers, and recalculates content-length', async () => {
  let upstream_request_body = '';
  let upstream_content_length = '';

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const body_chunks: Buffer[] = [];
      request.on('data', (chunk) => body_chunks.push(Buffer.from(chunk)));
      request.on('end', () => {
        upstream_request_body = Buffer.concat(body_chunks).toString('utf8');
        upstream_content_length = String(
          request.headers['content-length'] || ''
        );

        response.writeHead(200, {
          'content-type': 'text/plain',
          'content-length': String(Buffer.byteLength('upstream-response')),
          'x-upstream': 'true'
        });
        response.end('upstream-response');
      });
    }
  });

  const modified_request_body = 'request-modified';
  const modified_response_body = 'response-modified';

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'modified' }),
      http: {
        client_to_server: {
          requestData: async () => ({
            state: 'MODIFIED',
            headers: [{ name: 'x-request-modified', value: 'true' }],
            data: modified_request_body
          })
        },
        server_to_client: {
          responseHeaders: async () => ({
            state: 'MODIFIED',
            headers: [{ name: 'x-response-modified', value: 'true' }]
          }),
          responseData: async () => ({
            state: 'MODIFIED',
            data: modified_response_body
          })
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'POST',
      path: '/modified',
      body: 'original-request'
    });

    assert.equal(upstream_request_body, modified_request_body);
    assert.equal(
      upstream_content_length,
      String(Buffer.byteLength(modified_request_body))
    );

    assert.equal(response.status_code, 200);
    assert.equal(response.body, modified_response_body);
    assert.equal(response.headers['x-response-modified'], 'true');
    assert.equal(
      response.headers['content-length'],
      String(Buffer.byteLength(modified_response_body))
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP responseData decodes gzip for callback and re-encodes after modification', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      const compressed_body = gzipSync(
        Buffer.from('gzip-upstream-body', 'utf8')
      );
      response.writeHead(200, {
        'content-type': 'text/plain',
        'content-encoding': 'gzip',
        'content-length': String(compressed_body.length)
      });
      response.end(compressed_body);
    }
  });

  let callback_saw_decoded_text = '';

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'gzip_decode_encode' }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            callback_saw_decoded_text = context.decoded_data.toString('utf8');
            assert.equal(context.data.toString('utf8'), 'gzip-upstream-body');
            assert.equal(context.content_encoding, 'gzip');
            assert.deepEqual(context.content_encodings, ['gzip']);
            assert.equal(context.data_is_decoded, true);
            assert.equal(context.decode_error, null);
            return {
              state: 'MODIFIED',
              data: 'gzip-modified-body'
            };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/gzip'
    });

    assert.equal(callback_saw_decoded_text, 'gzip-upstream-body');
    assert.equal(response.headers['content-encoding'], 'gzip');
    assert.equal(
      response.headers['content-length'],
      String(response.raw_body.length)
    );
    assert.equal(
      gunzipSync(response.raw_body).toString('utf8'),
      'gzip-modified-body'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP responseData supports x-gzip and x-deflate aliases', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      if (request.url === '/x-gzip') {
        const compressed_body = gzipSync(
          Buffer.from('x-gzip-upstream', 'utf8')
        );
        response.writeHead(200, {
          'content-type': 'text/plain',
          'content-encoding': 'x-gzip',
          'content-length': String(compressed_body.length)
        });
        response.end(compressed_body);
        return;
      }

      const compressed_body = deflateSync(
        Buffer.from('x-deflate-upstream', 'utf8')
      );
      response.writeHead(200, {
        'content-type': 'text/plain',
        'content-encoding': 'x-deflate',
        'content-length': String(compressed_body.length)
      });
      response.end(compressed_body);
    }
  });

  const seen_content_encodings: string[] = [];

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'x_encoding_aliases' }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            seen_content_encodings.push(context.content_encoding || '');
            if (context.content_encoding === 'x-gzip') {
              assert.equal(context.data.toString('utf8'), 'x-gzip-upstream');
              return {
                state: 'MODIFIED',
                data: 'x-gzip-modified'
              };
            }

            assert.equal(context.content_encoding, 'x-deflate');
            assert.equal(context.data.toString('utf8'), 'x-deflate-upstream');
            return {
              state: 'MODIFIED',
              data: 'x-deflate-modified'
            };
          }
        }
      }
    }
  });

  try {
    const gzip_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/x-gzip'
    });
    assert.equal(gzip_response.headers['content-encoding'], 'x-gzip');
    assert.equal(
      gunzipSync(gzip_response.raw_body).toString('utf8'),
      'x-gzip-modified'
    );

    const deflate_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/x-deflate'
    });
    assert.equal(deflate_response.headers['content-encoding'], 'x-deflate');
    assert.equal(
      inflateSync(deflate_response.raw_body).toString('utf8'),
      'x-deflate-modified'
    );

    assert.deepEqual(seen_content_encodings.sort(), ['x-deflate', 'x-gzip']);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP responseData supports zstd encoding decode and re-encode', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      const encoded_body = zstdCompressSync(
        Buffer.from('zstd-upstream-body', 'utf8')
      );
      response.writeHead(200, {
        'content-type': 'text/plain',
        'content-encoding': 'zstd',
        'content-length': String(encoded_body.length)
      });
      response.end(encoded_body);
    }
  });

  let callback_saw_data = '';

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'zstd_decode_encode' }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            callback_saw_data = context.data.toString('utf8');
            assert.equal(context.content_encoding, 'zstd');
            return {
              state: 'MODIFIED',
              data: 'zstd-modified-body'
            };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/zstd'
    });

    assert.equal(callback_saw_data, 'zstd-upstream-body');
    assert.equal(response.headers['content-encoding'], 'zstd');
    const decoded_response_body = zstdDecompressSync(response.raw_body).toString(
      'utf8'
    );
    assert.equal(decoded_response_body, 'zstd-modified-body');
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP requestData decodes brotli for callback and re-encodes after modification', async () => {
  let upstream_content_encoding = '';
  let upstream_decoded_body = '';

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const request_chunks: Buffer[] = [];
      request.on('data', (chunk) => request_chunks.push(Buffer.from(chunk)));
      request.on('end', () => {
        const request_body_raw = Buffer.concat(request_chunks);
        upstream_content_encoding = String(
          request.headers['content-encoding'] || ''
        );
        upstream_decoded_body =
          brotliDecompressSync(request_body_raw).toString('utf8');
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.end('ok');
      });
    }
  });

  let callback_saw_decoded_request = '';

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'brotli_decode_encode' }),
      http: {
        client_to_server: {
          requestData: async ({ context }) => {
            callback_saw_decoded_request =
              context.decoded_data.toString('utf8');
            assert.equal(context.content_encoding, 'br');
            assert.deepEqual(context.content_encodings, ['br']);
            assert.equal(context.data_is_decoded, true);
            assert.equal(context.decode_error, null);
            return {
              state: 'MODIFIED',
              data: 'brotli-modified-request'
            };
          }
        }
      }
    }
  });

  try {
    const original_request_body = Buffer.from(
      'brotli-original-request',
      'utf8'
    );
    const compressed_request_body = brotliCompressSync(original_request_body);

    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'POST',
      path: '/brotli',
      body: compressed_request_body,
      headers: {
        'content-encoding': 'br',
        'content-length': String(compressed_request_body.length)
      }
    });

    assert.equal(response.status_code, 200);
    assert.equal(callback_saw_decoded_request, 'brotli-original-request');
    assert.equal(upstream_content_encoding, 'br');
    assert.equal(upstream_decoded_body, 'brotli-modified-request');
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP responseData supports compress and x-compress encoding', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      response.writeHead(200, {
        'content-type': 'text/plain'
      });
      response.end(
        request.url === '/x-compress' ? 'x-compress-origin' : 'compress-origin'
      );
    }
  });

  const seen_encodings: string[] = [];

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'compress_xcompress' }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            if (context.request.url === '/x-compress') {
              seen_encodings.push('x-compress');
              return {
                state: 'MODIFIED',
                headers: [{ name: 'content-encoding', value: 'x-compress' }],
                data: 'x-compress-modified'
              };
            }
            seen_encodings.push('compress');
            return {
              state: 'MODIFIED',
              headers: [{ name: 'content-encoding', value: 'compress' }],
              data: 'compress-modified'
            };
          }
        }
      }
    }
  });

  try {
    const compress_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/compress'
    });
    assert.equal(compress_response.headers['content-encoding'], 'compress');
    assert.equal(compress_response.raw_body[0], 0x1f);
    assert.equal(compress_response.raw_body[1], 0x9d);
    const compress_decoded = DecodeUnixCompressForTest({
      encoded_data: compress_response.raw_body
    }).toString('utf8');
    assert.equal(compress_decoded, 'compress-modified');

    const x_compress_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/x-compress'
    });
    assert.equal(x_compress_response.headers['content-encoding'], 'x-compress');
    assert.equal(x_compress_response.raw_body[0], 0x1f);
    assert.equal(x_compress_response.raw_body[1], 0x9d);
    const x_compress_decoded = DecodeUnixCompressForTest({
      encoded_data: x_compress_response.raw_body
    }).toString('utf8');
    assert.equal(x_compress_decoded, 'x-compress-modified');

    assert.deepEqual(seen_encodings.sort(), ['compress', 'x-compress']);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP responseData passes through unsupported and corrupt content-encoding bodies', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      if (request.url === '/unsupported') {
        response.writeHead(200, {
          'content-type': 'text/plain',
          'content-encoding': 'rot13'
        });
        response.end('unsupported-encoded-body');
        return;
      }

      response.writeHead(200, {
        'content-type': 'text/plain',
        'content-encoding': 'gzip'
      });
      response.end('not-a-valid-gzip-body');
    }
  });

  const decode_errors: Record<string, string> = {};
  const callback_data: Record<string, string> = {};
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'encoding_decode_errors' }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            const url = context.request.url || '';
            decode_errors[url] = context.decode_error || '';
            callback_data[url] = context.data.toString('utf8');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const unsupported_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/unsupported'
    });
    const corrupt_response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/corrupt-gzip'
    });

    assert.equal(unsupported_response.status_code, 200);
    assert.equal(unsupported_response.body, 'unsupported-encoded-body');
    assert.equal(callback_data['/unsupported'], 'unsupported-encoded-body');
    assert.match(
      decode_errors['/unsupported'],
      /Unsupported content-encoding: rot13/
    );

    assert.equal(corrupt_response.status_code, 200);
    assert.equal(corrupt_response.body, 'not-a-valid-gzip-body');
    assert.equal(callback_data['/corrupt-gzip'], 'not-a-valid-gzip-body');
    assert.ok(decode_errors['/corrupt-gzip'].length > 0);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('WebSocket callbacks can block and modify frame flow', async () => {
  let upstream_received_message = '';
  let upstream_received_at_ms = 0;

  const websocket_server = new WebSocketServer({ host: '127.0.0.1', port: 0 });
  await once(websocket_server, 'listening');
  const websocket_port = (websocket_server.address() as AddressInfo).port;

  websocket_server.on('connection', (socket) => {
    socket.on('message', (message) => {
      upstream_received_message = message.toString();
      upstream_received_at_ms = Date.now();
      socket.send(`upstream:${upstream_received_message}`);
    });
  });

  let frame_sent_resolved_at_ms = 0;
  let on_connection_terminated_called = false;

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'websocket' }),
      websocket: {
        onServerUpgrade: async () => ({ state: 'PASSTHROUGH' }),
        onFrameSent: async () => {
          await Delay({ ms: 100 });
          frame_sent_resolved_at_ms = Date.now();
          return {
            state: 'MODIFIED',
            data: 'client-modified'
          };
        },
        onFrameReceived: async () => ({
          state: 'MODIFIED',
          data: 'proxy-modified-response'
        }),
        onConnectionTerminated: async () => {
          on_connection_terminated_called = true;
        }
      }
    }
  });

  const websocket_client = new WebSocket(
    `ws://127.0.0.1:${mitm_server.listen_port}/socket`,
    {
      headers: {
        host: `127.0.0.1:${websocket_port}`
      }
    }
  );

  try {
    await once(websocket_client, 'open');

    const response_message_promise = new Promise<string>((resolve, reject) => {
      websocket_client.once('message', (message) => {
        resolve(message.toString());
      });
      websocket_client.once('error', (error) => reject(error));
    });

    websocket_client.send('client-original');

    const client_received_message = await response_message_promise;

    assert.equal(upstream_received_message, 'client-modified');
    assert.ok(frame_sent_resolved_at_ms > 0);
    assert.ok(upstream_received_at_ms >= frame_sent_resolved_at_ms);
    assert.equal(client_received_message, 'proxy-modified-response');
  } finally {
    websocket_client.close();
    await once(websocket_client, 'close');
    await Delay({ ms: 50 });

    assert.equal(on_connection_terminated_called, true);

    await mitm_server.close();
    await CloseWebSocketServer({ websocket_server });
  }
});

test('Plugin chain executes in deterministic order and falls through to instance callback after CONTINUE', async () => {
  const execution_order: string[] = [];
  let instance_callback_called = false;

  class PluginOne {
    plugin_name = 'plugin_one';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('plugin_one');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  class PluginTwo {
    plugin_name = 'plugin_two';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('plugin_two');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'plugin_order_continue' }),
      plugins: [new PluginOne(), new PluginTwo()],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push('instance');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/plugin-order'
    });

    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_called, true);
    assert.deepEqual(execution_order, ['plugin_one', 'plugin_two', 'instance']);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('Plugin PASSTHROUGH short-circuits chain and skips instance callback', async () => {
  const execution_order: string[] = [];
  let instance_callback_called = false;

  class ContinuePlugin {
    plugin_name = 'continue_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('continue_plugin');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  class PassthroughPlugin {
    plugin_name = 'passthrough_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('passthrough_plugin');
          return { state: 'PASSTHROUGH' as const };
        }
      }
    };
  }

  class ShouldNotRunPlugin {
    plugin_name = 'should_not_run';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('should_not_run');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({
        test_name: 'plugin_passthrough_shortcircuit'
      }),
      plugins: [
        new ContinuePlugin(),
        new PassthroughPlugin(),
        new ShouldNotRunPlugin()
      ],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push('instance');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/plugin-passthrough'
    });

    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_called, false);
    assert.deepEqual(execution_order, [
      'continue_plugin',
      'passthrough_plugin'
    ]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('Plugin MODIFIED short-circuits chain and skips instance callback', async () => {
  let upstream_header_seen = '';
  let instance_callback_called = false;
  const execution_order: string[] = [];

  class ContinuePlugin {
    plugin_name = 'continue_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('continue_plugin');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  class ModifiedPlugin {
    plugin_name = 'modified_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('modified_plugin');
          return {
            state: 'MODIFIED' as const,
            headers: [{ name: 'x-from-plugin', value: 'true' }]
          };
        }
      }
    };
  }

  class ShouldNotRunPlugin {
    plugin_name = 'should_not_run';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('should_not_run');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      upstream_header_seen = String(request.headers['x-from-plugin'] || '');
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'plugin_modified_shortcircuit' }),
      plugins: [
        new ContinuePlugin(),
        new ModifiedPlugin(),
        new ShouldNotRunPlugin()
      ],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push('instance');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/plugin-modified'
    });

    assert.equal(response.status_code, 200);
    assert.equal(upstream_header_seen, 'true');
    assert.equal(instance_callback_called, false);
    assert.deepEqual(execution_order, ['continue_plugin', 'modified_plugin']);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('Plugin TERMINATE short-circuits chain and aborts connection', async () => {
  let upstream_request_count = 0;
  let instance_callback_called = false;
  const execution_order: string[] = [];

  class ContinuePlugin {
    plugin_name = 'continue_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('continue_plugin');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  class TerminatePlugin {
    plugin_name = 'terminate_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('terminate_plugin');
          return { state: 'TERMINATE' as const };
        }
      }
    };
  }

  class ShouldNotRunPlugin {
    plugin_name = 'should_not_run';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('should_not_run');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      upstream_request_count += 1;
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('unexpected');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({
        test_name: 'plugin_terminate_shortcircuit'
      }),
      plugins: [
        new ContinuePlugin(),
        new TerminatePlugin(),
        new ShouldNotRunPlugin()
      ],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push('instance');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const result = await SendHttpRequestViaProxyAllowError({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/plugin-terminate'
    });
    await Delay({ ms: 75 });

    assert.equal(result.response, null);
    assert.ok(result.error);
    assert.equal(upstream_request_count, 0);
    assert.equal(instance_callback_called, false);
    assert.deepEqual(execution_order, ['continue_plugin', 'terminate_plugin']);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('Plugin missing hook is skipped and all CONTINUE reaches instance callback', async () => {
  const execution_order: string[] = [];
  let instance_callback_called = false;

  class MissingHookPlugin {
    plugin_name = 'missing_hook';
    http = {
      client_to_server: {
        requestData: async () => ({ state: 'CONTINUE' as const })
      }
    };
  }

  class ContinuePlugin {
    plugin_name = 'continue_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          execution_order.push('continue_plugin');
          return { state: 'CONTINUE' as const };
        }
      }
    };
  }

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'plugin_missing_hook_continue' }),
      plugins: [new MissingHookPlugin(), new ContinuePlugin()],
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_called = true;
            execution_order.push('instance');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/plugin-missing-hook'
    });

    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_called, true);
    assert.deepEqual(execution_order, ['continue_plugin', 'instance']);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('Invalid plugin without hooks is rejected with clear error', async () => {
  class InvalidPlugin {
    plugin_name = 'invalid_plugin';
  }

  const httpmitm = new HTTPMITM();
  await assert.rejects(
    async () => {
      await httpmitm.start({
        host: '127.0.0.1',
        listen_port: 0,
        ssl_ca_dir: CreateSslCaDir({ test_name: 'plugin_invalid' }),
        plugins: [new InvalidPlugin()]
      });
    },
    (error: Error) =>
      error.message.includes('must implement at least one callback hook')
  );
});

test('Plugin throw/reject behavior follows callback_error_policy', async () => {
  class ThrowingPlugin {
    plugin_name = 'throwing_plugin';
    http = {
      client_to_server: {
        requestHeaders: async () => {
          throw new Error('plugin failure');
        }
      }
    };
  }

  let terminate_policy_upstream_count = 0;
  const terminate_policy_upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      terminate_policy_upstream_count += 1;
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('unexpected');
    }
  });

  const terminate_policy_mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({
        test_name: 'plugin_throw_terminate_policy'
      }),
      callback_error_policy: 'TERMINATE',
      plugins: [new ThrowingPlugin()]
    }
  });

  try {
    const terminate_result = await SendHttpRequestViaProxyAllowError({
      proxy_port: terminate_policy_mitm_server.listen_port,
      target_port: terminate_policy_upstream_server.port,
      method: 'GET',
      path: '/plugin-throw-terminate'
    });
    await Delay({ ms: 75 });
    assert.equal(terminate_result.response, null);
    assert.ok(terminate_result.error);
    assert.equal(terminate_policy_upstream_count, 0);
  } finally {
    await terminate_policy_mitm_server.close();
    await CloseHttpServer({ server: terminate_policy_upstream_server.server });
  }

  let passthrough_policy_upstream_count = 0;
  const passthrough_policy_upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      passthrough_policy_upstream_count += 1;
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
    }
  });

  const passthrough_policy_mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({
        test_name: 'plugin_throw_passthrough_policy'
      }),
      callback_error_policy: 'PASSTHROUGH',
      plugins: [new ThrowingPlugin()]
    }
  });

  try {
    const passthrough_result = await SendHttpRequestViaProxy({
      proxy_port: passthrough_policy_mitm_server.listen_port,
      target_port: passthrough_policy_upstream_server.port,
      method: 'GET',
      path: '/plugin-throw-passthrough'
    });
    assert.equal(passthrough_result.status_code, 200);
    assert.equal(passthrough_policy_upstream_count, 1);
  } finally {
    await passthrough_policy_mitm_server.close();
    await CloseHttpServer({
      server: passthrough_policy_upstream_server.server
    });
  }
});

test('No plugins keeps legacy callback behavior unchanged', async () => {
  let instance_callback_count = 0;
  let upstream_header_seen = '';

  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      upstream_header_seen = String(request.headers['x-legacy'] || '');
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ok');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'plugin_none_legacy_unchanged' }),
      http: {
        client_to_server: {
          requestHeaders: async () => {
            instance_callback_count += 1;
            return {
              state: 'MODIFIED',
              headers: [{ name: 'x-legacy', value: 'true' }]
            };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/no-plugins'
    });
    assert.equal(response.status_code, 200);
    assert.equal(instance_callback_count, 1);
    assert.equal(upstream_header_seen, 'true');
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS CONNECT/TLS traffic is intercepted and can be modified', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('secure-upstream');
    }
  });

  let callback_saw_ssl = false;
  const ssl_ca_dir = CreateSslCaDir({ test_name: 'https_connect_tls' });
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            callback_saw_ssl = context.is_ssl;
            return {
              state: 'MODIFIED',
              data: 'secure-modified'
            };
          }
        }
      }
    }
  });

  try {
    assert.equal(mitm_server.ca.key_algorithm, 'rsa_2048');
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_path: path.join(ssl_ca_dir, 'certs', 'ca.pem'),
      path: '/secure'
    });

    assert.equal(response.status_code, 200);
    assert.equal(response.body, 'secure-modified');
    assert.equal(callback_saw_ssl, true);
    await WaitForPath({ file_path: path.join(ssl_ca_dir, 'certs', 'ca.pem') });
    await WaitForPath({
      file_path: path.join(ssl_ca_dir, 'certs', 'localhost.ecdsa_p256.pem')
    });
    await WaitForPath({
      file_path: path.join(ssl_ca_dir, 'keys', 'localhost.ecdsa_p256.key')
    });
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: readFileSync(path.join(ssl_ca_dir, 'certs', 'ca.pem'), 'utf8')
      }),
      'rsa'
    );
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: readFileSync(
          path.join(ssl_ca_dir, 'certs', 'localhost.ecdsa_p256.pem'),
          'utf8'
        )
      }),
      'ec'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS disk root with memory leaf certificates avoids per-host leaf files', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('memory-leaf-upstream');
    }
  });

  const ssl_ca_dir = CreateSslCaDir({ test_name: 'memory_leaf_disk_root' });
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'disk' },
        leaf_certificates: { storage: 'memory' }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_path: path.join(ssl_ca_dir, 'certs', 'ca.pem'),
      path: '/memory-leaf'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /memory-leaf-upstream/);
    await WaitForPath({ file_path: path.join(ssl_ca_dir, 'certs', 'ca.pem') });
    assert.equal(
      existsSync(path.join(ssl_ca_dir, 'certs', 'localhost.pem')),
      false
    );
    assert.equal(
      existsSync(path.join(ssl_ca_dir, 'keys', 'localhost.key')),
      false
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS existing legacy RSA disk root CA is loaded and reused', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('legacy-root-upstream');
    }
  });

  const ssl_ca_dir = CreateSslCaDir({ test_name: 'legacy_rsa_root_load' });
  WriteLegacyForgeRootCa({ ssl_ca_dir });
  const original_ca_pem = readFileSync(
    path.join(ssl_ca_dir, 'certs', 'ca.pem'),
    'utf8'
  );

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'disk', key_algorithm: 'rsa_2048' },
        leaf_certificates: { storage: 'memory' }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_path: path.join(ssl_ca_dir, 'certs', 'ca.pem'),
      path: '/legacy-root'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /legacy-root-upstream/);
    assert.equal(mitm_server.ca.key_algorithm, 'rsa_2048');
    assert.equal(
      readFileSync(path.join(ssl_ca_dir, 'certs', 'ca.pem'), 'utf8'),
      original_ca_pem
    );
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: mitm_server.proxy.ca.leafCache.get(
          'ecdsa_p256:host:localhost'
        ).certPem
      }),
      'ec'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS memory root and memory leaf certificates require no certificate directory', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('memory-root-upstream');
    }
  });

  const unused_ssl_ca_dir = CreateSslCaDir({ test_name: 'memory_root_unused' });
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory', ssl_ca_dir: unused_ssl_ca_dir },
        leaf_certificates: { storage: 'memory' }
      }
    }
  });

  try {
    assert.equal(mitm_server.ca.storage, 'memory');
    assert.equal(typeof mitm_server.ca.cert_pem, 'string');
    assert.equal(mitm_server.ca.cert_path, undefined);

    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      path: '/memory-root'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /memory-root-upstream/);
    assert.equal(existsSync(unused_ssl_ca_dir), false);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS supplied RSA root CA material signs default ECDSA leaves from memory', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('supplied-rsa-root-upstream');
    }
  });

  const material = GenerateForgeRootCaMaterial();
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { material },
        leaf_certificates: { storage: 'memory' }
      }
    }
  });

  try {
    assert.equal(mitm_server.ca.storage, 'memory');
    assert.equal(mitm_server.ca.cert_path, undefined);
    assert.equal(mitm_server.ca.key_algorithm, 'rsa_2048');
    assert.equal(
      new NodeX509Certificate(mitm_server.ca.cert_pem).fingerprint256,
      new NodeX509Certificate(material.cert_pem).fingerprint256
    );

    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      path: '/supplied-rsa-root'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /supplied-rsa-root-upstream/);
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: mitm_server.proxy.ca.leafCache.get(
          'ecdsa_p256:host:localhost'
        ).certPem
      }),
      'ec'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS supplied ECDSA root CA material signs ECDSA leaves from memory', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('supplied-ecdsa-root-upstream');
    }
  });

  const material = await GenerateEcdsaRootCaMaterial();
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { material, key_algorithm: 'ecdsa_p256' },
        leaf_certificates: {
          storage: 'memory',
          wildcard: 'exact_host',
          key_algorithm: 'ecdsa_p256'
        }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      path: '/supplied-ecdsa-root'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /supplied-ecdsa-root-upstream/);
    assert.equal(mitm_server.ca.storage, 'memory');
    assert.equal(mitm_server.ca.key_algorithm, 'ecdsa_p256');
    assert.equal(
      GetCertificatePublicKeyType({ cert_pem: mitm_server.ca.cert_pem }),
      'ec'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS supplied encrypted root private key works with passphrase', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('encrypted-root-upstream');
    }
  });

  const material = GenerateForgeRootCaMaterial({
    private_key_passphrase: 'correct horse battery staple'
  });
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { material },
        leaf_certificates: { storage: 'memory' }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      path: '/encrypted-root'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /encrypted-root-upstream/);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS supplied root CA material rejects invalid configurations clearly', async () => {
  const material = GenerateForgeRootCaMaterial({
    private_key_passphrase: 'real-passphrase'
  });
  await assert.rejects(
    StartHttpMitm({
      start_params: {
        host: '127.0.0.1',
        listen_port: 0,
        certificates: {
          root_ca: {
            material: {
              ...material,
              private_key_passphrase: 'wrong-passphrase'
            }
          },
          leaf_certificates: { storage: 'memory' }
        }
      }
    }),
    /Invalid supplied root CA private key/
  );

  const first_material = GenerateForgeRootCaMaterial();
  const second_material = GenerateForgeRootCaMaterial();
  await assert.rejects(
    StartHttpMitm({
      start_params: {
        host: '127.0.0.1',
        listen_port: 0,
        certificates: {
          root_ca: {
            material: {
              cert_pem: first_material.cert_pem,
              private_key_pem: second_material.private_key_pem
            }
          },
          leaf_certificates: { storage: 'memory' }
        }
      }
    }),
    /public key does not match/
  );

  await assert.rejects(
    StartHttpMitm({
      start_params: {
        host: '127.0.0.1',
        listen_port: 0,
        certificates: {
          root_ca: {
            material: first_material,
            key_algorithm: 'ecdsa_p256'
          },
          leaf_certificates: { storage: 'memory' }
        }
      }
    }),
    /Supplied root CA key algorithm is rsa_2048, but ecdsa_p256 was requested/
  );

  await assert.rejects(
    StartHttpMitm({
      start_params: {
        host: '127.0.0.1',
        listen_port: 0,
        certificates: {
          root_ca: {
            storage: 'disk',
            material: first_material
          },
          leaf_certificates: { storage: 'memory' }
        }
      }
    }),
    /Supplied root CA material is memory-only/
  );
});

test('HTTPS supplied memory root with disk leaves writes only leaf material', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('supplied-root-disk-leaf-upstream');
    }
  });

  const material = GenerateForgeRootCaMaterial();
  const ssl_ca_dir = CreateSslCaDir({ test_name: 'supplied_root_disk_leaf' });
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory', material },
        leaf_certificates: {
          storage: 'disk',
          wildcard: 'exact_host'
        }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      path: '/supplied-root-disk-leaf'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /supplied-root-disk-leaf-upstream/);
    await WaitForPath({
      file_path: path.join(ssl_ca_dir, 'certs', 'localhost.ecdsa_p256.pem')
    });
    assert.equal(existsSync(path.join(ssl_ca_dir, 'certs', 'ca.pem')), false);
    assert.equal(
      existsSync(path.join(ssl_ca_dir, 'keys', 'ca.private.key')),
      false
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS memory leaf certificates reuse registrable-domain wildcard cache entries', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('wildcard-upstream');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory' },
        leaf_certificates: {
          storage: 'memory',
          wildcard: 'registrable_domain'
        }
      }
    }
  });

  try {
    const first_response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'api.example.com',
      servername: 'api.example.com',
      request_host: '127.0.0.1',
      path: '/wildcard-one'
    });
    const second_response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'www.example.com',
      servername: 'www.example.com',
      request_host: '127.0.0.1',
      path: '/wildcard-two'
    });

    assert.match(first_response.body, /wildcard-upstream/);
    assert.match(second_response.body, /wildcard-upstream/);
    assert.deepEqual(
      [...mitm_server.proxy.ca.leafCache.keys()],
      ['ecdsa_p256:wildcard:example.com']
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS memory leaf certificates use exact-host fallback for localhost and IP hosts', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('exact-fallback-upstream');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory' },
        leaf_certificates: {
          storage: 'memory',
          wildcard: 'registrable_domain'
        }
      }
    }
  });

  try {
    await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'localhost',
      servername: 'localhost',
      request_host: '127.0.0.1',
      path: '/localhost'
    });
    await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: '127.0.0.1',
      servername: '127.0.0.1',
      request_host: '127.0.0.1',
      path: '/ip'
    });

    assert.deepEqual([...mitm_server.proxy.ca.leafCache.keys()].sort(), [
      'ecdsa_p256:host:127.0.0.1',
      'ecdsa_p256:host:localhost'
    ]);
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS memory leaf cache enforces TTL and LRU limits', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('cache-upstream');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory' },
        leaf_certificates: {
          storage: 'memory',
          wildcard: 'exact_host',
          cache: { max_entries: 1, ttl_ms: 1 }
        }
      }
    }
  });

  try {
    await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'first.example.com',
      servername: 'first.example.com',
      request_host: '127.0.0.1',
      path: '/first'
    });
    const first_cert_pem = mitm_server.proxy.ca.leafCache.get(
      'ecdsa_p256:host:first.example.com'
    ).certPem;

    await CloseGeneratedSslServers({ proxy: mitm_server.proxy });
    await Delay({ ms: 5 });
    await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'first.example.com',
      servername: 'first.example.com',
      request_host: '127.0.0.1',
      path: '/first-again'
    });
    const regenerated_cert_pem = mitm_server.proxy.ca.leafCache.get(
      'ecdsa_p256:host:first.example.com'
    ).certPem;
    assert.notEqual(regenerated_cert_pem, first_cert_pem);

    await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'second.example.com',
      servername: 'second.example.com',
      request_host: '127.0.0.1',
      path: '/second'
    });
    assert.deepEqual(
      [...mitm_server.proxy.ca.leafCache.keys()],
      ['ecdsa_p256:host:second.example.com']
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS concurrent memory leaf requests generate one certificate per cache key', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('race-upstream');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory' },
        leaf_certificates: {
          storage: 'memory',
          wildcard: 'exact_host'
        }
      }
    }
  });

  const original_generate =
    mitm_server.proxy.ca.generateServerCertificateKeys.bind(
      mitm_server.proxy.ca
    ) as (...args: any[]) => unknown;
  let generate_count = 0;
  mitm_server.proxy.ca.generateServerCertificateKeys = (...args: any[]) => {
    generate_count += 1;
    return original_generate(...args);
  };

  try {
    const request_params = {
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      connect_host: 'race.example.com',
      servername: 'race.example.com',
      request_host: '127.0.0.1',
      path: '/race'
    };
    await Promise.all([
      SendHttpsConnectRequestViaProxy(request_params),
      SendHttpsConnectRequestViaProxy(request_params)
    ]);

    assert.equal(generate_count, 1);
    assert.deepEqual(
      [...mitm_server.proxy.ca.leafCache.keys()],
      ['ecdsa_p256:host:race.example.com']
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS RSA root and RSA leaf certificates work when explicitly configured', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('rsa-upstream');
    }
  });

  const ssl_ca_dir = CreateSslCaDir({ test_name: 'rsa_root_rsa_leaf' });
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'disk', key_algorithm: 'rsa_2048' },
        leaf_certificates: {
          storage: 'disk',
          wildcard: 'exact_host',
          key_algorithm: 'rsa_2048'
        }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_path: path.join(ssl_ca_dir, 'certs', 'ca.pem'),
      path: '/rsa'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /rsa-upstream/);
    await WaitForPath({ file_path: path.join(ssl_ca_dir, 'certs', 'localhost.pem') });
    assert.equal(mitm_server.ca.key_algorithm, 'rsa_2048');
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: readFileSync(path.join(ssl_ca_dir, 'certs', 'localhost.pem'), 'utf8')
      }),
      'rsa'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS ECDSA root and ECDSA leaf certificates work when explicitly configured', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('ecdsa-root-upstream');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'memory', key_algorithm: 'ecdsa_p256' },
        leaf_certificates: {
          storage: 'memory',
          wildcard: 'exact_host',
          key_algorithm: 'ecdsa_p256'
        }
      }
    }
  });

  try {
    const response = await SendHttpsConnectRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_pem: mitm_server.ca.cert_pem,
      path: '/ecdsa-root'
    });

    assert.equal(response.status_code, 200);
    assert.match(response.body, /ecdsa-root-upstream/);
    assert.equal(mitm_server.ca.key_algorithm, 'ecdsa_p256');
    assert.equal(
      GetCertificatePublicKeyType({ cert_pem: mitm_server.ca.cert_pem }),
      'ec'
    );
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: mitm_server.proxy.ca.leafCache.get(
          'ecdsa_p256:host:localhost'
        ).certPem
      }),
      'ec'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTPS disk root algorithm mismatch fails clearly', async () => {
  const ssl_ca_dir = CreateSslCaDir({ test_name: 'root_algorithm_mismatch' });
  const first_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      certificates: {
        root_ca: { storage: 'disk', key_algorithm: 'rsa_2048' },
        leaf_certificates: { storage: 'memory' }
      }
    }
  });
  await first_server.close();

  await assert.rejects(
    StartHttpMitm({
      start_params: {
        host: '127.0.0.1',
        listen_port: 0,
        ssl_ca_dir,
        certificates: {
          root_ca: { storage: 'disk', key_algorithm: 'ecdsa_p256' },
          leaf_certificates: { storage: 'memory' }
        }
      }
    }),
    /Existing root CA key algorithm is rsa_2048, but ecdsa_p256 was requested/
  );
});

test('HTTPS disk RSA and ECDSA leaf certificate files do not collide', async () => {
  const upstream_server = await StartHttpsServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('leaf-collision-upstream');
    }
  });

  const ssl_ca_dir = CreateSslCaDir({ test_name: 'leaf_algorithm_collision' });
  const rsa_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'disk', key_algorithm: 'rsa_2048' },
        leaf_certificates: {
          storage: 'disk',
          wildcard: 'exact_host',
          key_algorithm: 'rsa_2048'
        }
      }
    }
  });

  try {
    await SendHttpsConnectRequestViaProxy({
      proxy_port: rsa_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_path: path.join(ssl_ca_dir, 'certs', 'ca.pem'),
      path: '/rsa-leaf'
    });
    await WaitForPath({ file_path: path.join(ssl_ca_dir, 'certs', 'localhost.pem') });
  } finally {
    await rsa_server.close();
  }

  const ecdsa_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir,
      https_agent: new https.Agent({ rejectUnauthorized: false }),
      certificates: {
        root_ca: { storage: 'disk', key_algorithm: 'rsa_2048' },
        leaf_certificates: {
          storage: 'disk',
          wildcard: 'exact_host',
          key_algorithm: 'ecdsa_p256'
        }
      }
    }
  });

  try {
    await SendHttpsConnectRequestViaProxy({
      proxy_port: ecdsa_server.listen_port,
      target_port: upstream_server.port,
      ca_cert_path: path.join(ssl_ca_dir, 'certs', 'ca.pem'),
      path: '/ecdsa-leaf'
    });
    await WaitForPath({
      file_path: path.join(ssl_ca_dir, 'certs', 'localhost.ecdsa_p256.pem')
    });
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: readFileSync(path.join(ssl_ca_dir, 'certs', 'localhost.pem'), 'utf8')
      }),
      'rsa'
    );
    assert.equal(
      GetCertificatePublicKeyType({
        cert_pem: readFileSync(
          path.join(ssl_ca_dir, 'certs', 'localhost.ecdsa_p256.pem'),
          'utf8'
        )
      }),
      'ec'
    );
  } finally {
    await ecdsa_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP keep-alive can send repeated requests through one proxy instance', async () => {
  let request_count = 0;
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      request_count += 1;
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end(`ok-${request_count}`);
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      keep_alive: true,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'keep_alive_repeated' })
    }
  });

  const agent = new http.Agent({ keepAlive: true, maxSockets: 1 });

  async function sendKeepAliveRequest(pathname: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      const request = http.request(
        {
          host: '127.0.0.1',
          port: mitm_server.listen_port,
          method: 'GET',
          path: `http://127.0.0.1:${upstream_server.port}${pathname}`,
          headers: {
            host: `127.0.0.1:${upstream_server.port}`,
            connection: 'keep-alive'
          },
          agent
        },
        (response) => {
          const chunks: Buffer[] = [];
          response.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          response.on('end', () =>
            resolve(Buffer.concat(chunks).toString('utf8'))
          );
        }
      );
      request.on('error', reject);
      request.end();
    });
  }

  try {
    assert.equal(await sendKeepAliveRequest('/one'), 'ok-1');
    assert.equal(await sendKeepAliveRequest('/two'), 'ok-2');
    assert.equal(request_count, 2);
  } finally {
    agent.destroy();
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('Concurrent delayed HTTP callbacks do not leak request data', async () => {
  const upstream_server = await StartHttpServer({
    handler: async (request, response) => {
      const chunks: Buffer[] = [];
      request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      request.on('end', () => {
        response.writeHead(200, { 'content-type': 'text/plain' });
        response.end(Buffer.concat(chunks));
      });
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'concurrent_callbacks' }),
      http: {
        client_to_server: {
          requestData: async () => {
            await Delay({ ms: 40 });
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const responses = await Promise.all(
      Array.from({ length: 6 }, async (_value, index) => {
        return await SendHttpRequestViaProxy({
          proxy_port: mitm_server.listen_port,
          target_port: upstream_server.port,
          method: 'POST',
          path: `/concurrent-${index}`,
          body: `body-${index}`
        });
      })
    );

    responses.forEach((response, index) => {
      assert.equal(response.status_code, 200);
      assert.equal(response.body, `body-${index}`);
    });
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('HTTP request and response body limits terminate oversized traffic and log diagnostics', async () => {
  const logger_messages: string[] = [];

  const request_limit_upstream = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('unexpected');
    }
  });

  const request_limit_mitm = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'request_limit' }),
      limits: { request_body_bytes: 4 },
      logger: {
        warn: (message) => logger_messages.push(message)
      },
      http: {
        client_to_server: {
          requestData: async () => ({ state: 'PASSTHROUGH' })
        }
      }
    }
  });

  try {
    const request_result = await SendHttpRequestViaProxyAllowError({
      proxy_port: request_limit_mitm.listen_port,
      target_port: request_limit_upstream.port,
      method: 'POST',
      path: '/request-limit',
      body: 'too-large'
    });
    assert.equal(request_result.response, null);
    assert.ok(request_result.error);
    assert.ok(
      logger_messages.includes('HTTPMITM request body limit exceeded.')
    );
  } finally {
    await request_limit_mitm.close();
    await CloseHttpServer({ server: request_limit_upstream.server });
  }

  const response_limit_upstream = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('too-large');
    }
  });

  const response_limit_mitm = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'response_limit' }),
      limits: { response_body_bytes: 4 },
      logger: {
        warn: (message) => logger_messages.push(message)
      },
      http: {
        server_to_client: {
          responseData: async () => ({ state: 'PASSTHROUGH' })
        }
      }
    }
  });

  try {
    const response_result = await SendHttpRequestViaProxyAllowError({
      proxy_port: response_limit_mitm.listen_port,
      target_port: response_limit_upstream.port,
      method: 'GET',
      path: '/response-limit'
    });
    assert.equal(response_result.response, null);
    assert.ok(response_result.error);
    assert.ok(
      logger_messages.includes('HTTPMITM response body limit exceeded.')
    );
  } finally {
    await response_limit_mitm.close();
    await CloseHttpServer({ server: response_limit_upstream.server });
  }
});

test('HTTP callback timeout follows terminate policy and logs diagnostic', async () => {
  const logger_messages: string[] = [];
  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      response.writeHead(200, { 'content-type': 'text/plain' });
      response.end('unexpected');
    }
  });

  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'callback_timeout_http' }),
      limits: { callback_timeout_ms: 20 },
      logger: {
        warn: (message) => logger_messages.push(message)
      },
      http: {
        client_to_server: {
          requestHeaders: async () => {
            await Delay({ ms: 100 });
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const result = await SendHttpRequestViaProxyAllowError({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/timeout'
    });
    assert.equal(result.response, null);
    assert.ok(result.error);
    assert.ok(logger_messages.includes('HTTPMITM callback timed out.'));
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
  }
});

test('WebSocket frame limit and callback timeout terminate connections', async () => {
  const websocket_server = new WebSocketServer({ host: '127.0.0.1', port: 0 });
  await once(websocket_server, 'listening');
  const websocket_port = (websocket_server.address() as AddressInfo).port;
  websocket_server.on('connection', (socket) => {
    socket.on('message', (message) => socket.send(message));
  });

  const logger_messages: string[] = [];
  const frame_limit_mitm = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'websocket_frame_limit' }),
      limits: { websocket_frame_bytes: 4 },
      logger: {
        warn: (message) => logger_messages.push(message)
      },
      websocket: {
        onFrameSent: async () => ({ state: 'PASSTHROUGH' })
      }
    }
  });

  const frame_limit_client = new WebSocket(
    `ws://127.0.0.1:${frame_limit_mitm.listen_port}/socket`,
    { headers: { host: `127.0.0.1:${websocket_port}` } }
  );

  try {
    await once(frame_limit_client, 'open');
    frame_limit_client.send('too-large');
    await once(frame_limit_client, 'close');
    assert.ok(
      logger_messages.includes('HTTPMITM WebSocket frame limit exceeded.')
    );
  } finally {
    await frame_limit_mitm.close();
  }

  const timeout_mitm = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'websocket_callback_timeout' }),
      limits: { callback_timeout_ms: 20 },
      logger: {
        warn: (message) => logger_messages.push(message)
      },
      websocket: {
        onFrameSent: async () => {
          await Delay({ ms: 100 });
          return { state: 'PASSTHROUGH' };
        }
      }
    }
  });

  const timeout_client = new WebSocket(
    `ws://127.0.0.1:${timeout_mitm.listen_port}/socket`,
    { headers: { host: `127.0.0.1:${websocket_port}` } }
  );

  try {
    await once(timeout_client, 'open');
    timeout_client.send('ping');
    await once(timeout_client, 'close');
    assert.ok(logger_messages.includes('HTTPMITM callback timed out.'));
  } finally {
    await timeout_mitm.close();
    await CloseWebSocketServer({ websocket_server });
  }
});

test('HTTP responseData supports zstd when PATH has no external binary', async () => {
  const original_path = process.env.PATH;
  process.env.PATH = '';

  const upstream_server = await StartHttpServer({
    handler: async (_request, response) => {
      const encoded_body = zstdCompressSync(
        Buffer.from('zstd-without-path', 'utf8')
      );
      response.writeHead(200, {
        'content-type': 'application/octet-stream',
        'content-encoding': 'zstd',
        'content-length': String(encoded_body.length)
      });
      response.end(encoded_body);
    }
  });

  let decode_error = '';
  let callback_saw_data = '';
  const mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'zstd_no_external_binary' }),
      http: {
        server_to_client: {
          responseData: async ({ context }) => {
            decode_error = context.decode_error || '';
            callback_saw_data = context.data.toString('utf8');
            return { state: 'PASSTHROUGH' };
          }
        }
      }
    }
  });

  try {
    const response = await SendHttpRequestViaProxy({
      proxy_port: mitm_server.listen_port,
      target_port: upstream_server.port,
      method: 'GET',
      path: '/zstd-no-external-binary'
    });

    assert.equal(response.status_code, 200);
    assert.equal(decode_error, '');
    assert.equal(callback_saw_data, 'zstd-without-path');
    assert.equal(
      zstdDecompressSync(response.raw_body).toString('utf8'),
      'zstd-without-path'
    );
  } finally {
    await mitm_server.close();
    await CloseHttpServer({ server: upstream_server.server });
    if (typeof original_path === 'undefined') {
      delete process.env.PATH;
    } else {
      process.env.PATH = original_path;
    }
  }
});

test('stop awaits shutdown and allows immediate port reuse', async () => {
  const first_mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: 0,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'stop_reuse_first' })
    }
  });
  const reused_port = first_mitm_server.listen_port;
  await first_mitm_server.close();

  const second_mitm_server = await StartHttpMitm({
    start_params: {
      host: '127.0.0.1',
      listen_port: reused_port,
      ssl_ca_dir: CreateSslCaDir({ test_name: 'stop_reuse_second' })
    }
  });

  try {
    assert.equal(second_mitm_server.listen_port, reused_port);
  } finally {
    await second_mitm_server.close();
  }
});
