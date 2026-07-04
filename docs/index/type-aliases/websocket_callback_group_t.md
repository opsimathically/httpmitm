[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_callback\_group\_t

# Type Alias: websocket\_callback\_group\_t

> **websocket\_callback\_group\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:430](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L430)

WebSocket callbacks accepted by `HTTPMITM.start()`.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`websocket_connection_terminated_callback_t`](websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:434](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L434)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`websocket_frame_received_callback_t`](websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:433](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L433)

***

### onFrameSent?

> `optional` **onFrameSent**: [`websocket_frame_sent_callback_t`](websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:432](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L432)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`websocket_server_upgrade_callback_t`](websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:431](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L431)
