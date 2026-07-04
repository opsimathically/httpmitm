[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_server\_t

# Type Alias: httpmitm\_server\_t

> **httpmitm\_server\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:514](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L514)

Server handle returned by `HTTPMITM.start()`.

## Properties

### ca

> **ca**: [`httpmitm_ca_material_t`](httpmitm_ca_material_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:522](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L522)

Root CA material for client trust.

***

### close()

> **close**: () => `Promise`\<`void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:524](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L524)

Awaitable shutdown for all managed proxy servers.

#### Returns

`Promise`\<`void`\>

***

### host

> **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:518](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L518)

Effective proxy host metadata.

***

### listen\_port

> **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:520](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L520)

Effective HTTP proxy listen port.

***

### proxy

> **proxy**: [`Proxy`](../classes/Proxy.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:516](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L516)

Low-level forked proxy instance. Prefer `HTTPMITM` unless internals are required.
