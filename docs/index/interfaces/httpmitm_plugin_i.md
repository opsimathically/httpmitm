[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_i

# Interface: httpmitm\_plugin\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:487](../../../src/classes/httpmitm/httpmitm.types.ts#L487)

Plugin contract accepted by `HTTPMITM.start()`.

A plugin must implement at least one supported HTTP or WebSocket hook.

## Properties

### http?

> `optional` **http**: [`httpmitm_plugin_http_hooks_i`](httpmitm_plugin_http_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:490](../../../src/classes/httpmitm/httpmitm.types.ts#L490)

***

### plugin\_name?

> `optional` **plugin\_name**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:489](../../../src/classes/httpmitm/httpmitm.types.ts#L489)

Optional diagnostic plugin name.

***

### websocket?

> `optional` **websocket**: [`httpmitm_plugin_websocket_hooks_i`](httpmitm_plugin_websocket_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:491](../../../src/classes/httpmitm/httpmitm.types.ts#L491)
