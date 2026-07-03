import type { Agent as HttpAgent, IncomingMessage, ServerResponse } from "http";
import type { Agent as HttpsAgent } from "https";
import type WebSocket from "ws";
import type { Proxy } from "../../forked_code/proxy";
import type { IContext, IWebSocketContext } from "../../forked_code/types";

/**
 * Result state returned by instance-level HTTP and WebSocket interception
 * callbacks.
 */
export type interception_state_t = "PASSTHROUGH" | "TERMINATE" | "MODIFIED";

/**
 * Result state returned by plugin callbacks. `CONTINUE` is plugin-only and
 * tells HTTPMITM to keep walking the plugin chain.
 */
export type plugin_interception_state_t = interception_state_t | "CONTINUE";

/**
 * Error and timeout policy for interception callbacks.
 *
 * `TERMINATE` is the default fail-closed behavior. `PASSTHROUGH` is fail-open
 * and forwards original traffic where the proxy can safely do so.
 */
export type callback_error_policy_t = "TERMINATE" | "PASSTHROUGH";

/** A normalized HTTP header value used by callback result objects. */
export type header_value_t = string | string[] | null;

/**
 * Runtime safety limits for buffered payloads and callback execution.
 *
 * Invalid, non-finite, or non-positive values are ignored and replaced with the
 * defaults documented on each field.
 */
export type httpmitm_limits_t = {
  /** Maximum buffered request body. Default: 10 MiB. */
  request_body_bytes?: number;
  /** Maximum buffered response body. Default: 25 MiB. */
  response_body_bytes?: number;
  /** Maximum WebSocket frame payload size. Default: 16 MiB. */
  websocket_frame_bytes?: number;
  /** Maximum interception callback runtime in milliseconds. Default: 30_000. */
  callback_timeout_ms?: number;
  /** Maximum external binary transform runtime in milliseconds. Default: 5_000. */
  binary_transform_timeout_ms?: number;
};

/** Structured metadata passed to optional logger methods. */
export type httpmitm_log_metadata_t = Record<
  string,
  string | number | boolean | null | undefined
>;

/**
 * Optional structured logger. The default logger is silent.
 *
 * HTTPMITM uses logger methods for diagnostics such as limit violations,
 * callback timeouts, and binary transform failures.
 */
export type httpmitm_logger_t = {
  debug?: (message: string, metadata?: httpmitm_log_metadata_t) => void;
  info?: (message: string, metadata?: httpmitm_log_metadata_t) => void;
  warn?: (message: string, metadata?: httpmitm_log_metadata_t) => void;
  error?: (message: string, metadata?: httpmitm_log_metadata_t) => void;
};

/** Header mutation entry returned by callbacks. */
export type header_entry_t = {
  /** Header name. */
  name: string;
  /** Header value, array value, or null. */
  value: header_value_t;
};

/**
 * Result returned by instance-level HTTP callbacks.
 *
 * `headers`, `data`, `status_code`, and `status_message` are applied only when
 * the callback returns `state: "MODIFIED"`.
 */
export type http_interception_result_t = {
  state: interception_state_t;
  headers?: header_entry_t[];
  data?: Buffer | string;
  status_code?: number;
  status_message?: string;
};

/**
 * Result returned by instance-level WebSocket callbacks.
 *
 * `data` and `flags` are applied only when the callback returns
 * `state: "MODIFIED"`.
 */
export type websocket_interception_result_t = {
  state: interception_state_t;
  headers?: header_entry_t[];
  data?: WebSocket.RawData | string;
  flags?: boolean;
};

/** Result returned by plugin HTTP callbacks. */
export type plugin_http_interception_result_t = {
  state: plugin_interception_state_t;
  headers?: header_entry_t[];
  data?: Buffer | string;
  status_code?: number;
  status_message?: string;
};

/** Result returned by plugin WebSocket callbacks. */
export type plugin_websocket_interception_result_t = {
  state: plugin_interception_state_t;
  headers?: header_entry_t[];
  data?: WebSocket.RawData | string;
  flags?: boolean;
};

/** Normalized request metadata exposed to HTTP callbacks. */
export type http_request_metadata_t = {
  method: string | undefined;
  url: string | undefined;
  http_version: string | undefined;
  headers: header_entry_t[];
};

