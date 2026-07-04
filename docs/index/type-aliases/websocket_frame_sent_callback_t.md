[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_frame\_sent\_callback\_t

# Type Alias: websocket\_frame\_sent\_callback\_t()

> **websocket\_frame\_sent\_callback\_t** = (`params`) => `Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:351](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L351)

Callback for client-to-server WebSocket frames.

## Parameters

### params

#### context

[`websocket_frame_callback_context_t`](websocket_frame_callback_context_t.md)

## Returns

`Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>
