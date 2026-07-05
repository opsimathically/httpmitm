[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / HTTPMITM

# Class: HTTPMITM

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1002](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/HTTPMITM.class.ts#L1002)

Preferred public MITM proxy wrapper.

`HTTPMITM` manages the underlying forked proxy instance, registers awaited
HTTP and WebSocket callbacks, enforces runtime limits, applies callback error
policy, and exposes an awaitable shutdown path through `stop()` and the
returned server handle.

## Constructors

### Constructor

> **new HTTPMITM**(): `HTTPMITM`

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1009](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/HTTPMITM.class.ts#L1009)

#### Returns

`HTTPMITM`

## Methods

### start()

> **start**(`params`): `Promise`\<[`httpmitm_server_t`](../type-aliases/httpmitm_server_t.md)\>

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1023](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/HTTPMITM.class.ts#L1023)

Start the proxy with the provided interception callbacks and options.

If this instance is already running, the existing proxy is stopped before a
new proxy is started. Use `listen_port: 0` to request an ephemeral port and
read the selected port from the returned `listen_port`.

#### Parameters

##### params

[`httpmitm_start_params_t`](../type-aliases/httpmitm_start_params_t.md)

#### Returns

`Promise`\<[`httpmitm_server_t`](../type-aliases/httpmitm_server_t.md)\>

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1094](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/HTTPMITM.class.ts#L1094)

Stop the active proxy instance.

The method awaits shutdown of the managed HTTP, HTTPS, WebSocket, and
generated SSL servers where the underlying proxy exposes close handles.

#### Returns

`Promise`\<`void`\>
