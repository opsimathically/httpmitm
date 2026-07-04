[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_close\_callback\_context\_t

# Type Alias: websocket\_close\_callback\_context\_t

> **websocket\_close\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:322](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L322)

Context passed to `websocket.onConnectionTerminated`.

## Type Declaration

### closed\_by\_server

> **closed\_by\_server**: `boolean`

### code

> **code**: `number`

### direction

> **direction**: `"client_to_server"` \| `"server_to_client"`

### event

> **event**: `"connection_terminated"`

### message

> **message**: `Buffer`
