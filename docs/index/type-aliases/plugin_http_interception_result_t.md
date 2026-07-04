[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_interception\_result\_t

# Type Alias: plugin\_http\_interception\_result\_t

> **plugin\_http\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:154](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L154)

Result returned by plugin HTTP callbacks.

## Properties

### data?

> `optional` **data**: `Buffer` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:157](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L157)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:156](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L156)

***

### state

> **state**: [`plugin_interception_state_t`](plugin_interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:155](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L155)

***

### status\_code?

> `optional` **status\_code**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:158](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L158)

***

### status\_message?

> `optional` **status\_message**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:159](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L159)
