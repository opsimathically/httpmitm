[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_close\_callback\_context\_t

# Type Alias: websocket\_close\_callback\_context\_t

> **websocket\_close\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:272](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L272)

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
