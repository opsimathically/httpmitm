[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_frame\_callback\_context\_t

# Type Alias: websocket\_frame\_callback\_context\_t

> **websocket\_frame\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:331](../../../src/classes/httpmitm/httpmitm.types.ts#L331)

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
