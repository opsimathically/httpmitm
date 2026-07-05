[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_request\_headers\_callback\_context\_t

# Type Alias: http\_request\_headers\_callback\_context\_t

> **http\_request\_headers\_callback\_context\_t** = [`http_callback_context_base_t`](http_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:246](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L246)

Context passed to `http.client_to_server.requestHeaders`.

## Type Declaration

### event

> **event**: `"request_headers"`

### request

> **request**: [`http_request_metadata_t`](http_request_metadata_t.md)
