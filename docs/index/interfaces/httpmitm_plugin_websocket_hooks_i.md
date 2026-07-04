[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_websocket\_hooks\_i

# Interface: httpmitm\_plugin\_websocket\_hooks\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:450](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L450)

WebSocket hooks supported by plugins.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`plugin_websocket_connection_terminated_callback_t`](../type-aliases/plugin_websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:454](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L454)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`plugin_websocket_frame_received_callback_t`](../type-aliases/plugin_websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:453](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L453)

***

### onFrameSent?

> `optional` **onFrameSent**: [`plugin_websocket_frame_sent_callback_t`](../type-aliases/plugin_websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:452](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L452)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`plugin_websocket_server_upgrade_callback_t`](../type-aliases/plugin_websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:451](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L451)
