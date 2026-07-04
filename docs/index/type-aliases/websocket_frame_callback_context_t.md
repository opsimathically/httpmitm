[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_frame\_callback\_context\_t

# Type Alias: websocket\_frame\_callback\_context\_t

> **websocket\_frame\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:306](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L306)

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
