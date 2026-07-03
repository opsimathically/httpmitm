[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_i

# Interface: httpmitm\_plugin\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:418](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L418)

Plugin contract accepted by `HTTPMITM.start()`.

A plugin must implement at least one supported HTTP or WebSocket hook.

## Properties

### http?

> `optional` **http**: [`httpmitm_plugin_http_hooks_i`](httpmitm_plugin_http_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:421](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L421)

***

### plugin\_name?

> `optional` **plugin\_name**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:420](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L420)

Optional diagnostic plugin name.

***

### websocket?

> `optional` **websocket**: [`httpmitm_plugin_websocket_hooks_i`](httpmitm_plugin_websocket_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:422](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L422)
