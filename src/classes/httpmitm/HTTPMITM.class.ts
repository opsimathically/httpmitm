import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { spawnSync } from "node:child_process";
import {
  brotliCompressSync,
  brotliDecompressSync,
  deflateSync,
  gunzipSync,
  gzipSync,
  inflateSync,
  inflateRawSync,
} from "zlib";
import type WebSocket from "ws";
import { Proxy } from "../../forked_code/proxy";
import type { IContext, IWebSocketContext } from "../../forked_code/types";
import type {
  callback_error_policy_t,
  header_entry_t,
  header_value_t,
  httpmitm_plugin_i,
  http_interception_result_t,
  plugin_http_interception_result_t,
  plugin_websocket_interception_result_t,
  http_request_data_callback_context_t,
  http_request_headers_callback_context_t,
  http_response_data_callback_context_t,
  http_response_headers_callback_context_t,
  httpmitm_server_t,
  httpmitm_start_params_t,
  websocket_close_callback_context_t,
  websocket_frame_callback_context_t,
  websocket_interception_result_t,
  websocket_upgrade_callback_context_t,
} from "./httpmitm.types";

const HTTPMITM_STATE_KEY = "__httpmitm_state";
const HTTPMITM_DEFER_RESPONSE_HEADERS_KEY = "__httpmitm_defer_response_headers";
const HTTPMITM_TERMINATED_KEY = "__httpmitm_terminated";
const HTTPMITM_TERMINATED_ERROR_CODE = "HTTPMITM_TERMINATED";

type http_connection_state_t = {
  connection_started_at_ms: number;
  request_chunks: Buffer[];
  response_chunks: Buffer[];
  request_override_body: Buffer | undefined;
  response_override_body: Buffer | undefined;
  response_status_code_override: number | undefined;
  response_status_message_override: string | undefined;
  terminated: boolean;
};

type callback_network_details_t = {
  remote_ip: string | null;
  remote_port: number | null;
  remote_host: string | null;
  client_ip: string | null;
  client_port: number | null;
  client_host: string | null;
};

type decoded_body_result_t = {
  raw_data: Buffer;
  decoded_data: Buffer;
  content_encoding: string | null;
  content_encodings: string[];
  data_is_decoded: boolean;
  decode_error: string | null;
};

type binary_transform_result_t = {
  output_data: Buffer;
  error: string | null;
};

function CreateTerminatedError(): Error {
  // Use a sentinel error code so proxy internals can distinguish intentional
  // callback termination from transport/runtime failures.
  const terminated_error = new Error("Connection terminated by HTTPMITM callback.");
  (terminated_error as Error & { code?: string }).code =
    HTTPMITM_TERMINATED_ERROR_CODE;
  return terminated_error;
}

