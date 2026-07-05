[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_response\_data\_callback\_t

# Type Alias: http\_response\_data\_callback\_t()

> **http\_response\_data\_callback\_t** = (`params`) => `Promise`\<[`http_interception_result_t`](http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:366](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L366)

Callback for buffered HTTP response body data.

## Parameters

### params

#### context

[`http_response_data_callback_context_t`](http_response_data_callback_context_t.md)

## Returns

`Promise`\<[`http_interception_result_t`](http_interception_result_t.md) \| `void`\>
