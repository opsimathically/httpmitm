[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_server\_t

# Type Alias: httpmitm\_server\_t

> **httpmitm\_server\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:521](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L521)

Server handle returned by `HTTPMITM.start()`.

## Properties

### ca

> **ca**: [`httpmitm_ca_material_t`](httpmitm_ca_material_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:529](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L529)

Root CA material for client trust.

***

### close()

> **close**: () => `Promise`\<`void`\>

Defined in: [classes/httpmitm/httpmitm.types.ts:531](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L531)

Awaitable shutdown for all managed proxy servers.

#### Returns

`Promise`\<`void`\>

***

### host

> **host**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:525](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L525)

Effective proxy host metadata.

***

### listen\_port

> **listen\_port**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:527](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L527)

Effective HTTP proxy listen port.

***

### proxy

> **proxy**: [`Proxy`](../classes/Proxy.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:523](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L523)

Low-level forked proxy instance. Prefer `HTTPMITM` unless internals are required.
