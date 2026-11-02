[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_websocket\_hooks\_i

# Interface: httpmitm\_plugin\_websocket\_hooks\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:475](../../../src/classes/httpmitm/httpmitm.types.ts#L475)

WebSocket hooks supported by plugins.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`plugin_websocket_connection_terminated_callback_t`](../type-aliases/plugin_websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:479](../../../src/classes/httpmitm/httpmitm.types.ts#L479)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`plugin_websocket_frame_received_callback_t`](../type-aliases/plugin_websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:478](../../../src/classes/httpmitm/httpmitm.types.ts#L478)

***

### onFrameSent?

> `optional` **onFrameSent**: [`plugin_websocket_frame_sent_callback_t`](../type-aliases/plugin_websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:477](../../../src/classes/httpmitm/httpmitm.types.ts#L477)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`plugin_websocket_server_upgrade_callback_t`](../type-aliases/plugin_websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:476](../../../src/classes/httpmitm/httpmitm.types.ts#L476)
