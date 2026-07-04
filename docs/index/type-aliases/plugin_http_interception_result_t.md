[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_interception\_result\_t

# Type Alias: plugin\_http\_interception\_result\_t

> **plugin\_http\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:152](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L152)

Result returned by plugin HTTP callbacks.

## Properties

### data?

> `optional` **data**: `Buffer` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:155](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L155)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:154](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L154)

***

### state

> **state**: [`plugin_interception_state_t`](plugin_interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:153](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L153)

***

### status\_code?

> `optional` **status\_code**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:156](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L156)

***

### status\_message?

> `optional` **status\_message**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:157](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L157)
