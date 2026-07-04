[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_upgrade\_callback\_context\_t

# Type Alias: websocket\_upgrade\_callback\_context\_t

> **websocket\_upgrade\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:304](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L304)

Context passed to `websocket.onServerUpgrade`.

## Type Declaration

### direction

> **direction**: `"client_to_server"`

### event

> **event**: `"server_upgrade"`

### upgrade\_request

> **upgrade\_request**: [`websocket_upgrade_request_metadata_t`](websocket_upgrade_request_metadata_t.md)
