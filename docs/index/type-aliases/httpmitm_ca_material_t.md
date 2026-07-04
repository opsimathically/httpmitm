[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_ca\_material\_t

# Type Alias: httpmitm\_ca\_material\_t

> **httpmitm\_ca\_material\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:107](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L107)

Root CA certificate material exposed after `HTTPMITM.start()`.

## Properties

### cert\_path?

> `optional` **cert\_path**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:113](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L113)

Root CA certificate path when storage is `disk`.

***

### cert\_pem

> **cert\_pem**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:109](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L109)

Root CA certificate PEM for client trust.

***

### storage

> **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:111](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L111)

Root CA storage backend used by this server.
