[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_upgrade\_callback\_context\_t

# Type Alias: websocket\_upgrade\_callback\_context\_t

> **websocket\_upgrade\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:298](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L298)

Context passed to `websocket.onServerUpgrade`.

## Type Declaration

### direction

> **direction**: `"client_to_server"`

### event

> **event**: `"server_upgrade"`

### upgrade\_request

> **upgrade\_request**: [`websocket_upgrade_request_metadata_t`](websocket_upgrade_request_metadata_t.md)
