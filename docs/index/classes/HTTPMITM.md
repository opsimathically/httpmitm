[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / HTTPMITM

# Class: HTTPMITM

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1098](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/HTTPMITM.class.ts#L1098)

Preferred public MITM proxy wrapper.

`HTTPMITM` manages the underlying forked proxy instance, registers awaited
HTTP and WebSocket callbacks, enforces runtime limits, applies callback error
policy, and exposes an awaitable shutdown path through `stop()` and the
returned server handle.

## Constructors

### Constructor

> **new HTTPMITM**(): `HTTPMITM`

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1105](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/HTTPMITM.class.ts#L1105)

#### Returns

`HTTPMITM`

## Methods

### start()

> **start**(`params`): `Promise`\<[`httpmitm_server_t`](../type-aliases/httpmitm_server_t.md)\>

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1119](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/HTTPMITM.class.ts#L1119)

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

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1187](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/HTTPMITM.class.ts#L1187)

Stop the active proxy instance.

The method awaits shutdown of the managed HTTP, HTTPS, WebSocket, and
generated SSL servers where the underlying proxy exposes close handles.

#### Returns

`Promise`\<`void`\>
