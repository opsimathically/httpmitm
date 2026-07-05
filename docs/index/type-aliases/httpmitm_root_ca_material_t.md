[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_root\_ca\_material\_t

# Type Alias: httpmitm\_root\_ca\_material\_t

> **httpmitm\_root\_ca\_material\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:86](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L86)

Existing root CA material supplied by the caller.

## Properties

### cert\_pem

> **cert\_pem**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:88](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L88)

Root CA certificate PEM for client trust and leaf signing.

***

### private\_key\_passphrase?

> `optional` **private\_key\_passphrase**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:92](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L92)

Optional passphrase for encrypted private key PEM.

***

### private\_key\_pem

> **private\_key\_pem**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:90](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L90)

Root CA private key PEM used to sign generated leaf certificates.
