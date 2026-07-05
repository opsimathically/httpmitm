[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_certificate\_cache\_options\_t

# Type Alias: httpmitm\_certificate\_cache\_options\_t

> **httpmitm\_certificate\_cache\_options\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:78](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L78)

In-memory leaf certificate cache limits.

## Properties

### max\_entries?

> `optional` **max\_entries**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:80](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L80)

Maximum in-memory leaf certificate entries. Default: 1000.

***

### ttl\_ms?

> `optional` **ttl\_ms**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:82](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L82)

Leaf certificate cache TTL in milliseconds. Default: 3_600_000.
