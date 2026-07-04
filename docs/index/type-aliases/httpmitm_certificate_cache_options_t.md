[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_certificate\_cache\_options\_t

# Type Alias: httpmitm\_certificate\_cache\_options\_t

> **httpmitm\_certificate\_cache\_options\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:75](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L75)

In-memory leaf certificate cache limits.

## Properties

### max\_entries?

> `optional` **max\_entries**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:77](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L77)

Maximum in-memory leaf certificate entries. Default: 1000.

***

### ttl\_ms?

> `optional` **ttl\_ms**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:79](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L79)

Leaf certificate cache TTL in milliseconds. Default: 3_600_000.
