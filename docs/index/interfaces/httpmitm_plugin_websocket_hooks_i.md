[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_websocket\_hooks\_i

# Interface: httpmitm\_plugin\_websocket\_hooks\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:406](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L406)

WebSocket hooks supported by plugins.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`plugin_websocket_connection_terminated_callback_t`](../type-aliases/plugin_websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:410](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L410)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`plugin_websocket_frame_received_callback_t`](../type-aliases/plugin_websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:409](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L409)

***

### onFrameSent?

> `optional` **onFrameSent**: [`plugin_websocket_frame_sent_callback_t`](../type-aliases/plugin_websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:408](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L408)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`plugin_websocket_server_upgrade_callback_t`](../type-aliases/plugin_websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:407](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L407)
