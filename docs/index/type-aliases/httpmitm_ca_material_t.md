[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_ca\_material\_t

# Type Alias: httpmitm\_ca\_material\_t

> **httpmitm\_ca\_material\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:114](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L114)

Root CA certificate material exposed after `HTTPMITM.start()`.

## Properties

### cert\_path?

> `optional` **cert\_path**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:122](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L122)

Root CA certificate path when storage is `disk`.

***

### cert\_pem

> **cert\_pem**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:116](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L116)

Root CA certificate PEM for client trust.

***

### key\_algorithm

> **key\_algorithm**: [`httpmitm_certificate_key_algorithm_t`](httpmitm_certificate_key_algorithm_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:120](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L120)

Root CA key algorithm used by this server.

***

### storage

> **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:118](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L118)

Root CA storage backend used by this server.
