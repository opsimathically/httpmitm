[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_i

# Interface: httpmitm\_plugin\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:468](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L468)

Plugin contract accepted by `HTTPMITM.start()`.

A plugin must implement at least one supported HTTP or WebSocket hook.

## Properties

### http?

> `optional` **http**: [`httpmitm_plugin_http_hooks_i`](httpmitm_plugin_http_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:471](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L471)

***

### plugin\_name?

> `optional` **plugin\_name**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:470](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L470)

Optional diagnostic plugin name.

***

### websocket?

> `optional` **websocket**: [`httpmitm_plugin_websocket_hooks_i`](httpmitm_plugin_websocket_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:472](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L472)
