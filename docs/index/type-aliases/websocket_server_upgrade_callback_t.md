[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_server\_upgrade\_callback\_t

# Type Alias: websocket\_server\_upgrade\_callback\_t()

> **websocket\_server\_upgrade\_callback\_t** = (`params`) => `Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:350](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L350)

Callback for WebSocket upgrade requests.

## Parameters

### params

#### context

[`websocket_upgrade_callback_context_t`](websocket_upgrade_callback_context_t.md)

## Returns

`Promise`\<[`websocket_interception_result_t`](websocket_interception_result_t.md) \| `void`\>