/** Normalized response metadata exposed to HTTP callbacks. */
export type http_response_metadata_t = {
  status_code: number | undefined;
  status_message: string | undefined;
  http_version: string | undefined;
  headers: header_entry_t[];
};

/**
 * Low-level HTTP handles exposed for advanced integrations.
 *
 * Prefer normalized metadata on the callback context unless direct socket,
 * request, or response access is required.
 */
export type http_callback_handles_t = {
  raw_context: IContext;
  connect_request: IncomingMessage | undefined;
  client_to_proxy_request: IncomingMessage;
  proxy_to_client_response: ServerResponse;
  proxy_to_server_request: IContext["proxyToServerRequest"];
  server_to_proxy_response: IContext["serverToProxyResponse"];
};

/** Low-level WebSocket handles exposed for advanced integrations. */
export type websocket_callback_handles_t = {
  raw_context: IWebSocketContext;
  connect_request: IncomingMessage | undefined;
  client_to_proxy_websocket: IWebSocketContext["clientToProxyWebSocket"];
  proxy_to_server_websocket: IWebSocketContext["proxyToServerWebSocket"];
};

/** Shared fields present on every HTTP callback context. */
export type http_callback_context_base_t = {
  connection_id: string;
  connection_started_at_ms: number;
  intercepted_at_ms: number;
  protocol: "http";
  is_ssl: boolean;
  direction: "client_to_server" | "server_to_client";
  remote_ip: string | null;
  remote_port: number | null;
  remote_host: string | null;
  client_ip: string | null;
  client_port: number | null;
  client_host: string | null;
  handles: http_callback_handles_t;
};

/** Context passed to `http.client_to_server.requestHeaders`. */
export type http_request_headers_callback_context_t =
  http_callback_context_base_t & {
    event: "request_headers";
    request: http_request_metadata_t;
  };

/**
 * Context passed to `http.client_to_server.requestData`.
 *
 * `data` is decoded when decoding succeeds. `raw_data` always contains the
 * original wire bytes.
 */
export type http_request_data_callback_context_t = http_callback_context_base_t & {
  event: "request_data";
  request: http_request_metadata_t;
  content_encoding: string | null;
  content_encodings: string[];
  raw_data: Buffer;
  decoded_data: Buffer;
  data_is_decoded: boolean;
  decode_error: string | null;
  data: Buffer;
};

/** Context passed to `http.server_to_client.responseHeaders`. */
export type http_response_headers_callback_context_t =
  http_callback_context_base_t & {
    event: "response_headers";
    request: http_request_metadata_t;
    response: http_response_metadata_t;
  };

/**
 * Context passed to `http.server_to_client.responseData`.
 *
 * `data` is decoded when decoding succeeds. `raw_data` always contains the
 * original wire bytes.
 */
export type http_response_data_callback_context_t =
  http_callback_context_base_t & {
    event: "response_data";
    request: http_request_metadata_t;
    response: http_response_metadata_t;
    content_encoding: string | null;
    content_encodings: string[];
    raw_data: Buffer;
    decoded_data: Buffer;
    data_is_decoded: boolean;
    decode_error: string | null;
    data: Buffer;
  };

/** Normalized WebSocket upgrade request metadata. */
export type websocket_upgrade_request_metadata_t = {
  url: string | undefined;
  method: string | undefined;
  http_version: string | undefined;
  headers: header_entry_t[];
};

/** Shared fields present on every WebSocket callback context. */
export type websocket_callback_context_base_t = {
  connection_id: string;
  connection_started_at_ms: number;
  intercepted_at_ms: number;
  protocol: "websocket";
  is_ssl: boolean;
  remote_ip: string | null;
  remote_port: number | null;
  remote_host: string | null;
  client_ip: string | null;
  client_port: number | null;
  client_host: string | null;
  handles: websocket_callback_handles_t;
};

/** Context passed to `websocket.onServerUpgrade`. */
export type websocket_upgrade_callback_context_t =
  websocket_callback_context_base_t & {
    event: "server_upgrade";
    direction: "client_to_server";
    upgrade_request: websocket_upgrade_request_metadata_t;
  };

