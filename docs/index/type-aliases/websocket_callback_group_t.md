[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_callback\_group\_t

# Type Alias: websocket\_callback\_group\_t

> **websocket\_callback\_group\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:437](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L437)

WebSocket callbacks accepted by `HTTPMITM.start()`.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`websocket_connection_terminated_callback_t`](websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:441](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L441)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`websocket_frame_received_callback_t`](websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:440](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L440)

***

### onFrameSent?

> `optional` **onFrameSent**: [`websocket_frame_sent_callback_t`](websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:439](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L439)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`websocket_server_upgrade_callback_t`](websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:438](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L438)
