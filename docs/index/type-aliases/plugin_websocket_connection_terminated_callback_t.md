[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_websocket\_connection\_terminated\_callback\_t

# Type Alias: plugin\_websocket\_connection\_terminated\_callback\_t()

> **plugin\_websocket\_connection\_terminated\_callback\_t** = (`params`) => `Promise`\<[`plugin_websocket_interception_result_t`](plugin_websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:405](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L405)

Plugin callback for WebSocket close events.

## Parameters

### params

#### context

[`websocket_close_callback_context_t`](websocket_close_callback_context_t.md)

## Returns

`Promise`\<[`plugin_websocket_interception_result_t`](plugin_websocket_interception_result_t.md) \| `void`\>
