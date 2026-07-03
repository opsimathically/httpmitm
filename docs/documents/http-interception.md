[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / http-interception

# HTTP Interception

HTTP callbacks are grouped by direction. `client_to_server` hooks run on requests before they reach the upstream server. `server_to_client` hooks run on responses before they reach the client.

```typescript
await httpmitm.start({
  http: {
    client_to_server: {
      requestHeaders: async ({ context }) => ({ state: "PASSTHROUGH" }),
      requestData: async ({ context }) => ({ state: "PASSTHROUGH" }),
    },
    server_to_client: {
      responseHeaders: async ({ context }) => ({ state: "PASSTHROUGH" }),
      responseData: async ({ context }) => ({ state: "PASSTHROUGH" }),
    },
  },
});
```

## Result States

- `PASSTHROUGH`: forward the original traffic unchanged.
- `MODIFIED`: apply returned `headers`, `data`, `status_code`, or `status_message`.
- `TERMINATE`: close the affected connection.

Returning `undefined` behaves like `PASSTHROUGH`. Callback errors and callback timeouts follow `callback_error_policy`, which defaults to fail-closed `TERMINATE`.

## Headers

Header callbacks receive request or response metadata and can return replacement/additional header entries.

```typescript
requestHeaders: async ({ context }) => ({
  state: "MODIFIED",
  headers: [{ name: "x-observed-url", value: context.request.url || "" }],
});
```

## Bodies And Content Encoding

Data callbacks receive both wire bytes and callback-friendly data:

- `raw_data`: original bytes as seen on the wire.
- `decoded_data`: decoded bytes when decoding succeeds, otherwise the raw fallback.
- `data`: alias of `decoded_data`.
- `data_is_decoded`: `true` when decoding succeeded or no encoding was present.
- `decode_error`: decode failure message or `null`.

When a callback returns modified `data`, HTTPMITM re-encodes it using the active `Content-Encoding` header before forwarding. Supported encodings are `gzip`, `x-gzip`, `deflate`, `x-deflate`, `br`, `zstd`, `compress`, and `x-compress`.

Unsupported or corrupt encodings do not crash the proxy. They are reported through `decode_error`, and passthrough forwards the original bytes.

## Buffering Limits

Request and response data callbacks buffer full bodies. Defaults are:

- request body: `10 MiB`
- response body: `25 MiB`

If a limit is exceeded, the affected connection is terminated and `logger.warn` is called when configured.
