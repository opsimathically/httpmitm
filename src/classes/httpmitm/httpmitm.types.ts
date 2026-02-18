import type { IncomingMessage, ServerResponse } from "http";
import type WebSocket from "ws";
import type { Proxy } from "../../forked_code/proxy";
import type { IContext, IWebSocketContext } from "../../forked_code/types";

export type interception_state_t = "PASSTHROUGH" | "TERMINATE" | "MODIFIED";

export type callback_error_policy_t = "TERMINATE" | "PASSTHROUGH";

export type header_value_t = string | string[] | null;

export type header_entry_t = {
  name: string;
  value: header_value_t;
};

export type http_interception_result_t = {
  state: interception_state_t;
  headers?: header_entry_t[];
  data?: Buffer | string;
  status_code?: number;
  status_message?: string;
};

export type websocket_interception_result_t = {
  state: interception_state_t;
  headers?: header_entry_t[];
  data?: WebSocket.RawData | string;
  flags?: boolean;
};

export type http_request_metadata_t = {
  method: string | undefined;
  url: string | undefined;
  http_version: string | undefined;
  headers: header_entry_t[];
};

export type http_response_metadata_t = {
  status_code: number | undefined;
  status_message: string | undefined;
  http_version: string | undefined;
  headers: header_entry_t[];
};

export type http_callback_handles_t = {
  raw_context: IContext;
  connect_request: IncomingMessage | undefined;
  client_to_proxy_request: IncomingMessage;
  proxy_to_client_response: ServerResponse;
  proxy_to_server_request: IContext["proxyToServerRequest"];
  server_to_proxy_response: IContext["serverToProxyResponse"];
};

export type websocket_callback_handles_t = {
  raw_context: IWebSocketContext;
  connect_request: IncomingMessage | undefined;
  client_to_proxy_websocket: IWebSocketContext["clientToProxyWebSocket"];
  proxy_to_server_websocket: IWebSocketContext["proxyToServerWebSocket"];
};

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

export type http_request_headers_callback_context_t =
  http_callback_context_base_t & {
    event: "request_headers";
    request: http_request_metadata_t;
  };

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

export type http_response_headers_callback_context_t =
  http_callback_context_base_t & {
    event: "response_headers";
    request: http_request_metadata_t;
    response: http_response_metadata_t;
  };

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

export type websocket_upgrade_request_metadata_t = {
  url: string | undefined;
  method: string | undefined;
  http_version: string | undefined;
  headers: header_entry_t[];
};

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

export type websocket_upgrade_callback_context_t =
  websocket_callback_context_base_t & {
    event: "server_upgrade";
    direction: "client_to_server";
    upgrade_request: websocket_upgrade_request_metadata_t;
  };

export type websocket_frame_callback_context_t =
  websocket_callback_context_base_t & {
    event: "frame";
    direction: "client_to_server" | "server_to_client";
    frame_type: "message" | "ping" | "pong";
    data: WebSocket.RawData;
    flags: boolean | undefined;
  };

export type websocket_close_callback_context_t =
  websocket_callback_context_base_t & {
    event: "connection_terminated";
    direction: "client_to_server" | "server_to_client";
    closed_by_server: boolean;
    code: number;
    message: Buffer;
  };

export type http_request_headers_callback_t = (params: {
  context: http_request_headers_callback_context_t;
}) => Promise<http_interception_result_t | void>;

export type http_request_data_callback_t = (params: {
  context: http_request_data_callback_context_t;
}) => Promise<http_interception_result_t | void>;

export type http_response_headers_callback_t = (params: {
  context: http_response_headers_callback_context_t;
}) => Promise<http_interception_result_t | void>;

export type http_response_data_callback_t = (params: {
  context: http_response_data_callback_context_t;
}) => Promise<http_interception_result_t | void>;

export type websocket_server_upgrade_callback_t = (params: {
  context: websocket_upgrade_callback_context_t;
}) => Promise<websocket_interception_result_t | void>;

export type websocket_frame_sent_callback_t = (params: {
  context: websocket_frame_callback_context_t;
}) => Promise<websocket_interception_result_t | void>;

export type websocket_frame_received_callback_t = (params: {
  context: websocket_frame_callback_context_t;
}) => Promise<websocket_interception_result_t | void>;

export type websocket_connection_terminated_callback_t = (params: {
  context: websocket_close_callback_context_t;
}) => Promise<void>;

export type http_callback_group_client_to_server_t = {
  requestHeaders?: http_request_headers_callback_t;
  requestData?: http_request_data_callback_t;
};

export type http_callback_group_server_to_client_t = {
  responseHeaders?: http_response_headers_callback_t;
  responseData?: http_response_data_callback_t;
};

export type http_callback_group_t = {
  client_to_server?: http_callback_group_client_to_server_t;
  server_to_client?: http_callback_group_server_to_client_t;
};

export type websocket_callback_group_t = {
  onServerUpgrade?: websocket_server_upgrade_callback_t;
  onFrameSent?: websocket_frame_sent_callback_t;
  onFrameReceived?: websocket_frame_received_callback_t;
  onConnectionTerminated?: websocket_connection_terminated_callback_t;
};

export type httpmitm_start_params_t = {
  host?: string;
  listen_port?: number;
  ssl_ca_dir?: string;
  keep_alive?: boolean;
  timeout?: number;
  force_sni?: boolean;
  https_listen_port?: number;
  force_chunked_request?: boolean;
  callback_error_policy?: callback_error_policy_t;
  http?: http_callback_group_t;
  websocket?: websocket_callback_group_t;
};

export type httpmitm_server_t = {
  proxy: Proxy;
  host: string;
  listen_port: number;
  close: () => Promise<void>;
};
