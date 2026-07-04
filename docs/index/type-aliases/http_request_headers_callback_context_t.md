[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_request\_headers\_callback\_context\_t

# Type Alias: http\_request\_headers\_callback\_context\_t

> **http\_request\_headers\_callback\_context\_t** = [`http_callback_context_base_t`](http_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:221](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L221)

Context passed to `http.client_to_server.requestHeaders`.

## Type Declaration

### event

> **event**: `"request_headers"`

### request

> **request**: [`http_request_metadata_t`](http_request_metadata_t.md)
