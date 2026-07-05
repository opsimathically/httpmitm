[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_start\_params\_t

# Type Alias: httpmitm\_start\_params\_t

> **httpmitm\_start\_params\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:483](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L483)

Start parameters for the preferred public `HTTPMITM` wrapper API.

## Properties

### callback\_error\_policy?

> `optional` **callback\_error\_policy**: [`callback_error_policy_t`](callback_error_policy_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:507](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L507)

Callback error and timeout policy. Default: `TERMINATE`.

***

### certificates?

> `optional` **certificates**: [`httpmitm_certificate_options_t`](httpmitm_certificate_options_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:491](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L491)

Root CA and leaf certificate storage behavior.

***

### force\_chunked\_request?

> `optional` **force\_chunked\_request**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:505](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L505)

Force chunked request forwarding in the underlying proxy.

***

### force\_sni?

> `optional` **force\_sni**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:497](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L497)

Force SNI handling in the underlying proxy.

***

### host?

> `optional` **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:485](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L485)

Proxy host. Defaults to `localhost` in the returned server metadata.

***

### http?

> `optional` **http**: [`http_callback_group_t`](http_callback_group_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:515](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L515)

HTTP interception callbacks.

***

### http\_agent?

> `optional` **http\_agent**: `HttpAgent`

Defined in: [classes/httpmitm/httpmitm.types.ts:501](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L501)

Optional upstream HTTP agent.

***

### https\_agent?

> `optional` **https\_agent**: `HttpsAgent`

Defined in: [classes/httpmitm/httpmitm.types.ts:503](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L503)

Optional upstream HTTPS agent for custom upstream TLS trust.

***

### https\_listen\_port?

> `optional` **https\_listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:499](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L499)

Optional HTTPS proxy listen port used by the underlying proxy.

***

### keep\_alive?

> `optional` **keep\_alive**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:493](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L493)

Enable keep-alive behavior in the underlying proxy.

***

### limits?

> `optional` **limits**: [`httpmitm_limits_t`](httpmitm_limits_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:509](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L509)

Runtime payload and callback safety limits.

***

### listen\_port?

> `optional` **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:487](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L487)

HTTP proxy listen port. Use `0` to request an ephemeral port.

***

### logger?

> `optional` **logger**: [`httpmitm_logger_t`](httpmitm_logger_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:511](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L511)

Optional structured diagnostics logger. Default: silent.

***

### plugins?

> `optional` **plugins**: [`httpmitm_plugin_i`](../interfaces/httpmitm_plugin_i.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:513](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L513)

Ordered plugin instances.

***

### ssl\_ca\_dir?

> `optional` **ssl\_ca\_dir**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:489](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L489)

Compatibility disk directory for generated CA and leaf certificate material.

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:495](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L495)

Underlying proxy socket timeout in milliseconds.

***

### websocket?

> `optional` **websocket**: [`websocket_callback_group_t`](websocket_callback_group_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:517](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L517)

WebSocket interception callbacks.
