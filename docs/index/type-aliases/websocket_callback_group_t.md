[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_callback\_group\_t

# Type Alias: websocket\_callback\_group\_t

> **websocket\_callback\_group\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:380](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L380)

WebSocket callbacks accepted by `HTTPMITM.start()`.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`websocket_connection_terminated_callback_t`](websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:384](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L384)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`websocket_frame_received_callback_t`](websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:383](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L383)

***

### onFrameSent?

> `optional` **onFrameSent**: [`websocket_frame_sent_callback_t`](websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:382](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L382)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`websocket_server_upgrade_callback_t`](websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:381](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L381)