function ToBuffer(params: { data: unknown }): Buffer | undefined {
  const { data } = params;
  if (typeof data === "undefined") {
    return undefined;
  }
  if (Buffer.isBuffer(data)) {
    return Buffer.from(data);
  }
  if (typeof data === "string") {
    return Buffer.from(data);
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  if (Array.isArray(data)) {
    const buffer_list = data
      .map((current_data) => ToBuffer({ data: current_data }))
      .filter((current_data): current_data is Buffer =>
        typeof current_data !== "undefined"
      );
    return Buffer.concat(buffer_list);
  }
  return Buffer.from(String(data));
}

function NormalizeHeaderValue(params: { value: unknown }): header_value_t {
  const { value } = params;
  if (value === null) {
    return null;
  }
  if (typeof value === "undefined") {
    return null;
  }
  if (Array.isArray(value)) {
    return value.map((current_value) => String(current_value));
  }
  return String(value);
}

function HeadersObjectToEntries(params: {
  headers: IncomingHttpHeaders | OutgoingHttpHeaders;
}): header_entry_t[] {
  const header_entries: header_entry_t[] = [];
  for (const header_name in params.headers) {
    const header_value = params.headers[header_name];
    if (typeof header_value === "undefined") {
      continue;
    }
    header_entries.push({
      name: header_name,
      value: NormalizeHeaderValue({ value: header_value }),
    });
  }
  return header_entries;
}

function ApplyHeaderEntriesToObject(params: {
  headers: OutgoingHttpHeaders;
  header_entries: header_entry_t[];
}): void {
  const { headers, header_entries } = params;
  header_entries.forEach((header_entry) => {
    const header_name = header_entry.name.toLowerCase();
    if (header_entry.value === null) {
      delete headers[header_name];
      return;
    }
    headers[header_name] = header_entry.value;
  });
}

function ApplyHeaderEntriesToOutgoingMessage(params: {
  target: {
    setHeader: (name: string, value: number | string | readonly string[]) => void;
    removeHeader: (name: string) => void;
  };
  header_entries: header_entry_t[];
}): void {
  params.header_entries.forEach((header_entry) => {
    const header_name = header_entry.name;
    if (header_entry.value === null) {
      params.target.removeHeader(header_name);
      return;
    }
    params.target.setHeader(header_name, header_entry.value);
  });
}

function NormalizeHttpResult(params: {
  result: http_interception_result_t | void;
}): http_interception_result_t {
  if (!params.result) {
    return { state: "PASSTHROUGH" };
  }
  if (!params.result.state) {
    return { ...params.result, state: "PASSTHROUGH" };
  }
  return params.result;
}

function NormalizeWebSocketResult(params: {
  result: websocket_interception_result_t | void;
}): websocket_interception_result_t {
  if (!params.result) {
    return { state: "PASSTHROUGH" };
  }
  if (!params.result.state) {
    return { ...params.result, state: "PASSTHROUGH" };
  }
  return params.result;
}

function NormalizePluginHttpResult(params: {
  result: plugin_http_interception_result_t | void;
}): plugin_http_interception_result_t {
  if (!params.result) {
    return { state: "CONTINUE" };
  }
  if (!params.result.state) {
    return { ...params.result, state: "CONTINUE" };
  }
  return params.result;
}

function NormalizePluginWebSocketResult(params: {
  result: plugin_websocket_interception_result_t | void;
}): plugin_websocket_interception_result_t {
  if (!params.result) {
    return { state: "CONTINUE" };
  }
  if (!params.result.state) {
    return { ...params.result, state: "CONTINUE" };
  }
  return params.result;
}

function PluginHttpResultToHttpResult(params: {
  plugin_result: plugin_http_interception_result_t;
}): http_interception_result_t {
  if (params.plugin_result.state === "CONTINUE") {
    return { state: "PASSTHROUGH" };
  }
  return {
    ...params.plugin_result,
    state: params.plugin_result.state,
  };
}

function PluginWebSocketResultToWebSocketResult(params: {
  plugin_result: plugin_websocket_interception_result_t;
}): websocket_interception_result_t {
  if (params.plugin_result.state === "CONTINUE") {
    return { state: "PASSTHROUGH" };
  }
  return {
    ...params.plugin_result,
    state: params.plugin_result.state,
  };
}

function IsWebSocketOpen(params: {
  websocket: IWebSocketContext["clientToProxyWebSocket"];
}): boolean {
  const websocket = params.websocket as WebSocket | undefined;
  return !!websocket && websocket.readyState === websocket.OPEN;
}

function GetHttpRequestMetadata(params: { ctx: IContext }) {
  const request_headers =
    (params.ctx.proxyToServerRequestOptions?.headers as OutgoingHttpHeaders) ||
    params.ctx.clientToProxyRequest.headers;
  return {
    method: params.ctx.clientToProxyRequest.method,
    url: params.ctx.clientToProxyRequest.url,
    http_version: params.ctx.clientToProxyRequest.httpVersion,
    headers: HeadersObjectToEntries({ headers: request_headers }),
  };
}

function GetHttpResponseMetadata(params: { ctx: IContext }) {
  return {
    status_code: params.ctx.serverToProxyResponse?.statusCode,
    status_message: params.ctx.serverToProxyResponse?.statusMessage,
    http_version: params.ctx.serverToProxyResponse?.httpVersion,
    headers: HeadersObjectToEntries({
      headers: params.ctx.serverToProxyResponse?.headers || {},
    }),
  };
}

function NormalizePort(params: { port: unknown }): number | null {
  const { port } = params;
  if (typeof port === "number" && Number.isFinite(port)) {
    return port;
  }
  if (typeof port === "string" && port.length > 0) {
    const parsed_port = Number(port);
    if (Number.isFinite(parsed_port)) {
      return parsed_port;
    }
  }
  return null;
}

function GetWebSocketSocketData(params: {
  websocket:
    | IWebSocketContext["clientToProxyWebSocket"]
    | IWebSocketContext["proxyToServerWebSocket"];
}):
  | {
      remoteAddress?: string;
      remotePort?: number;
    }
  | undefined {
  return (
    params.websocket as WebSocket & {
      _socket?: {
        remoteAddress?: string;
        remotePort?: number;
      };
    }
  )?._socket;
}

function ParseWebSocketUrl(params: {
  url: string | undefined;
}): { host: string | null; port: number | null } {
  if (!params.url) {
    return {
      host: null,
      port: null,
    };
  }

  try {
    const parsed_url = new URL(params.url);
    const default_port = parsed_url.protocol === "wss:" ? 443 : 80;
    return {
      host: parsed_url.hostname || null,
      port: NormalizePort({
        port: parsed_url.port.length > 0 ? parsed_url.port : default_port,
      }),
    };
  } catch {
    return {
      host: null,
      port: null,
    };
  }
}

function BuildHttpNetworkDetails(params: { ctx: IContext }): callback_network_details_t {
  const client_socket = params.ctx.clientToProxyRequest.socket;
  const response_socket = params.ctx.serverToProxyResponse?.socket;
  const request_socket = params.ctx.proxyToServerRequest?.socket;
  const proxy_request_options = params.ctx.proxyToServerRequestOptions;

  const client_ip = client_socket?.remoteAddress ?? null;
  const client_port = client_socket?.remotePort ?? null;

  return {
    remote_ip:
      response_socket?.remoteAddress ?? request_socket?.remoteAddress ?? null,
    remote_port:
      response_socket?.remotePort ??
      request_socket?.remotePort ??
      NormalizePort({ port: proxy_request_options?.port }),
    remote_host: proxy_request_options?.host ?? null,
    client_ip,
    client_port,
    client_host: client_ip,
  };
}

function BuildWebSocketNetworkDetails(params: {
  ctx: IWebSocketContext;
}): callback_network_details_t {
  const client_socket = GetWebSocketSocketData({
    websocket: params.ctx.clientToProxyWebSocket,
  });
  const remote_socket = GetWebSocketSocketData({
    websocket: params.ctx.proxyToServerWebSocket,
  });
  const parsed_url = ParseWebSocketUrl({
    url: params.ctx.proxyToServerWebSocketOptions?.url,
  });

  const client_ip = client_socket?.remoteAddress ?? null;
  const client_port = client_socket?.remotePort ?? null;

  return {
    remote_ip: remote_socket?.remoteAddress ?? null,
    remote_port: remote_socket?.remotePort ?? parsed_url.port,
    remote_host: parsed_url.host,
    client_ip,
    client_port,
    client_host: client_ip,
  };
}

function ParseContentEncodings(params: { content_encoding: string | null }): string[] {
  if (!params.content_encoding) {
    return [];
  }

  return params.content_encoding
    .split(",")
    .map((encoding) => encoding.trim().toLowerCase())
    .filter((encoding) => encoding.length > 0 && encoding !== "identity");
}

function NormalizeContentEncodingName(params: { encoding: string }): string {
  switch (params.encoding.trim().toLowerCase()) {
    case "x-gzip":
      return "gzip";
    case "x-deflate":
      return "deflate";
    case "x-compress":
      return "compress";
    default:
      return params.encoding.trim().toLowerCase();
  }
}

function ReadContentEncodingHeader(params: {
  headers: IncomingHttpHeaders | OutgoingHttpHeaders | undefined;
}): string | null {
  const header_value = params.headers?.["content-encoding"];
  if (typeof header_value === "undefined" || header_value === null) {
    return null;
  }
  if (Array.isArray(header_value)) {
    return header_value.join(", ");
  }
  return String(header_value);
}

function RunBinaryTransform(params: {
  command: string;
  args: string[];
  input_data: Buffer;
}): binary_transform_result_t {
  // Some encodings (notably zstd) are handled via system binaries to avoid
  // hard runtime dependency on native Node addons.
  const result = spawnSync(params.command, params.args, {
    input: params.input_data,
    encoding: null,
    maxBuffer: Math.max(16 * 1024 * 1024, params.input_data.length * 8),
  });

  if (result.error) {
    return {
      output_data: Buffer.alloc(0),
      error: result.error.message,
    };
  }

  if (typeof result.status === "number" && result.status !== 0) {
    return {
      output_data: Buffer.alloc(0),
      error: (result.stderr || Buffer.alloc(0)).toString("utf8") || "Command failed.",
    };
  }

  return {
    output_data: (result.stdout || Buffer.alloc(0)) as Buffer,
    error: null,
  };
}

class LsbBitWriter {
  private output_bytes: number[] = [];
  private bit_buffer = 0;
  private bit_count = 0;

  writeCode(params: { code: number; bit_width: number }): void {
    // UNIX .Z format stores LZW codes as least-significant-bit first.
    this.bit_buffer |= params.code << this.bit_count;
    this.bit_count += params.bit_width;

    while (this.bit_count >= 8) {
      this.output_bytes.push(this.bit_buffer & 0xff);
      this.bit_buffer >>>= 8;
      this.bit_count -= 8;
    }
  }

  finish(): Buffer {
    if (this.bit_count > 0) {
      this.output_bytes.push(this.bit_buffer & 0xff);
      this.bit_buffer = 0;
      this.bit_count = 0;
    }
    return Buffer.from(this.output_bytes);
  }
}

class LsbBitReader {
  private input_data: Buffer;
  private input_index = 0;
  private bit_buffer = 0;
  private bit_count = 0;

  constructor(params: { input_data: Buffer }) {
    this.input_data = params.input_data;
  }

  readCode(params: { bit_width: number }): number | null {
    // Mirror writer bit order to decode variable-width LZW codewords.
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

function EncodeUnixCompress(params: { decoded_data: Buffer }): binary_transform_result_t {
  // Minimal UNIX "compress" encoder (LZW, block mode off) for
  // content-encoding: compress/x-compress support.
  const max_bits = 16;
  const max_code_value = 1 << max_bits;
  const block_mode = false;
  const clear_code = 256;
  let next_code = block_mode ? clear_code + 1 : 256;
  let bit_width = 9;
  let max_code_for_width = (1 << bit_width) - 1;

  const dictionary = new Map<string, number>();
  const bit_writer = new LsbBitWriter();

  if (params.decoded_data.length === 0) {
    const header = Buffer.from([0x1f, 0x9d, max_bits & 0x1f]);
    return {
      output_data: header,
      error: null,
    };
  }

  let prefix_code = params.decoded_data[0];

  for (let index = 1; index < params.decoded_data.length; index += 1) {
    const suffix_byte = params.decoded_data[index];
    const lookup_key = `${prefix_code}:${suffix_byte}`;
    const existing_code = dictionary.get(lookup_key);

    if (typeof existing_code !== "undefined") {
      prefix_code = existing_code;
      continue;
    }

    bit_writer.writeCode({
      code: prefix_code,
      bit_width,
    });

    if (next_code < max_code_value) {
      dictionary.set(lookup_key, next_code);
      next_code += 1;
      if (next_code > max_code_for_width && bit_width < max_bits) {
        bit_width += 1;
        max_code_for_width = (1 << bit_width) - 1;
      }
    }

    prefix_code = suffix_byte;
  }

  bit_writer.writeCode({
    code: prefix_code,
    bit_width,
  });

  const header_flags = (max_bits & 0x1f) | (block_mode ? 0x80 : 0x00);
  const header = Buffer.from([0x1f, 0x9d, header_flags]);

  return {
    output_data: Buffer.concat([header, bit_writer.finish()]),
    error: null,
  };
}

function DecodeUnixCompress(params: { encoded_data: Buffer }): binary_transform_result_t {
  // Decoder accepts standard .Z streams, including optional CLEAR handling.
  if (params.encoded_data.length < 3) {
    return {
      output_data: Buffer.alloc(0),
      error: "Invalid compress payload: missing header.",
    };
  }

  if (params.encoded_data[0] !== 0x1f || params.encoded_data[1] !== 0x9d) {
    return {
      output_data: Buffer.alloc(0),
      error: "Invalid compress payload: bad magic header.",
    };
  }

  const flags = params.encoded_data[2];
  const block_mode = (flags & 0x80) !== 0;
  const max_bits = flags & 0x1f;
  if (max_bits < 9 || max_bits > 16) {
    return {
      output_data: Buffer.alloc(0),
      error: `Invalid compress payload: unsupported maxbits ${max_bits}.`,
    };
  }

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

  const reader = new LsbBitReader({
    input_data: params.encoded_data.subarray(3),
  });

  const first_code = reader.readCode({ bit_width });
  if (first_code === null) {
    return {
      output_data: Buffer.alloc(0),
      error: null,
    };
  }
  if (first_code > 255) {
    return {
      output_data: Buffer.alloc(0),
      error: "Invalid compress payload: bad first code.",
    };
  }

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
      if (reset_code > 255) {
        return {
          output_data: Buffer.alloc(0),
          error: "Invalid compress payload: bad code after CLEAR.",
        };
      }
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
      if (current_code >= max_code_value || prefix[current_code] < 0) {
        return {
          output_data: Buffer.alloc(0),
          error: "Invalid compress payload: corrupt dictionary reference.",
        };
      }
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

  return {
    output_data: Buffer.from(output_bytes),
    error: null,
  };
}

function ApplyContentEncodingsToData(params: {
  data: Buffer;
  content_encodings: string[];
  mode: "decode" | "encode";
}): { data: Buffer; error: string | null; transformed: boolean } {
  // HTTP applies encodings in order; decode must run the inverse order.
  const encodings =
    params.mode === "decode"
      ? [...params.content_encodings].reverse()
      : [...params.content_encodings];

  let current_data = Buffer.from(params.data) as Buffer;
  let transformed = false;

  try {
    for (const raw_encoding of encodings) {
      const encoding = NormalizeContentEncodingName({ encoding: raw_encoding });
      switch (encoding) {
        case "gzip":
          current_data =
            params.mode === "decode"
              ? gunzipSync(current_data)
              : gzipSync(current_data);
          transformed = true;
          break;
        case "deflate":
          if (params.mode === "decode") {
            try {
              current_data = inflateSync(current_data);
            } catch {
              // Some peers send raw-deflate while labeling as "deflate".
              current_data = inflateRawSync(current_data);
            }
          } else {
            current_data = deflateSync(current_data);
          }
          transformed = true;
          break;
        case "br":
          current_data =
            params.mode === "decode"
              ? brotliDecompressSync(current_data)
              : brotliCompressSync(current_data);
          transformed = true;
          break;
        case "zstd": {
          const zstd_result = RunBinaryTransform({
            command: "zstd",
            args:
              params.mode === "decode"
                ? ["-d", "-q", "-c", "--no-progress"]
                : ["-q", "-c", "--no-progress"],
            input_data: current_data,
          });
          if (zstd_result.error) {
            return {
              data: current_data,
              error: zstd_result.error,
              transformed,
            };
          }
          current_data = Buffer.from(zstd_result.output_data) as Buffer;
          transformed = true;
          break;
        }
        case "compress": {
          const compress_result =
            params.mode === "decode"
              ? DecodeUnixCompress({
                  encoded_data: current_data,
                })
              : EncodeUnixCompress({
                  decoded_data: current_data,
                });
          if (compress_result.error) {
            return {
              data: current_data,
              error: compress_result.error,
              transformed,
            };
          }
          current_data = Buffer.from(compress_result.output_data) as Buffer;
          transformed = true;
          break;
        }
        default:
          return {
            data: current_data,
            error: `Unsupported content-encoding: ${raw_encoding}`,
            transformed,
          };
      }
    }
  } catch (error) {
    return {
      data: current_data,
      error: error instanceof Error ? error.message : String(error),
      transformed,
    };
  }

  return {
    data: current_data,
    error: null,
    transformed,
  };
}

function DecodeBodyFromHeaders(params: {
  raw_data: Buffer;
  headers: IncomingHttpHeaders | OutgoingHttpHeaders | undefined;
}): decoded_body_result_t {
  const content_encoding = ReadContentEncodingHeader({ headers: params.headers });
  const content_encodings = ParseContentEncodings({ content_encoding });

  if (content_encodings.length === 0) {
    return {
      raw_data: params.raw_data,
      decoded_data: Buffer.from(params.raw_data),
      content_encoding,
      content_encodings,
      data_is_decoded: true,
      decode_error: null,
    };
  }

  const decoded_result = ApplyContentEncodingsToData({
    data: params.raw_data,
    content_encodings,
    mode: "decode",
  });

  return {
    raw_data: params.raw_data,
    // On decode failure, surface the original bytes so caller code can still
    // inspect or pass through payload safely.
    decoded_data: decoded_result.error
      ? Buffer.from(params.raw_data)
      : decoded_result.data,
    content_encoding,
    content_encodings,
    data_is_decoded: !decoded_result.error,
    decode_error: decoded_result.error,
  };
}

function ApplyBodyToEncoding(params: {
  decoded_data: Buffer;
  content_encodings: string[];
}): { encoded_data: Buffer; encode_error: string | null } {
  if (params.content_encodings.length === 0) {
    return {
      encoded_data: params.decoded_data,
      encode_error: null,
    };
  }

  const encoded_result = ApplyContentEncodingsToData({
    data: params.decoded_data,
    content_encodings: params.content_encodings,
    mode: "encode",
  });

  return {
    encoded_data: encoded_result.data,
    encode_error: encoded_result.error,
  };
}

function ContentEncodingArraysEqual(params: {
  left: string[];
  right: string[];
}): boolean {
  if (params.left.length !== params.right.length) {
    return false;
  }
  for (let index = 0; index < params.left.length; index += 1) {
    if (params.left[index] !== params.right[index]) {
      return false;
    }
  }
  return true;
}

function NormalizeContentEncodingHeader(params: {
  headers: OutgoingHttpHeaders;
  content_encodings: string[];
}): void {
  // Keep header/body consistency after callback-driven encoding changes.
  if (params.content_encodings.length === 0) {
    delete params.headers["content-encoding"];
    return;
  }
  params.headers["content-encoding"] = params.content_encodings.join(", ");
}

export class HTTPMITM {
  private proxy_instance: Proxy | undefined;
  private callback_error_policy: callback_error_policy_t;
  private plugin_instances: httpmitm_plugin_i[];

  constructor() {
    this.callback_error_policy = "TERMINATE";
    this.plugin_instances = [];
  }

  async start(params: httpmitm_start_params_t): Promise<httpmitm_server_t> {
    if (this.proxy_instance) {
      await this.stop();
    }

    this.callback_error_policy = params.callback_error_policy || "TERMINATE";
    this.plugin_instances = this.validateAndNormalizePlugins({
      plugins: params.plugins,
    });

    const proxy_instance = new Proxy();
    this.registerHttpCallbacks({ proxy_instance, start_params: params });
    this.registerWebSocketCallbacks({ proxy_instance, start_params: params });

    await new Promise<void>((resolve, reject) => {
      proxy_instance.listen(
        {
          port: params.listen_port,
          host: params.host,
          sslCaDir: params.ssl_ca_dir,
          keepAlive: params.keep_alive,
          timeout: params.timeout,
          forceSNI: params.force_sni,
          httpsPort: params.https_listen_port,
          forceChunkedRequest: params.force_chunked_request,
        },
        (error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        }
      );
    });

    this.proxy_instance = proxy_instance;

    return {
      proxy: proxy_instance,
      host: params.host || "localhost",
      listen_port: proxy_instance.httpPort,
      close: async () => {
        await this.stop();
      },
    };
  }

  async stop(): Promise<void> {
    if (!this.proxy_instance) {
      return;
    }
    this.proxy_instance.close();
    this.proxy_instance = undefined;
  }

  private validateAndNormalizePlugins(params: {
    plugins: httpmitm_plugin_i[] | undefined;
  }): httpmitm_plugin_i[] {
    if (!params.plugins) {
      return [];
    }

    if (!Array.isArray(params.plugins)) {
      throw new Error("HTTPMITM.start plugins must be an array.");
    }

    params.plugins.forEach((plugin_instance, plugin_index) => {
      if (!plugin_instance || typeof plugin_instance !== "object") {
        throw new Error(
          `HTTPMITM plugin at index ${plugin_index} must be an object instance.`
        );
      }
      if (!this.pluginImplementsAnyHook({ plugin_instance })) {
        const plugin_name =
          plugin_instance.plugin_name ||
          (plugin_instance as { constructor?: { name?: string } }).constructor
            ?.name ||
          `plugin_${plugin_index}`;
        throw new Error(
          `HTTPMITM plugin "${plugin_name}" at index ${plugin_index} must implement at least one callback hook.`
        );
      }
    });

    return params.plugins;
  }

  private pluginImplementsAnyHook(params: {
    plugin_instance: httpmitm_plugin_i;
  }): boolean {
    const plugin_instance = params.plugin_instance;
    return (
      typeof plugin_instance.http?.client_to_server?.requestHeaders ===
        "function" ||
      typeof plugin_instance.http?.client_to_server?.requestData ===
        "function" ||
      typeof plugin_instance.http?.server_to_client?.responseHeaders ===
        "function" ||
      typeof plugin_instance.http?.server_to_client?.responseData ===
        "function" ||
      typeof plugin_instance.websocket?.onServerUpgrade === "function" ||
      typeof plugin_instance.websocket?.onFrameSent === "function" ||
      typeof plugin_instance.websocket?.onFrameReceived === "function" ||
      typeof plugin_instance.websocket?.onConnectionTerminated === "function"
    );
  }

  private async resolveHttpInterceptionResultFromChain<callback_context_t>(params: {
    callback_context: callback_context_t;
    get_plugin_callback: (params: {
      plugin_instance: httpmitm_plugin_i;
    }) =>
      | ((params: {
          context: callback_context_t;
        }) => Promise<plugin_http_interception_result_t | void>)
      | undefined;
    instance_callback:
      | ((params: {
          context: callback_context_t;
        }) => Promise<http_interception_result_t | void>)
      | undefined;
  }): Promise<http_interception_result_t> {
    for (const plugin_instance of this.plugin_instances) {
      const plugin_callback = params.get_plugin_callback({ plugin_instance });
      if (!plugin_callback) {
        continue;
      }

      const plugin_result = await this.executeHttpPluginCallback({
        callback_executor: async () =>
          NormalizePluginHttpResult({
            result: await plugin_callback({ context: params.callback_context }),
          }),
      });

      if (plugin_result.state === "CONTINUE") {
        continue;
      }

      return PluginHttpResultToHttpResult({ plugin_result });
    }

    if (!params.instance_callback) {
      return { state: "PASSTHROUGH" };
    }

    return await this.executeHttpCallback({
      callback_executor: async () =>
        NormalizeHttpResult({
          result: await params.instance_callback!({
            context: params.callback_context,
          }),
        }),
    });
  }

  private async resolveWebSocketInterceptionResultFromChain<callback_context_t>(
    params: {
      callback_context: callback_context_t;
      get_plugin_callback: (params: {
        plugin_instance: httpmitm_plugin_i;
      }) =>
        | ((params: {
            context: callback_context_t;
          }) => Promise<plugin_websocket_interception_result_t | void>)
        | undefined;
      instance_callback:
        | ((params: {
            context: callback_context_t;
          }) => Promise<websocket_interception_result_t | void>)
        | undefined;
    }
  ): Promise<websocket_interception_result_t> {
    for (const plugin_instance of this.plugin_instances) {
      const plugin_callback = params.get_plugin_callback({ plugin_instance });
      if (!plugin_callback) {
        continue;
      }

      const plugin_result = await this.executeWebSocketPluginCallback({
        callback_executor: async () =>
          NormalizePluginWebSocketResult({
            result: await plugin_callback({ context: params.callback_context }),
          }),
      });

      if (plugin_result.state === "CONTINUE") {
        continue;
      }

      return PluginWebSocketResultToWebSocketResult({ plugin_result });
    }

    if (!params.instance_callback) {
      return { state: "PASSTHROUGH" };
    }

    return await this.executeWebSocketCallback({
      callback_executor: async () =>
        NormalizeWebSocketResult({
          result: await params.instance_callback!({
            context: params.callback_context,
          }),
        }),
    });
  }

  private registerHttpCallbacks(params: {
    proxy_instance: Proxy;
    start_params: httpmitm_start_params_t;
  }): void {
    const http_callbacks = params.start_params.http;
    const has_plugin_request_headers_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.http?.client_to_server?.requestHeaders ===
        "function"
    );
    const has_plugin_request_data_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.http?.client_to_server?.requestData === "function"
    );
    const has_plugin_response_headers_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.http?.server_to_client?.responseHeaders ===
        "function"
    );
    const has_plugin_response_data_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.http?.server_to_client?.responseData === "function"
    );

    if (
      !http_callbacks &&
      !has_plugin_request_headers_callbacks &&
      !has_plugin_request_data_callbacks &&
      !has_plugin_response_headers_callbacks &&
      !has_plugin_response_data_callbacks
    ) {
      return;
    }

    const has_request_callbacks =
      !!http_callbacks?.client_to_server?.requestHeaders ||
      !!http_callbacks?.client_to_server?.requestData ||
      has_plugin_request_headers_callbacks ||
      has_plugin_request_data_callbacks;
    const has_response_callbacks =
      !!http_callbacks?.server_to_client?.responseHeaders ||
      !!http_callbacks?.server_to_client?.responseData ||
      has_plugin_response_headers_callbacks ||
      has_plugin_response_data_callbacks;

    params.proxy_instance.onRequest((ctx, callback) => {
      this.getOrCreateHttpState({ ctx });
      if (has_response_callbacks) {
        // When response callbacks are active we defer writeHead so content-length
        // can be recalculated after async body modifications.
        ctx.tags = ctx.tags || {
          id: 0,
          uri: "",
          failedUpstreamCalls: 0,
          retryProxyRequest: false,
        };
        ctx.tags[HTTPMITM_DEFER_RESPONSE_HEADERS_KEY] = true;
      }
      callback(null);
    });

    if (has_response_callbacks) {
      params.proxy_instance.onResponse((ctx, callback) => {
        this.getOrCreateHttpState({ ctx });
        ctx.tags = ctx.tags || {
          id: 0,
          uri: "",
          failedUpstreamCalls: 0,
          retryProxyRequest: false,
        };
        ctx.tags[HTTPMITM_DEFER_RESPONSE_HEADERS_KEY] = true;
        callback(null);
      });
    }

    if (has_request_callbacks) {
      params.proxy_instance.onRequestHeaders((ctx, callback) => {
        void this.handleRequestHeadersCallback({
          ctx,
          callback_handler: http_callbacks?.client_to_server?.requestHeaders,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });

      params.proxy_instance.onRequestData((ctx, chunk, callback) => {
        const connection_state = this.getOrCreateHttpState({ ctx });
        // Buffer request body so no upstream bytes are sent before async
        // callback completion.
        connection_state.request_chunks.push(Buffer.from(chunk));
        callback(null, undefined);
      });

      params.proxy_instance.onRequestEnd((ctx, callback) => {
        void this.handleRequestDataCallback({
          ctx,
          callback_handler: http_callbacks?.client_to_server?.requestData,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });
    }

    if (has_response_callbacks) {
      params.proxy_instance.onResponseHeaders((ctx, callback) => {
        void this.handleResponseHeadersCallback({
          ctx,
          callback_handler: http_callbacks?.server_to_client?.responseHeaders,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });

      params.proxy_instance.onResponseData((ctx, chunk, callback) => {
        const connection_state = this.getOrCreateHttpState({ ctx });
        // Buffer response body for the same strict pause-before-forward model.
        connection_state.response_chunks.push(Buffer.from(chunk));
        callback(null, undefined);
      });

      params.proxy_instance.onResponseEnd((ctx, callback) => {
        void this.handleResponseDataCallback({
          ctx,
          callback_handler: http_callbacks?.server_to_client?.responseData,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });
    }
  }

  private registerWebSocketCallbacks(params: {
    proxy_instance: Proxy;
    start_params: httpmitm_start_params_t;
  }): void {
    const websocket_callbacks = params.start_params.websocket;
    const has_plugin_server_upgrade_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.websocket?.onServerUpgrade === "function"
    );
    const has_plugin_frame_sent_callbacks = this.plugin_instances.some(
      (plugin_instance) => typeof plugin_instance.websocket?.onFrameSent === "function"
    );
    const has_plugin_frame_received_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.websocket?.onFrameReceived === "function"
    );
    const has_plugin_terminated_callbacks = this.plugin_instances.some(
      (plugin_instance) =>
        typeof plugin_instance.websocket?.onConnectionTerminated === "function"
    );

    if (
      !websocket_callbacks &&
      !has_plugin_server_upgrade_callbacks &&
      !has_plugin_frame_sent_callbacks &&
      !has_plugin_frame_received_callbacks &&
      !has_plugin_terminated_callbacks
    ) {
      return;
    }

    const on_server_upgrade = websocket_callbacks?.onServerUpgrade;
    if (on_server_upgrade || has_plugin_server_upgrade_callbacks) {
      params.proxy_instance.onWebSocketConnection((ctx, callback) => {
        void this.handleWebSocketUpgradeCallback({
          ctx,
          callback_handler: on_server_upgrade,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });
    }

    const on_frame_sent = websocket_callbacks?.onFrameSent;
    if (on_frame_sent || has_plugin_frame_sent_callbacks) {
      params.proxy_instance.onWebSocketSend((ctx, message, flags, callback) => {
        void this.handleWebSocketFrameCallback({
          ctx,
          message,
          flags: flags as boolean | undefined,
          frame_type: "message",
          from_server: false,
          callback_handler: on_frame_sent,
        })
          .then((result) => callback(null, result.message, result.flags))
          .catch((error) => callback(error as Error));
      });
    }

    const on_frame_received = websocket_callbacks?.onFrameReceived;
    if (on_frame_received || has_plugin_frame_received_callbacks) {
      params.proxy_instance.onWebSocketMessage((
        ctx,
        message,
        flags,
        callback
      ) => {
        void this.handleWebSocketFrameCallback({
          ctx,
          message,
          flags: flags as boolean | undefined,
          frame_type: "message",
          from_server: true,
          callback_handler: on_frame_received,
        })
          .then((result) => callback(null, result.message, result.flags))
          .catch((error) => callback(error as Error));
      });
    }

    const on_connection_terminated = websocket_callbacks?.onConnectionTerminated;
    if (on_connection_terminated || has_plugin_terminated_callbacks) {
      params.proxy_instance.onWebSocketClose((ctx, code, message, callback) => {
        void this.handleWebSocketCloseCallback({
          ctx,
          code,
          message,
          callback_handler: on_connection_terminated,
        })
          .then(() => callback(null, message))
          .catch((error) => callback(error as Error));
      });
    }
  }

  private getOrCreateHttpState(params: { ctx: IContext }): http_connection_state_t {
    params.ctx.tags = params.ctx.tags || {
      id: 0,
      uri: "",
      failedUpstreamCalls: 0,
      retryProxyRequest: false,
    };

    if (!params.ctx.tags[HTTPMITM_STATE_KEY]) {
      params.ctx.tags[HTTPMITM_STATE_KEY] = {
        connection_started_at_ms: Date.now(),
        request_chunks: [],
        response_chunks: [],
        request_override_body: undefined,
        response_override_body: undefined,
        response_status_code_override: undefined,
        response_status_message_override: undefined,
        terminated: false,
      } as http_connection_state_t;
    }

    return params.ctx.tags[HTTPMITM_STATE_KEY] as http_connection_state_t;
  }

  private buildHttpHandles(params: { ctx: IContext }) {
    return {
      raw_context: params.ctx,
      connect_request: params.ctx.connectRequest,
      client_to_proxy_request: params.ctx.clientToProxyRequest,
      proxy_to_client_response: params.ctx.proxyToClientResponse,
      proxy_to_server_request: params.ctx.proxyToServerRequest,
      server_to_proxy_response: params.ctx.serverToProxyResponse,
    };
  }

  private async handleRequestHeadersCallback(params: {
    ctx: IContext;
    callback_handler:
      | ((params: { context: http_request_headers_callback_context_t }) => Promise<http_interception_result_t | void>)
      | undefined;
  }): Promise<void> {
    const connection_state = this.getOrCreateHttpState({ ctx: params.ctx });

    const callback_context: http_request_headers_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: connection_state.connection_started_at_ms,
      intercepted_at_ms: Date.now(),
      protocol: "http",
      is_ssl: params.ctx.isSSL,
      direction: "client_to_server",
      ...BuildHttpNetworkDetails({ ctx: params.ctx }),
      event: "request_headers",
      request: GetHttpRequestMetadata({ ctx: params.ctx }),
      handles: this.buildHttpHandles({ ctx: params.ctx }),
    };

    const callback_result = await this.resolveHttpInterceptionResultFromChain({
      callback_context,
      get_plugin_callback: ({ plugin_instance }) =>
        plugin_instance.http?.client_to_server?.requestHeaders,
      instance_callback: params.callback_handler,
    });

    await this.applyRequestResult({
      ctx: params.ctx,
      callback_result,
      connection_state,
    });
  }

  private async applyRequestResult(params: {
    ctx: IContext;
    callback_result: http_interception_result_t;
    connection_state: http_connection_state_t;
  }): Promise<void> {
    if (params.callback_result.state === "TERMINATE") {
      this.terminateHttpConnection({
        ctx: params.ctx,
        connection_state: params.connection_state,
      });
      throw CreateTerminatedError();
    }

    if (params.callback_result.state !== "MODIFIED") {
      return;
    }

    if (params.callback_result.headers && params.ctx.proxyToServerRequestOptions) {
      ApplyHeaderEntriesToObject({
        headers: params.ctx.proxyToServerRequestOptions
          .headers as OutgoingHttpHeaders,
        header_entries: params.callback_result.headers,
      });
    }

    if (typeof params.callback_result.data !== "undefined") {
      params.connection_state.request_override_body =
        ToBuffer({ data: params.callback_result.data }) || Buffer.alloc(0);
    }
  }

  private async handleRequestDataCallback(params: {
    ctx: IContext;
    callback_handler:
      | ((params: { context: http_request_data_callback_context_t }) => Promise<http_interception_result_t | void>)
      | undefined;
  }): Promise<void> {
    const connection_state = this.getOrCreateHttpState({ ctx: params.ctx });
    let request_body_raw = connection_state.request_override_body;
    if (!request_body_raw) {
      request_body_raw = Buffer.concat(connection_state.request_chunks);
    }
    const request_headers =
      (params.ctx.proxyToServerRequestOptions?.headers as OutgoingHttpHeaders) ||
      {};
    const decoded_request_body = DecodeBodyFromHeaders({
      raw_data: request_body_raw,
      headers: request_headers,
    });

    const callback_context: http_request_data_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: connection_state.connection_started_at_ms,
      intercepted_at_ms: Date.now(),
      protocol: "http",
      is_ssl: params.ctx.isSSL,
      direction: "client_to_server",
      ...BuildHttpNetworkDetails({ ctx: params.ctx }),
      event: "request_data",
      request: GetHttpRequestMetadata({ ctx: params.ctx }),
      content_encoding: decoded_request_body.content_encoding,
      content_encodings: decoded_request_body.content_encodings,
      raw_data: decoded_request_body.raw_data,
      decoded_data: decoded_request_body.decoded_data,
      data_is_decoded: decoded_request_body.data_is_decoded,
      decode_error: decoded_request_body.decode_error,
      data: decoded_request_body.decoded_data,
      handles: this.buildHttpHandles({ ctx: params.ctx }),
    };

    const callback_result = await this.resolveHttpInterceptionResultFromChain({
      callback_context,
      get_plugin_callback: ({ plugin_instance }) =>
        plugin_instance.http?.client_to_server?.requestData,
      instance_callback: params.callback_handler,
    });

    if (callback_result.state === "MODIFIED" && callback_result.headers) {
      ApplyHeaderEntriesToObject({
        headers: request_headers,
        header_entries: callback_result.headers,
      });
    }

    if (callback_result.state === "TERMINATE") {
      this.terminateHttpConnection({ ctx: params.ctx, connection_state });
      throw CreateTerminatedError();
    }

    const proxy_to_server_request = params.ctx.proxyToServerRequest;
    if (!proxy_to_server_request) {
      return;
    }

    let request_body_to_send = request_body_raw;
    if (callback_result.state === "MODIFIED") {
      const final_content_encodings = ParseContentEncodings({
        content_encoding: ReadContentEncodingHeader({ headers: request_headers }),
      });
      NormalizeContentEncodingHeader({
        headers: request_headers,
        content_encodings: final_content_encodings,
      });

      let decoded_body_to_send: Buffer | undefined;
      if (typeof callback_result.data !== "undefined") {
        decoded_body_to_send =
          ToBuffer({ data: callback_result.data }) || Buffer.alloc(0);
      } else if (
        decoded_request_body.data_is_decoded ||
        decoded_request_body.content_encodings.length === 0
      ) {
        decoded_body_to_send = decoded_request_body.decoded_data;
      } else if (
        ContentEncodingArraysEqual({
          left: decoded_request_body.content_encodings,
          right: final_content_encodings,
        })
      ) {
        // No decoded body override and no encoding change: preserve original
        // wire bytes to avoid unnecessary recompression drift.
        decoded_body_to_send = undefined;
      } else {
        throw new Error(
          "Unable to decode request body with current content-encoding."
        );
      }

      if (decoded_body_to_send) {
        const encoded_request_body = ApplyBodyToEncoding({
          decoded_data: decoded_body_to_send,
          content_encodings: final_content_encodings,
        });
        if (encoded_request_body.encode_error) {
          throw new Error(encoded_request_body.encode_error);
        }
        request_body_to_send = encoded_request_body.encoded_data;
      } else {
        request_body_to_send = request_body_raw;
      }
    }

    if (callback_result.headers && callback_result.headers.length > 0) {
      ApplyHeaderEntriesToOutgoingMessage({
        target: proxy_to_server_request,
        header_entries: callback_result.headers,
      });
    }

    if (typeof request_headers["content-encoding"] === "undefined") {
      proxy_to_server_request.removeHeader("content-encoding");
    } else {
      proxy_to_server_request.setHeader(
        "content-encoding",
        request_headers["content-encoding"] as string | string[]
      );
    }

    proxy_to_server_request.removeHeader("transfer-encoding");
    proxy_to_server_request.setHeader(
      "content-length",
      String(request_body_to_send.length)
    );

    if (request_body_to_send.length > 0) {
      proxy_to_server_request.write(request_body_to_send);
    }
  }

  private async handleResponseHeadersCallback(params: {
    ctx: IContext;
    callback_handler:
      | ((params: { context: http_response_headers_callback_context_t }) => Promise<http_interception_result_t | void>)
      | undefined;
  }): Promise<void> {
    const connection_state = this.getOrCreateHttpState({ ctx: params.ctx });

    const callback_context: http_response_headers_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: connection_state.connection_started_at_ms,
      intercepted_at_ms: Date.now(),
      protocol: "http",
      is_ssl: params.ctx.isSSL,
      direction: "server_to_client",
      ...BuildHttpNetworkDetails({ ctx: params.ctx }),
      event: "response_headers",
      request: GetHttpRequestMetadata({ ctx: params.ctx }),
      response: GetHttpResponseMetadata({ ctx: params.ctx }),
      handles: this.buildHttpHandles({ ctx: params.ctx }),
    };

    const callback_result = await this.resolveHttpInterceptionResultFromChain({
      callback_context,
      get_plugin_callback: ({ plugin_instance }) =>
        plugin_instance.http?.server_to_client?.responseHeaders,
      instance_callback: params.callback_handler,
    });

    if (callback_result.state === "TERMINATE") {
      this.terminateHttpConnection({ ctx: params.ctx, connection_state });
      throw CreateTerminatedError();
    }

    if (callback_result.state === "MODIFIED") {
      if (callback_result.headers) {
        ApplyHeaderEntriesToObject({
          headers: params.ctx.serverToProxyResponse?.headers || {},
          header_entries: callback_result.headers,
        });
      }

      if (typeof callback_result.status_code !== "undefined") {
        connection_state.response_status_code_override = callback_result.status_code;
      }

      if (typeof callback_result.status_message !== "undefined") {
        connection_state.response_status_message_override =
          callback_result.status_message;
      }

      if (typeof callback_result.data !== "undefined") {
        connection_state.response_override_body =
          ToBuffer({ data: callback_result.data }) || Buffer.alloc(0);
      }
    }
  }

  private async handleResponseDataCallback(params: {
    ctx: IContext;
    callback_handler:
      | ((params: { context: http_response_data_callback_context_t }) => Promise<http_interception_result_t | void>)
      | undefined;
  }): Promise<void> {
    const connection_state = this.getOrCreateHttpState({ ctx: params.ctx });

    let response_body_raw = connection_state.response_override_body;
    if (!response_body_raw) {
      response_body_raw = Buffer.concat(connection_state.response_chunks);
    }
    const response_headers = (params.ctx.serverToProxyResponse?.headers ||
      {}) as OutgoingHttpHeaders;
    const decoded_response_body = DecodeBodyFromHeaders({
      raw_data: response_body_raw,
      headers: response_headers,
    });

    const callback_context: http_response_data_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: connection_state.connection_started_at_ms,
      intercepted_at_ms: Date.now(),
      protocol: "http",
      is_ssl: params.ctx.isSSL,
      direction: "server_to_client",
      ...BuildHttpNetworkDetails({ ctx: params.ctx }),
      event: "response_data",
      request: GetHttpRequestMetadata({ ctx: params.ctx }),
      response: GetHttpResponseMetadata({ ctx: params.ctx }),
      content_encoding: decoded_response_body.content_encoding,
      content_encodings: decoded_response_body.content_encodings,
      raw_data: decoded_response_body.raw_data,
      decoded_data: decoded_response_body.decoded_data,
      data_is_decoded: decoded_response_body.data_is_decoded,
      decode_error: decoded_response_body.decode_error,
      data: decoded_response_body.decoded_data,
      handles: this.buildHttpHandles({ ctx: params.ctx }),
    };

    const callback_result = await this.resolveHttpInterceptionResultFromChain({
      callback_context,
      get_plugin_callback: ({ plugin_instance }) =>
        plugin_instance.http?.server_to_client?.responseData,
      instance_callback: params.callback_handler,
    });

    if (callback_result.state === "TERMINATE") {
      this.terminateHttpConnection({ ctx: params.ctx, connection_state });
      throw CreateTerminatedError();
    }

    if (callback_result.headers) {
      ApplyHeaderEntriesToObject({
        headers: response_headers,
        header_entries: callback_result.headers,
      });
    }

    if (typeof callback_result.status_code !== "undefined") {
      connection_state.response_status_code_override = callback_result.status_code;
    }

    if (typeof callback_result.status_message !== "undefined") {
      connection_state.response_status_message_override = callback_result.status_message;
    }

    let response_body_to_send = response_body_raw;
    if (callback_result.state === "MODIFIED") {
      const final_content_encodings = ParseContentEncodings({
        content_encoding: ReadContentEncodingHeader({ headers: response_headers }),
      });
      NormalizeContentEncodingHeader({
        headers: response_headers,
        content_encodings: final_content_encodings,
      });

      let decoded_body_to_send: Buffer | undefined;
      if (typeof callback_result.data !== "undefined") {
        decoded_body_to_send =
          ToBuffer({ data: callback_result.data }) || Buffer.alloc(0);
      } else if (
        decoded_response_body.data_is_decoded ||
        decoded_response_body.content_encodings.length === 0
      ) {
        decoded_body_to_send = decoded_response_body.decoded_data;
      } else if (
        ContentEncodingArraysEqual({
          left: decoded_response_body.content_encodings,
          right: final_content_encodings,
        })
      ) {
        // Preserve original encoded bytes when body content/encoding is unchanged.
        decoded_body_to_send = undefined;
      } else {
        throw new Error(
          "Unable to decode response body with current content-encoding."
        );
      }

      if (decoded_body_to_send) {
        const encoded_response_body = ApplyBodyToEncoding({
          decoded_data: decoded_body_to_send,
          content_encodings: final_content_encodings,
        });
        if (encoded_response_body.encode_error) {
          throw new Error(encoded_response_body.encode_error);
        }
        response_body_to_send = encoded_response_body.encoded_data;
      } else {
        response_body_to_send = response_body_raw;
      }
    }

    response_headers["content-length"] = String(response_body_to_send.length);
    delete response_headers["transfer-encoding"];

    const status_code =
      connection_state.response_status_code_override ||
      params.ctx.serverToProxyResponse?.statusCode ||
      200;
    const status_message =
      connection_state.response_status_message_override ||
      params.ctx.serverToProxyResponse?.statusMessage;

    if (!params.ctx.proxyToClientResponse.headersSent) {
      if (status_message) {
        params.ctx.proxyToClientResponse.writeHead(
          status_code,
          status_message,
          Proxy.filterAndCanonizeHeaders(response_headers as IncomingHttpHeaders)
        );
      } else {
        params.ctx.proxyToClientResponse.writeHead(
          status_code,
          Proxy.filterAndCanonizeHeaders(response_headers as IncomingHttpHeaders)
        );
      }
    }

    if (response_body_to_send.length > 0) {
      params.ctx.proxyToClientResponse.write(response_body_to_send);
    }
  }

  private async executeHttpCallback(params: {
    callback_executor: () => Promise<http_interception_result_t>;
  }): Promise<http_interception_result_t> {
    try {
      return await params.callback_executor();
    } catch (error) {
      // Callback exceptions are policy-driven: either fail-closed (TERMINATE)
      // or fail-open (PASSTHROUGH).
      if (this.callback_error_policy === "PASSTHROUGH") {
        return { state: "PASSTHROUGH" };
      }
      return { state: "TERMINATE" };
    }
  }

  private async executeHttpPluginCallback(params: {
    callback_executor: () => Promise<plugin_http_interception_result_t>;
  }): Promise<plugin_http_interception_result_t> {
    try {
      return await params.callback_executor();
    } catch {
      if (this.callback_error_policy === "PASSTHROUGH") {
        return { state: "PASSTHROUGH" };
      }
      return { state: "TERMINATE" };
    }
  }

  private terminateHttpConnection(params: {
    ctx: IContext;
    connection_state: http_connection_state_t;
  }): void {
    // Mark intent first so proxy-level error paths do not emit synthetic 504
    // responses for expected TERMINATE actions.
    params.connection_state.terminated = true;
    params.ctx.tags = params.ctx.tags || {
      id: 0,
      uri: "",
      failedUpstreamCalls: 0,
      retryProxyRequest: false,
    };
    params.ctx.tags[HTTPMITM_TERMINATED_KEY] = true;

    params.ctx.clientToProxyRequest.destroy();
    params.ctx.proxyToServerRequest?.destroy();
    params.ctx.serverToProxyResponse?.destroy();
    params.ctx.proxyToClientResponse.destroy();
  }

  private async handleWebSocketUpgradeCallback(params: {
    ctx: IWebSocketContext;
    callback_handler:
      | ((params: {
          context: websocket_upgrade_callback_context_t;
        }) => Promise<websocket_interception_result_t | void>)
      | undefined;
  }): Promise<void> {
    const upgrade_request = (
      params.ctx.clientToProxyWebSocket as WebSocket & {
        upgradeReq?: {
          url?: string;
          method?: string;
          httpVersion?: string;
          headers?: IncomingHttpHeaders;
        };
      }
    )?.upgradeReq;

    const callback_context: websocket_upgrade_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: Date.now(),
      intercepted_at_ms: Date.now(),
      protocol: "websocket",
      is_ssl: params.ctx.isSSL,
      ...BuildWebSocketNetworkDetails({ ctx: params.ctx }),
      event: "server_upgrade",
      direction: "client_to_server",
      upgrade_request: {
        url: upgrade_request?.url,
        method: upgrade_request?.method,
        http_version: upgrade_request?.httpVersion,
        headers: HeadersObjectToEntries({
          headers: upgrade_request?.headers || {},
        }),
      },
      handles: {
        raw_context: params.ctx,
        connect_request: params.ctx.connectRequest,
        client_to_proxy_websocket: params.ctx.clientToProxyWebSocket,
        proxy_to_server_websocket: params.ctx.proxyToServerWebSocket,
      },
    };

    const callback_result = await this.resolveWebSocketInterceptionResultFromChain({
      callback_context,
      get_plugin_callback: ({ plugin_instance }) =>
        plugin_instance.websocket?.onServerUpgrade,
      instance_callback: params.callback_handler,
    });

    if (callback_result.state === "TERMINATE") {
      this.terminateWebSocketConnection({ ctx: params.ctx });
      throw CreateTerminatedError();
    }

    if (callback_result.state === "MODIFIED" && callback_result.headers) {
      const proxy_headers = params.ctx.proxyToServerWebSocketOptions
        ?.headers as OutgoingHttpHeaders;
      if (proxy_headers) {
        ApplyHeaderEntriesToObject({
          headers: proxy_headers,
          header_entries: callback_result.headers,
        });
      }
    }
  }

  private async handleWebSocketFrameCallback(params: {
    ctx: IWebSocketContext;
    message: WebSocket.RawData;
    flags: boolean | undefined;
    frame_type: "message" | "ping" | "pong";
    from_server: boolean;
    callback_handler:
      | ((params: {
          context: websocket_frame_callback_context_t;
        }) => Promise<websocket_interception_result_t | void>)
      | undefined;
  }): Promise<{ message: WebSocket.RawData | string; flags: boolean | undefined }> {
    const callback_context: websocket_frame_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: Date.now(),
      intercepted_at_ms: Date.now(),
      protocol: "websocket",
      is_ssl: params.ctx.isSSL,
      ...BuildWebSocketNetworkDetails({ ctx: params.ctx }),
      event: "frame",
      direction: params.from_server ? "server_to_client" : "client_to_server",
      frame_type: params.frame_type,
      data: params.message,
      flags: params.flags,
      handles: {
        raw_context: params.ctx,
        connect_request: params.ctx.connectRequest,
        client_to_proxy_websocket: params.ctx.clientToProxyWebSocket,
        proxy_to_server_websocket: params.ctx.proxyToServerWebSocket,
      },
    };

    const callback_result = await this.resolveWebSocketInterceptionResultFromChain({
      callback_context,
      get_plugin_callback: ({ plugin_instance }) =>
        params.from_server
          ? plugin_instance.websocket?.onFrameReceived
          : plugin_instance.websocket?.onFrameSent,
      instance_callback: params.callback_handler,
    });

    if (callback_result.state === "TERMINATE") {
      this.terminateWebSocketConnection({ ctx: params.ctx });
      throw CreateTerminatedError();
    }

    let output_message: WebSocket.RawData | string = params.message;
    let output_flags = params.flags;

    if (callback_result.state === "MODIFIED") {
      if (typeof callback_result.data !== "undefined") {
        output_message = callback_result.data;
      }
      if (typeof callback_result.flags !== "undefined") {
        output_flags = callback_result.flags;
      }
    }

    return { message: output_message, flags: output_flags };
  }

  private async handleWebSocketCloseCallback(params: {
    ctx: IWebSocketContext;
    code: number;
    message: Buffer;
    callback_handler:
      | ((params: { context: websocket_close_callback_context_t }) => Promise<void>)
      | undefined;
  }): Promise<void> {
    const callback_context: websocket_close_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: Date.now(),
      intercepted_at_ms: Date.now(),
      protocol: "websocket",
      is_ssl: params.ctx.isSSL,
      ...BuildWebSocketNetworkDetails({ ctx: params.ctx }),
      event: "connection_terminated",
      direction: params.ctx.closedByServer ? "server_to_client" : "client_to_server",
      closed_by_server: !!params.ctx.closedByServer,
      code: params.code,
      message: params.message,
      handles: {
        raw_context: params.ctx,
        connect_request: params.ctx.connectRequest,
        client_to_proxy_websocket: params.ctx.clientToProxyWebSocket,
        proxy_to_server_websocket: params.ctx.proxyToServerWebSocket,
      },
    };

    for (const plugin_instance of this.plugin_instances) {
      const plugin_callback = plugin_instance.websocket?.onConnectionTerminated;
      if (!plugin_callback) {
        continue;
      }

      const plugin_result = await this.executeWebSocketPluginCallback({
        callback_executor: async () =>
          NormalizePluginWebSocketResult({
            result: await plugin_callback({ context: callback_context }),
          }),
      });

      if (plugin_result.state === "CONTINUE") {
        continue;
      }

      if (plugin_result.state === "TERMINATE") {
        this.terminateWebSocketConnection({ ctx: params.ctx });
      }

      return;
    }

    if (!params.callback_handler) {
      return;
    }

    try {
      await params.callback_handler({ context: callback_context });
    } catch (error) {
      if (this.callback_error_policy === "TERMINATE") {
        throw error as Error;
      }
    }
  }

  private async executeWebSocketCallback(params: {
    callback_executor: () => Promise<websocket_interception_result_t>;
  }): Promise<websocket_interception_result_t> {
    try {
      return await params.callback_executor();
    } catch (error) {
      if (this.callback_error_policy === "PASSTHROUGH") {
        return { state: "PASSTHROUGH" };
      }
      return { state: "TERMINATE" };
    }
  }

  private async executeWebSocketPluginCallback(params: {
    callback_executor: () => Promise<plugin_websocket_interception_result_t>;
  }): Promise<plugin_websocket_interception_result_t> {
    try {
      return await params.callback_executor();
    } catch {
      if (this.callback_error_policy === "PASSTHROUGH") {
        return { state: "PASSTHROUGH" };
      }
      return { state: "TERMINATE" };
    }
  }

  private terminateWebSocketConnection(params: { ctx: IWebSocketContext }): void {
    // Close both directions defensively; ws state can diverge under errors.
    try {
      if (IsWebSocketOpen({ websocket: params.ctx.clientToProxyWebSocket })) {
        params.ctx.clientToProxyWebSocket?.terminate();
      }
    } catch {
      // ignore
    }

    try {
      if (IsWebSocketOpen({ websocket: params.ctx.proxyToServerWebSocket })) {
        params.ctx.proxyToServerWebSocket?.terminate();
      }
    } catch {
      // ignore
    }

    // @ts-ignore
    params.ctx.clientToProxyWebSocket?._socket?.destroy();
    // @ts-ignore
    params.ctx.proxyToServerWebSocket?._socket?.destroy();
  }
}
