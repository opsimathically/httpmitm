[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_frame\_received\_callback\_t

# Type Alias: websocket\_frame\_received\_callback\_t()

> **websocket\_frame\_received\_callback\_t** = (`params`) => `Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:381](../../../src/classes/httpmitm/httpmitm.types.ts#L381)

Callback for server-to-client WebSocket frames.

## Parameters

### params

#### context

[`websocket_frame_callback_context_t`](websocket_frame_callback_context_t.md)

## Returns

`Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>
