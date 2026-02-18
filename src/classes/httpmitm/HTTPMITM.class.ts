import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import type WebSocket from "ws";
import { Proxy } from "../../forked_code/proxy";
import type { IContext, IWebSocketContext } from "../../forked_code/types";
import type {
  callback_error_policy_t,
  header_entry_t,
  header_value_t,
  http_interception_result_t,
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

function CreateTerminatedError(): Error {
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

export class HTTPMITM {
  private proxy_instance: Proxy | undefined;
  private callback_error_policy: callback_error_policy_t;

  constructor() {
    this.callback_error_policy = "TERMINATE";
  }

  async start(params: httpmitm_start_params_t): Promise<httpmitm_server_t> {
    if (this.proxy_instance) {
      await this.stop();
    }

    this.callback_error_policy = params.callback_error_policy || "TERMINATE";

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

  private registerHttpCallbacks(params: {
    proxy_instance: Proxy;
    start_params: httpmitm_start_params_t;
  }): void {
    const http_callbacks = params.start_params.http;
    if (!http_callbacks) {
      return;
    }

    const has_request_callbacks =
      !!http_callbacks.client_to_server?.requestHeaders ||
      !!http_callbacks.client_to_server?.requestData;
    const has_response_callbacks =
      !!http_callbacks.server_to_client?.responseHeaders ||
      !!http_callbacks.server_to_client?.responseData;

    params.proxy_instance.onRequest((ctx, callback) => {
      this.getOrCreateHttpState({ ctx });
      if (has_response_callbacks) {
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
          callback_handler: http_callbacks.client_to_server?.requestHeaders,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });

      params.proxy_instance.onRequestData((ctx, chunk, callback) => {
        const connection_state = this.getOrCreateHttpState({ ctx });
        connection_state.request_chunks.push(Buffer.from(chunk));
        callback(null, undefined);
      });

      params.proxy_instance.onRequestEnd((ctx, callback) => {
        void this.handleRequestDataCallback({
          ctx,
          callback_handler: http_callbacks.client_to_server?.requestData,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });
    }

    if (has_response_callbacks) {
      params.proxy_instance.onResponseHeaders((ctx, callback) => {
        void this.handleResponseHeadersCallback({
          ctx,
          callback_handler: http_callbacks.server_to_client?.responseHeaders,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });

      params.proxy_instance.onResponseData((ctx, chunk, callback) => {
        const connection_state = this.getOrCreateHttpState({ ctx });
        connection_state.response_chunks.push(Buffer.from(chunk));
        callback(null, undefined);
      });

      params.proxy_instance.onResponseEnd((ctx, callback) => {
        void this.handleResponseDataCallback({
          ctx,
          callback_handler: http_callbacks.server_to_client?.responseData,
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
    if (!websocket_callbacks) {
      return;
    }

    const on_server_upgrade = websocket_callbacks.onServerUpgrade;
    if (on_server_upgrade) {
      params.proxy_instance.onWebSocketConnection((ctx, callback) => {
        void this.handleWebSocketUpgradeCallback({
          ctx,
          callback_handler: on_server_upgrade,
        })
          .then(() => callback(null))
          .catch((error) => callback(error as Error));
      });
    }

    const on_frame_sent = websocket_callbacks.onFrameSent;
    if (on_frame_sent) {
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

    const on_frame_received = websocket_callbacks.onFrameReceived;
    if (on_frame_received) {
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

    const on_connection_terminated = websocket_callbacks.onConnectionTerminated;
    if (on_connection_terminated) {
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
    if (!params.callback_handler) {
      return;
    }

    const connection_state = this.getOrCreateHttpState({ ctx: params.ctx });

    const callback_context: http_request_headers_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: connection_state.connection_started_at_ms,
      intercepted_at_ms: Date.now(),
      protocol: "http",
      is_ssl: params.ctx.isSSL,
      direction: "client_to_server",
      event: "request_headers",
      request: GetHttpRequestMetadata({ ctx: params.ctx }),
      handles: this.buildHttpHandles({ ctx: params.ctx }),
    };

    const callback_result = await this.executeHttpCallback({
      callback_executor: async () =>
        NormalizeHttpResult({
          result: await params.callback_handler!({ context: callback_context }),
        }),
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
    let request_body = connection_state.request_override_body;
    if (!request_body) {
      request_body = Buffer.concat(connection_state.request_chunks);
    }

    let callback_result: http_interception_result_t = { state: "PASSTHROUGH" };

    if (params.callback_handler) {
      const callback_context: http_request_data_callback_context_t = {
        connection_id: params.ctx.uuid,
        connection_started_at_ms: connection_state.connection_started_at_ms,
        intercepted_at_ms: Date.now(),
        protocol: "http",
        is_ssl: params.ctx.isSSL,
        direction: "client_to_server",
        event: "request_data",
        request: GetHttpRequestMetadata({ ctx: params.ctx }),
        data: request_body,
        handles: this.buildHttpHandles({ ctx: params.ctx }),
      };

      callback_result = await this.executeHttpCallback({
        callback_executor: async () =>
          NormalizeHttpResult({
            result: await params.callback_handler!({ context: callback_context }),
          }),
      });
    }

    if (callback_result.data) {
      request_body = ToBuffer({ data: callback_result.data }) || Buffer.alloc(0);
    }

    if (callback_result.state === "MODIFIED" && callback_result.headers) {
      ApplyHeaderEntriesToObject({
        headers: params.ctx.proxyToServerRequestOptions!
          .headers as OutgoingHttpHeaders,
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

    proxy_to_server_request.removeHeader("transfer-encoding");
    proxy_to_server_request.setHeader("content-length", String(request_body.length));

    if (callback_result.headers && callback_result.headers.length > 0) {
      ApplyHeaderEntriesToOutgoingMessage({
        target: proxy_to_server_request,
        header_entries: callback_result.headers,
      });
    }

    if (request_body.length > 0) {
      proxy_to_server_request.write(request_body);
    }
  }

  private async handleResponseHeadersCallback(params: {
    ctx: IContext;
    callback_handler:
      | ((params: { context: http_response_headers_callback_context_t }) => Promise<http_interception_result_t | void>)
      | undefined;
  }): Promise<void> {
    if (!params.callback_handler) {
      return;
    }

    const connection_state = this.getOrCreateHttpState({ ctx: params.ctx });

    const callback_context: http_response_headers_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: connection_state.connection_started_at_ms,
      intercepted_at_ms: Date.now(),
      protocol: "http",
      is_ssl: params.ctx.isSSL,
      direction: "server_to_client",
      event: "response_headers",
      request: GetHttpRequestMetadata({ ctx: params.ctx }),
      response: GetHttpResponseMetadata({ ctx: params.ctx }),
      handles: this.buildHttpHandles({ ctx: params.ctx }),
    };

    const callback_result = await this.executeHttpCallback({
      callback_executor: async () =>
        NormalizeHttpResult({
          result: await params.callback_handler!({ context: callback_context }),
        }),
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

    let response_body = connection_state.response_override_body;
    if (!response_body) {
      response_body = Buffer.concat(connection_state.response_chunks);
    }

    let callback_result: http_interception_result_t = { state: "PASSTHROUGH" };

    if (params.callback_handler) {
      const callback_context: http_response_data_callback_context_t = {
        connection_id: params.ctx.uuid,
        connection_started_at_ms: connection_state.connection_started_at_ms,
        intercepted_at_ms: Date.now(),
        protocol: "http",
        is_ssl: params.ctx.isSSL,
        direction: "server_to_client",
        event: "response_data",
        request: GetHttpRequestMetadata({ ctx: params.ctx }),
        response: GetHttpResponseMetadata({ ctx: params.ctx }),
        data: response_body,
        handles: this.buildHttpHandles({ ctx: params.ctx }),
      };

      callback_result = await this.executeHttpCallback({
        callback_executor: async () =>
          NormalizeHttpResult({
            result: await params.callback_handler!({ context: callback_context }),
          }),
      });
    }

    if (callback_result.state === "TERMINATE") {
      this.terminateHttpConnection({ ctx: params.ctx, connection_state });
      throw CreateTerminatedError();
    }

    if (typeof callback_result.data !== "undefined") {
      response_body = ToBuffer({ data: callback_result.data }) || Buffer.alloc(0);
    }

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
      connection_state.response_status_message_override = callback_result.status_message;
    }

    const response_headers = params.ctx.serverToProxyResponse?.headers || {};
    response_headers["content-length"] = String(response_body.length);
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
          Proxy.filterAndCanonizeHeaders(response_headers)
        );
      } else {
        params.ctx.proxyToClientResponse.writeHead(
          status_code,
          Proxy.filterAndCanonizeHeaders(response_headers)
        );
      }
    }

    if (response_body.length > 0) {
      params.ctx.proxyToClientResponse.write(response_body);
    }
  }

  private async executeHttpCallback(params: {
    callback_executor: () => Promise<http_interception_result_t>;
  }): Promise<http_interception_result_t> {
    try {
      return await params.callback_executor();
    } catch (error) {
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
    callback_handler: (params: {
      context: websocket_upgrade_callback_context_t;
    }) => Promise<websocket_interception_result_t | void>;
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

    const callback_result = await this.executeWebSocketCallback({
      callback_executor: async () =>
        NormalizeWebSocketResult({
          result: await params.callback_handler({ context: callback_context }),
        }),
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
    callback_handler: (params: {
      context: websocket_frame_callback_context_t;
    }) => Promise<websocket_interception_result_t | void>;
  }): Promise<{ message: WebSocket.RawData | string; flags: boolean | undefined }> {
    const callback_context: websocket_frame_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: Date.now(),
      intercepted_at_ms: Date.now(),
      protocol: "websocket",
      is_ssl: params.ctx.isSSL,
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

    const callback_result = await this.executeWebSocketCallback({
      callback_executor: async () =>
        NormalizeWebSocketResult({
          result: await params.callback_handler({ context: callback_context }),
        }),
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
    callback_handler: (params: {
      context: websocket_close_callback_context_t;
    }) => Promise<void>;
  }): Promise<void> {
    const callback_context: websocket_close_callback_context_t = {
      connection_id: params.ctx.uuid,
      connection_started_at_ms: Date.now(),
      intercepted_at_ms: Date.now(),
      protocol: "websocket",
      is_ssl: params.ctx.isSSL,
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

  private terminateWebSocketConnection(params: { ctx: IWebSocketContext }): void {
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
