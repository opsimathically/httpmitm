[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_request\_data\_callback\_t

# Type Alias: http\_request\_data\_callback\_t()

> **http\_request\_data\_callback\_t** = (`params`) => `Promise`\<[`http_interception_result_t`](http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:356](../../../src/classes/httpmitm/httpmitm.types.ts#L356)

Callback for buffered HTTP request body data.

## Parameters

### params

#### context

[`http_request_data_callback_context_t`](http_request_data_callback_context_t.md)

## Returns

`Promise`\<[`http_interception_result_t`](http_interception_result_t.md) \| `void`\>
