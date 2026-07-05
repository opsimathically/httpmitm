[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_close\_callback\_context\_t

# Type Alias: websocket\_close\_callback\_context\_t

> **websocket\_close\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:329](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L329)

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
