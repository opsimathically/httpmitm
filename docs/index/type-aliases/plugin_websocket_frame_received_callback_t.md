[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_websocket\_frame\_received\_callback\_t

# Type Alias: plugin\_websocket\_frame\_received\_callback\_t()

> **plugin\_websocket\_frame\_received\_callback\_t** = (`params`) => `Promise`\<[`plugin_websocket_interception_result_t`](plugin_websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:409](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L409)

Plugin callback for server-to-client WebSocket frames.

## Parameters

### params

#### context

[`websocket_frame_callback_context_t`](websocket_frame_callback_context_t.md)

## Returns

`Promise`\<[`plugin_websocket_interception_result_t`](plugin_websocket_interception_result_t.md) \| `void`\>
