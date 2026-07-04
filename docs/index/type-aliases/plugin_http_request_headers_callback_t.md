[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_request\_headers\_callback\_t

# Type Alias: plugin\_http\_request\_headers\_callback\_t()

> **plugin\_http\_request\_headers\_callback\_t** = (`params`) => `Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:366](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L366)

Plugin callback for HTTP request headers.

## Parameters

### params

#### context

[`http_request_headers_callback_context_t`](http_request_headers_callback_context_t.md)

## Returns

`Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>
