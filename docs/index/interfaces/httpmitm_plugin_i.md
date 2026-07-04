[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_plugin\_i

# Interface: httpmitm\_plugin\_i

Defined in: [classes/httpmitm/httpmitm.types.ts:462](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L462)

Plugin contract accepted by `HTTPMITM.start()`.

A plugin must implement at least one supported HTTP or WebSocket hook.

## Properties

### http?

> `optional` **http**: [`httpmitm_plugin_http_hooks_i`](httpmitm_plugin_http_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:465](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L465)

***

### plugin\_name?

> `optional` **plugin\_name**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:464](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L464)

Optional diagnostic plugin name.

***

### websocket?

> `optional` **websocket**: [`httpmitm_plugin_websocket_hooks_i`](httpmitm_plugin_websocket_hooks_i.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:466](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L466)
