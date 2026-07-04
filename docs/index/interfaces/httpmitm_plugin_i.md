[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_i

# Interface: httpmitm\_plugin\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:466](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L466)

Plugin contract accepted by `HTTPMITM.start()`.

A plugin must implement at least one supported HTTP or WebSocket hook.

## Properties

### http?

> `optional` **http**: [`httpmitm_plugin_http_hooks_i`](httpmitm_plugin_http_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:469](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L469)

***

### plugin\_name?

> `optional` **plugin\_name**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:468](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L468)

Optional diagnostic plugin name.

***

### websocket?

> `optional` **websocket**: [`httpmitm_plugin_websocket_hooks_i`](httpmitm_plugin_websocket_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:470](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L470)
