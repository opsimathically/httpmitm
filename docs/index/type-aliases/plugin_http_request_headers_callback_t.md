[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_request\_headers\_callback\_t

# Type Alias: plugin\_http\_request\_headers\_callback\_t()

> **plugin\_http\_request\_headers\_callback\_t** = (`params`) => `Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:370](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L370)

Plugin callback for HTTP request headers.

## Parameters

### params

#### context

[`http_request_headers_callback_context_t`](http_request_headers_callback_context_t.md)

## Returns

`Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>
