[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_response\_data\_callback\_t

# Type Alias: plugin\_http\_response\_data\_callback\_t()

> **plugin\_http\_response\_data\_callback\_t** = (`params`) => `Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:381](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L381)

Plugin callback for buffered HTTP response body data.

## Parameters

### params

#### context

[`http_response_data_callback_context_t`](http_response_data_callback_context_t.md)

## Returns

`Promise`\<[`plugin_http_interception_result_t`](plugin_http_interception_result_t.md) \| `void`\>
