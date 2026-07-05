[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_request\_headers\_callback\_context\_t

# Type Alias: http\_request\_headers\_callback\_context\_t

> **http\_request\_headers\_callback\_context\_t** = [`http_callback_context_base_t`](http_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:234](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L234)

Context passed to `http.client_to_server.requestHeaders`.

## Type Declaration

### event

> **event**: `"request_headers"`

### request

> **request**: [`http_request_metadata_t`](http_request_metadata_t.md)
