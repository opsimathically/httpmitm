[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_limits\_t

# Type Alias: httpmitm\_limits\_t

> **httpmitm\_limits\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:36](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L36)

Runtime safety limits for buffered payloads and callback execution.

Invalid, non-finite, or non-positive values are ignored and replaced with the
defaults documented on each field.

## Properties

### callback\_timeout\_ms?

> `optional` **callback\_timeout\_ms**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:44](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L44)

Maximum interception callback runtime in milliseconds. Default: 30_000.

***

### request\_body\_bytes?

> `optional` **request\_body\_bytes**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:38](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L38)

Maximum buffered request body. Default: 10 MiB.

***

### response\_body\_bytes?

> `optional` **response\_body\_bytes**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:40](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L40)

Maximum buffered response body. Default: 25 MiB.

***

### websocket\_frame\_bytes?

> `optional` **websocket\_frame\_bytes**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:42](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L42)

Maximum WebSocket frame payload size. Default: 16 MiB.
