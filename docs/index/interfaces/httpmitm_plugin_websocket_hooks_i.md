[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_websocket\_hooks\_i

# Interface: httpmitm\_plugin\_websocket\_hooks\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:456](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L456)

WebSocket hooks supported by plugins.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`plugin_websocket_connection_terminated_callback_t`](../type-aliases/plugin_websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:460](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L460)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`plugin_websocket_frame_received_callback_t`](../type-aliases/plugin_websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:459](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L459)

***

### onFrameSent?

> `optional` **onFrameSent**: [`plugin_websocket_frame_sent_callback_t`](../type-aliases/plugin_websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:458](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L458)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`plugin_websocket_server_upgrade_callback_t`](../type-aliases/plugin_websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:457](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L457)
