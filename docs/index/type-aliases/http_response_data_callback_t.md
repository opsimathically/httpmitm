[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_response\_data\_callback\_t

# Type Alias: http\_response\_data\_callback\_t()

> **http\_response\_data\_callback\_t** = (`params`) => `Promise`\<[`http_interception_result_t`](http_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:341](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L341)

Callback for buffered HTTP response body data.

## Parameters

### params

#### context

[`http_response_data_callback_context_t`](http_response_data_callback_context_t.md)

## Returns

`Promise`\<[`http_interception_result_t`](http_interception_result_t.md) \| `void`\>