/** Context passed to WebSocket frame callbacks. */
export type websocket_frame_callback_context_t =
  websocket_callback_context_base_t & {
    event: "frame";
    direction: "client_to_server" | "server_to_client";
    frame_type: "message" | "ping" | "pong";
    data: WebSocket.RawData;
    flags: boolean | undefined;
  };

/** Context passed to `websocket.onConnectionTerminated`. */
export type websocket_close_callback_context_t =
  websocket_callback_context_base_t & {
    event: "connection_terminated";
    direction: "client_to_server" | "server_to_client";
    closed_by_server: boolean;
    code: number;
    message: Buffer;
  };

/** Callback for HTTP request headers. */
export type http_request_headers_callback_t = (params: {
  context: http_request_headers_callback_context_t;
}) => Promise<http_interception_result_t | void>;

/** Callback for buffered HTTP request body data. */
export type http_request_data_callback_t = (params: {
  context: http_request_data_callback_context_t;
}) => Promise<http_interception_result_t | void>;

/** Callback for HTTP response headers. */
export type http_response_headers_callback_t = (params: {
  context: http_response_headers_callback_context_t;
}) => Promise<http_interception_result_t | void>;

/** Callback for buffered HTTP response body data. */
export type http_response_data_callback_t = (params: {
  context: http_response_data_callback_context_t;
}) => Promise<http_interception_result_t | void>;

/** Callback for WebSocket upgrade requests. */
export type websocket_server_upgrade_callback_t = (params: {
  context: websocket_upgrade_callback_context_t;
}) => Promise<websocket_interception_result_t | void>;

/** Callback for client-to-server WebSocket frames. */
export type websocket_frame_sent_callback_t = (params: {
  context: websocket_frame_callback_context_t;
}) => Promise<websocket_interception_result_t | void>;

/** Callback for server-to-client WebSocket frames. */
export type websocket_frame_received_callback_t = (params: {
  context: websocket_frame_callback_context_t;
}) => Promise<websocket_interception_result_t | void>;

/** Callback for WebSocket close events. */
export type websocket_connection_terminated_callback_t = (params: {
  context: websocket_close_callback_context_t;
}) => Promise<void>;

/** Plugin callback for HTTP request headers. */
export type plugin_http_request_headers_callback_t = (params: {
  context: http_request_headers_callback_context_t;
}) => Promise<plugin_http_interception_result_t | void>;

/** Plugin callback for buffered HTTP request body data. */
export type plugin_http_request_data_callback_t = (params: {
  context: http_request_data_callback_context_t;
}) => Promise<plugin_http_interception_result_t | void>;

/** Plugin callback for HTTP response headers. */
export type plugin_http_response_headers_callback_t = (params: {
  context: http_response_headers_callback_context_t;
}) => Promise<plugin_http_interception_result_t | void>;

/** Plugin callback for buffered HTTP response body data. */
export type plugin_http_response_data_callback_t = (params: {
  context: http_response_data_callback_context_t;
}) => Promise<plugin_http_interception_result_t | void>;

/** Plugin callback for WebSocket upgrade requests. */
export type plugin_websocket_server_upgrade_callback_t = (params: {
  context: websocket_upgrade_callback_context_t;
}) => Promise<plugin_websocket_interception_result_t | void>;

/** Plugin callback for client-to-server WebSocket frames. */
export type plugin_websocket_frame_sent_callback_t = (params: {
  context: websocket_frame_callback_context_t;
}) => Promise<plugin_websocket_interception_result_t | void>;

/** Plugin callback for server-to-client WebSocket frames. */
export type plugin_websocket_frame_received_callback_t = (params: {
  context: websocket_frame_callback_context_t;
}) => Promise<plugin_websocket_interception_result_t | void>;

/** Plugin callback for WebSocket close events. */
export type plugin_websocket_connection_terminated_callback_t = (params: {
  context: websocket_close_callback_context_t;
}) => Promise<plugin_websocket_interception_result_t | void>;

/** Client-to-server HTTP callback group. */
export type http_callback_group_client_to_server_t = {
  requestHeaders?: http_request_headers_callback_t;
  requestData?: http_request_data_callback_t;
};

/** Server-to-client HTTP callback group. */
export type http_callback_group_server_to_client_t = {
  responseHeaders?: http_response_headers_callback_t;
  responseData?: http_response_data_callback_t;
};

