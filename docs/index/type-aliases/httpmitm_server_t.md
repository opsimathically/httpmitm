[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_server\_t

# Type Alias: httpmitm\_server\_t

> **httpmitm\_server\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:508](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L508)

Server handle returned by `HTTPMITM.start()`.

## Properties

### ca

> **ca**: [`httpmitm_ca_material_t`](httpmitm_ca_material_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:516](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L516)

Root CA material for client trust.

***

### close()

> **close**: () => `Promise`\<`void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:518](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L518)

Awaitable shutdown for all managed proxy servers.

#### Returns

`Promise`\<`void`\>

***

### host

> **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:512](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L512)

Effective proxy host metadata.

***

### listen\_port

> **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:514](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L514)

Effective HTTP proxy listen port.

***

### proxy

> **proxy**: [`Proxy`](../classes/Proxy.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:510](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L510)

Low-level forked proxy instance. Prefer `HTTPMITM` unless internals are required.
