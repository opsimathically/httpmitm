[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_interception\_result\_t

# Type Alias: http\_interception\_result\_t

> **http\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:151](../../../src/classes/httpmitm/httpmitm.types.ts#L151)

Result returned by instance-level HTTP callbacks.

`headers`, `data`, `status_code`, and `status_message` are applied only when
the callback returns `state: "MODIFIED"`.

## Properties

### data?

> `optional` **data**: `Buffer` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:154](../../../src/classes/httpmitm/httpmitm.types.ts#L154)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:153](../../../src/classes/httpmitm/httpmitm.types.ts#L153)

***

### state

> **state**: [`interception_state_t`](interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:152](../../../src/classes/httpmitm/httpmitm.types.ts#L152)

***

### status\_code?

> `optional` **status\_code**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:155](../../../src/classes/httpmitm/httpmitm.types.ts#L155)

***

### status\_message?

> `optional` **status\_message**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:156](../../../src/classes/httpmitm/httpmitm.types.ts#L156)
