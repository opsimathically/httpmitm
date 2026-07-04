[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_websocket\_hooks\_i

# Interface: httpmitm\_plugin\_websocket\_hooks\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:454](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L454)

WebSocket hooks supported by plugins.

## Properties

### onConnectionTerminated?

> `optional` **onConnectionTerminated**: [`plugin_websocket_connection_terminated_callback_t`](../type-aliases/plugin_websocket_connection_terminated_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:458](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L458)

***

### onFrameReceived?

> `optional` **onFrameReceived**: [`plugin_websocket_frame_received_callback_t`](../type-aliases/plugin_websocket_frame_received_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:457](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L457)

***

### onFrameSent?

> `optional` **onFrameSent**: [`plugin_websocket_frame_sent_callback_t`](../type-aliases/plugin_websocket_frame_sent_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:456](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L456)

***

### onServerUpgrade?

> `optional` **onServerUpgrade**: [`plugin_websocket_server_upgrade_callback_t`](../type-aliases/plugin_websocket_server_upgrade_callback_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:455](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L455)
