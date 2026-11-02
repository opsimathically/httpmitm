[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_response\_headers\_callback\_t

# Type Alias: plugin\_http\_response\_headers\_callback\_t()

> **plugin\_http\_response\_headers\_callback\_t** = (`params`) => `Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:401](../../../src/classes/httpmitm/httpmitm.types.ts#L401)

Plugin callback for HTTP response headers.

## Parameters

### params

#### context

[`http_response_headers_callback_context_t`](http_response_headers_callback_context_t.md)

## Returns

`Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>
