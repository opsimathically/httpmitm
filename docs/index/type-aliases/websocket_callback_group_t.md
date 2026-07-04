[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_callback\_group\_t

# Type Alias: websocket\_callback\_group\_t

> **websocket\_callback\_group\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:424](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L424)

WebSocket callbacks accepted by `HTTPMITM.start()`.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`websocket_connection_terminated_callback_t`](websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:428](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L428)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`websocket_frame_received_callback_t`](websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:427](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L427)

***

### onFrameSent?

> `optional` **onFrameSent**: [`websocket_frame_sent_callback_t`](websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:426](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L426)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`websocket_server_upgrade_callback_t`](websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:425](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L425)
