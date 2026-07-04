[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_websocket\_frame\_sent\_callback\_t

# Type Alias: plugin\_websocket\_frame\_sent\_callback\_t()

> **plugin\_websocket\_frame\_sent\_callback\_t** = (`params`) => `Promise`\<[`plugin_websocket_interception_result_t`](plugin_websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:395](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L395)

Plugin callback for client-to-server WebSocket frames.

## Parameters

### params

#### context

[`websocket_frame_callback_context_t`](websocket_frame_callback_context_t.md)

## Returns

`Promise`\<[`plugin_websocket_interception_result_t`](plugin_websocket_interception_result_t.md) \| `void`\>
