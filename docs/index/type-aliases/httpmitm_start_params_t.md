[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_start\_params\_t

# Type Alias: httpmitm\_start\_params\_t

> **httpmitm\_start\_params\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:476](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L476)

Start parameters for the preferred public `HTTPMITM` wrapper API.

## Properties

### callback\_error\_policy?

> `optional` **callback\_error\_policy**: [`callback_error_policy_t`](callback_error_policy_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:500](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L500)

Callback error and timeout policy. Default: `TERMINATE`.

***

### certificates?

> `optional` **certificates**: [`httpmitm_certificate_options_t`](httpmitm_certificate_options_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:484](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L484)

Root CA and leaf certificate storage behavior.

***

### force\_chunked\_request?

> `optional` **force\_chunked\_request**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:498](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L498)

Force chunked request forwarding in the underlying proxy.

***

### force\_sni?

> `optional` **force\_sni**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:490](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L490)

Force SNI handling in the underlying proxy.

***

### host?

> `optional` **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:478](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L478)

Proxy host. Defaults to `localhost` in the returned server metadata.

***

### http?

> `optional` **http**: [`http_callback_group_t`](http_callback_group_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:508](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L508)

HTTP interception callbacks.

***

### http\_agent?

> `optional` **http\_agent**: `HttpAgent`

Defined in: [classes/httpmitm/httpmitm.types.ts:494](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L494)

Optional upstream HTTP agent.

***

### https\_agent?

> `optional` **https\_agent**: `HttpsAgent`

Defined in: [classes/httpmitm/httpmitm.types.ts:496](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L496)

Optional upstream HTTPS agent for custom upstream TLS trust.

***

### https\_listen\_port?

> `optional` **https\_listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:492](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L492)

Optional HTTPS proxy listen port used by the underlying proxy.

***

### keep\_alive?

> `optional` **keep\_alive**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:486](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L486)

Enable keep-alive behavior in the underlying proxy.

***

### limits?

> `optional` **limits**: [`httpmitm_limits_t`](httpmitm_limits_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:502](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L502)

Runtime payload and callback safety limits.

***

### listen\_port?

> `optional` **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:480](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L480)

HTTP proxy listen port. Use `0` to request an ephemeral port.

***

### logger?

> `optional` **logger**: [`httpmitm_logger_t`](httpmitm_logger_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:504](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L504)

Optional structured diagnostics logger. Default: silent.

***

### plugins?

> `optional` **plugins**: [`httpmitm_plugin_i`](../interfaces/httpmitm_plugin_i.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:506](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L506)

Ordered plugin instances.

***

### ssl\_ca\_dir?

> `optional` **ssl\_ca\_dir**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:482](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L482)

Compatibility disk directory for generated CA and leaf certificate material.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:488](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L488)

Underlying proxy socket timeout in milliseconds.

***

### websocket?

> `optional` **websocket**: [`websocket_callback_group_t`](websocket_callback_group_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:510](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L510)

WebSocket interception callbacks.