/** HTTP callbacks accepted by `HTTPMITM.start()`. */
export type http_callback_group_t = {
  client_to_server?: http_callback_group_client_to_server_t;
  server_to_client?: http_callback_group_server_to_client_t;
};

/** WebSocket callbacks accepted by `HTTPMITM.start()`. */
export type websocket_callback_group_t = {
  onServerUpgrade?: websocket_server_upgrade_callback_t;
  onFrameSent?: websocket_frame_sent_callback_t;
  onFrameReceived?: websocket_frame_received_callback_t;
  onConnectionTerminated?: websocket_connection_terminated_callback_t;
};

/** Client-to-server HTTP hooks supported by plugins. */
export interface httpmitm_plugin_http_hooks_client_to_server_i {
  requestHeaders?: plugin_http_request_headers_callback_t;
  requestData?: plugin_http_request_data_callback_t;
}

/** Server-to-client HTTP hooks supported by plugins. */
export interface httpmitm_plugin_http_hooks_server_to_client_i {
  responseHeaders?: plugin_http_response_headers_callback_t;
  responseData?: plugin_http_response_data_callback_t;
}

/** HTTP hook groups supported by plugins. */
export interface httpmitm_plugin_http_hooks_i {
  client_to_server?: httpmitm_plugin_http_hooks_client_to_server_i;
  server_to_client?: httpmitm_plugin_http_hooks_server_to_client_i;
}

/** WebSocket hooks supported by plugins. */
export interface httpmitm_plugin_websocket_hooks_i {
  onServerUpgrade?: plugin_websocket_server_upgrade_callback_t;
  onFrameSent?: plugin_websocket_frame_sent_callback_t;
  onFrameReceived?: plugin_websocket_frame_received_callback_t;
  onConnectionTerminated?: plugin_websocket_connection_terminated_callback_t;
}

/**
 * Plugin contract accepted by `HTTPMITM.start()`.
 *
 * A plugin must implement at least one supported HTTP or WebSocket hook.
 */
export interface httpmitm_plugin_i {
  /** Optional diagnostic plugin name. */
  plugin_name?: string;
  http?: httpmitm_plugin_http_hooks_i;
  websocket?: httpmitm_plugin_websocket_hooks_i;
}

/** Start parameters for the preferred public `HTTPMITM` wrapper API. */
export type httpmitm_start_params_t = {
  /** Proxy host. Defaults to `localhost` in the returned server metadata. */
  host?: string;
  /** HTTP proxy listen port. Use `0` to request an ephemeral port. */
  listen_port?: number;
  /** Directory for generated CA and leaf certificate material. */
  ssl_ca_dir?: string;
  /** Enable keep-alive behavior in the underlying proxy. */
  keep_alive?: boolean;
  /** Underlying proxy socket timeout in milliseconds. */
  timeout?: number;
  /** Force SNI handling in the underlying proxy. */
  force_sni?: boolean;
  /** Optional HTTPS proxy listen port used by the underlying proxy. */
  https_listen_port?: number;
  /** Optional upstream HTTP agent. */
  http_agent?: HttpAgent;
  /** Optional upstream HTTPS agent for custom upstream TLS trust. */
  https_agent?: HttpsAgent;
  /** Force chunked request forwarding in the underlying proxy. */
  force_chunked_request?: boolean;
  /** Callback error and timeout policy. Default: `TERMINATE`. */
  callback_error_policy?: callback_error_policy_t;
  /** Runtime payload and callback safety limits. */
  limits?: httpmitm_limits_t;
  /** Optional structured diagnostics logger. Default: silent. */
  logger?: httpmitm_logger_t;
  /** Ordered plugin instances. */
  plugins?: httpmitm_plugin_i[];
  /** HTTP interception callbacks. */
  http?: http_callback_group_t;
  /** WebSocket interception callbacks. */
  websocket?: websocket_callback_group_t;
};

/** Server handle returned by `HTTPMITM.start()`. */
export type httpmitm_server_t = {
  /** Low-level forked proxy instance. Prefer `HTTPMITM` unless internals are required. */
  proxy: Proxy;
  /** Effective proxy host metadata. */
  host: string;
  /** Effective HTTP proxy listen port. */
  listen_port: number;
  /** Awaitable shutdown for all managed proxy servers. */
  close: () => Promise<void>;
};
