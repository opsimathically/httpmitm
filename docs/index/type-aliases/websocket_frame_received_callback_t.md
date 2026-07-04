[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_frame\_received\_callback\_t

# Type Alias: websocket\_frame\_received\_callback\_t()

> **websocket\_frame\_received\_callback\_t** = (`params`) => `Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:362](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L362)

Callback for server-to-client WebSocket frames.

## Parameters

### params

#### context

[`websocket_frame_callback_context_t`](websocket_frame_callback_context_t.md)

## Returns

`Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>
