[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_upgrade\_callback\_context\_t

# Type Alias: websocket\_upgrade\_callback\_context\_t

> **websocket\_upgrade\_callback\_context\_t** = [`websocket_callback_context_base_t`](websocket_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:311](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L311)

Context passed to `websocket.onServerUpgrade`.

## Type Declaration

### direction

> **direction**: `"client_to_server"`

### event

> **event**: `"server_upgrade"`

### upgrade\_request

> **upgrade\_request**: [`websocket_upgrade_request_metadata_t`](websocket_upgrade_request_metadata_t.md)
