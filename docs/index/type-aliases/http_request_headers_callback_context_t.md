[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_request\_headers\_callback\_context\_t

# Type Alias: http\_request\_headers\_callback\_context\_t

> **http\_request\_headers\_callback\_context\_t** = [`http_callback_context_base_t`](http_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:225](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L225)

Context passed to `http.client_to_server.requestHeaders`.

## Type Declaration

### event

> **event**: `"request_headers"`

### request

> **request**: [`http_request_metadata_t`](http_request_metadata_t.md)
