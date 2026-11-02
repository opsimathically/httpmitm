[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_callback\_group\_t

# Type Alias: websocket\_callback\_group\_t

> **websocket\_callback\_group\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:449](../../../src/classes/httpmitm/httpmitm.types.ts#L449)

WebSocket callbacks accepted by `HTTPMITM.start()`.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`websocket_connection_terminated_callback_t`](websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:453](../../../src/classes/httpmitm/httpmitm.types.ts#L453)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`websocket_frame_received_callback_t`](websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:452](../../../src/classes/httpmitm/httpmitm.types.ts#L452)

***

### onFrameSent?

> `optional` **onFrameSent**: [`websocket_frame_sent_callback_t`](websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:451](../../../src/classes/httpmitm/httpmitm.types.ts#L451)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`websocket_server_upgrade_callback_t`](websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:450](../../../src/classes/httpmitm/httpmitm.types.ts#L450)
