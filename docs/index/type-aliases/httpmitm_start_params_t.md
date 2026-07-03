[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_start\_params\_t

# Type Alias: httpmitm\_start\_params\_t

> **httpmitm\_start\_params\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:426](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L426)

Start parameters for the preferred public `HTTPMITM` wrapper API.

## Properties

### callback\_error\_policy?

> `optional` **callback\_error\_policy**: [`callback_error_policy_t`](callback_error_policy_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:448](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L448)

Callback error and timeout policy. Default: `TERMINATE`.

***

### force\_chunked\_request?

> `optional` **force\_chunked\_request**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:446](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L446)

Force chunked request forwarding in the underlying proxy.

***

### force\_sni?

> `optional` **force\_sni**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:438](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L438)

Force SNI handling in the underlying proxy.

***

### host?

> `optional` **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:428](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L428)

Proxy host. Defaults to `localhost` in the returned server metadata.

***

### http?

> `optional` **http**: [`http_callback_group_t`](http_callback_group_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:456](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L456)

HTTP interception callbacks.

***

### http\_agent?

> `optional` **http\_agent**: `HttpAgent`

Defined in: [classes/httpmitm/httpmitm.types.ts:442](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L442)

Optional upstream HTTP agent.

***

### https\_agent?

> `optional` **https\_agent**: `HttpsAgent`

Defined in: [classes/httpmitm/httpmitm.types.ts:444](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L444)

Optional upstream HTTPS agent for custom upstream TLS trust.

***

### https\_listen\_port?

> `optional` **https\_listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:440](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L440)

Optional HTTPS proxy listen port used by the underlying proxy.

***

### keep\_alive?

> `optional` **keep\_alive**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:434](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L434)

Enable keep-alive behavior in the underlying proxy.

***

### limits?

> `optional` **limits**: [`httpmitm_limits_t`](httpmitm_limits_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:450](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L450)

Runtime payload and callback safety limits.

***

### listen\_port?

> `optional` **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:430](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L430)

HTTP proxy listen port. Use `0` to request an ephemeral port.

***

### logger?

> `optional` **logger**: [`httpmitm_logger_t`](httpmitm_logger_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:452](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L452)

Optional structured diagnostics logger. Default: silent.

***

### plugins?

> `optional` **plugins**: [`httpmitm_plugin_i`](../interfaces/httpmitm_plugin_i.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:454](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L454)

Ordered plugin instances.

***

### ssl\_ca\_dir?

> `optional` **ssl\_ca\_dir**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:432](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L432)

Directory for generated CA and leaf certificate material.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:436](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L436)

Underlying proxy socket timeout in milliseconds.

***

### websocket?

> `optional` **websocket**: [`websocket_callback_group_t`](websocket_callback_group_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:458](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L458)

WebSocket interception callbacks.
