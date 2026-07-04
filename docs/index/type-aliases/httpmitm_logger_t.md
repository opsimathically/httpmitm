[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_logger\_t

# Type Alias: httpmitm\_logger\_t

> **httpmitm\_logger\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:61](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L61)

Optional structured logger. The default logger is silent.

HTTPMITM uses logger methods for diagnostics such as limit violations,
callback timeouts, and binary transform failures.

## Properties

### debug()?

> `optional` **debug**: (`message`, `metadata?`) => `void`

Defined in: [classes/httpmitm/httpmitm.types.ts:62](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L62)

#### Parameters

##### message

`string`

##### metadata?

[`httpmitm_log_metadata_t`](httpmitm_log_metadata_t.md)

#### Returns

`void`

***

### error()?

> `optional` **error**: (`message`, `metadata?`) => `void`

Defined in: [classes/httpmitm/httpmitm.types.ts:65](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L65)

#### Parameters

##### message

`string`

##### metadata?

[`httpmitm_log_metadata_t`](httpmitm_log_metadata_t.md)

#### Returns

`void`

***

### info()?

> `optional` **info**: (`message`, `metadata?`) => `void`

Defined in: [classes/httpmitm/httpmitm.types.ts:63](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L63)

#### Parameters

##### message

`string`

##### metadata?

[`httpmitm_log_metadata_t`](httpmitm_log_metadata_t.md)

#### Returns

`void`

***

### warn()?

> `optional` **warn**: (`message`, `metadata?`) => `void`

Defined in: [classes/httpmitm/httpmitm.types.ts:64](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L64)

#### Parameters

##### message

`string`

##### metadata?

[`httpmitm_log_metadata_t`](httpmitm_log_metadata_t.md)

#### Returns

`void`
