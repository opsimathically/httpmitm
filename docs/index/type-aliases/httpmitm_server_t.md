[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_server\_t

# Type Alias: httpmitm\_server\_t

> **httpmitm\_server\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:533](../../../src/classes/httpmitm/httpmitm.types.ts#L533)

Server handle returned by `HTTPMITM.start()`.

## Properties

### ca

> **ca**: [`httpmitm_ca_material_t`](httpmitm_ca_material_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:541](../../../src/classes/httpmitm/httpmitm.types.ts#L541)

Root CA material for client trust.

***

### close()

> **close**: () => `Promise`\<`void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:543](../../../src/classes/httpmitm/httpmitm.types.ts#L543)

Awaitable shutdown for all managed proxy servers.

#### Returns

`Promise`\<`void`\>

***

### host

> **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:537](../../../src/classes/httpmitm/httpmitm.types.ts#L537)

Effective proxy host metadata.

***

### listen\_port

> **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:539](../../../src/classes/httpmitm/httpmitm.types.ts#L539)

Effective HTTP proxy listen port.

***

### proxy

> **proxy**: [`Proxy`](../classes/Proxy.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:535](../../../src/classes/httpmitm/httpmitm.types.ts#L535)

Low-level forked proxy instance. Prefer `HTTPMITM` unless internals are required.
