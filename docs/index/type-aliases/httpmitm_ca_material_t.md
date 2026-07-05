[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_ca\_material\_t

# Type Alias: httpmitm\_ca\_material\_t

> **httpmitm\_ca\_material\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:126](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L126)

Root CA certificate material exposed after `HTTPMITM.start()`.

## Properties

### cert\_path?

> `optional` **cert\_path**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:134](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L134)

Root CA certificate path when storage is `disk`.

***

### cert\_pem

> **cert\_pem**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:128](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L128)

Root CA certificate PEM for client trust.

***

### key\_algorithm

> **key\_algorithm**: [`httpmitm_certificate_key_algorithm_t`](httpmitm_certificate_key_algorithm_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:132](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L132)

Root CA key algorithm used by this server.

***

### storage

> **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:130](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L130)

Root CA storage backend used by this server.
