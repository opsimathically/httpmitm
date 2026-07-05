[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / HTTPMITM

# Class: HTTPMITM

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1015](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/HTTPMITM.class.ts#L1015)

Preferred public MITM proxy wrapper.

`HTTPMITM` manages the underlying forked proxy instance, registers awaited
HTTP and WebSocket callbacks, enforces runtime limits, applies callback error
policy, and exposes an awaitable shutdown path through `stop()` and the
returned server handle.

## Constructors

### Constructor

> **new HTTPMITM**(): `HTTPMITM`

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1022](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/HTTPMITM.class.ts#L1022)

#### Returns

`HTTPMITM`

## Methods

### start()

> **start**(`params`): `Promise`\<[`httpmitm_server_t`](../type-aliases/httpmitm_server_t.md)\>

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1036](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/HTTPMITM.class.ts#L1036)

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

Defined in: [classes/httpmitm/HTTPMITM.class.ts:1107](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/HTTPMITM.class.ts#L1107)

Stop the active proxy instance.

The method awaits shutdown of the managed HTTP, HTTPS, WebSocket, and
generated SSL servers where the underlying proxy exposes close handles.

#### Returns

`Promise`\<`void`\>
