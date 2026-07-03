[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_response\_headers\_callback\_context\_t

# Type Alias: http\_response\_headers\_callback\_context\_t

> **http\_response\_headers\_callback\_context\_t** = [`http_callback_context_base_t`](http_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:202](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L202)

Context passed to `http.server_to_client.responseHeaders`.

## Type Declaration

### event

> **event**: `"response_headers"`

### request

> **request**: [`http_request_metadata_t`](http_request_metadata_t.md)

### response

> **response**: [`http_response_metadata_t`](http_response_metadata_t.md)
