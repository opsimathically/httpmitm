[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_frame\_callback\_context\_t

# Type Alias: websocket\_frame\_callback\_context\_t

> **websocket\_frame\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:331](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L331)

Context passed to WebSocket frame callbacks.

## Type Declaration

### data

> **data**: `WebSocket.RawData`

### direction

> **direction**: `"client_to_server"` \| `"server_to_client"`

### event

> **event**: `"frame"`

### flags

> **flags**: `boolean` \| `undefined`

### frame\_type

> **frame\_type**: `"message"` \| `"ping"` \| `"pong"`
