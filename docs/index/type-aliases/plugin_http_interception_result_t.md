[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_http\_interception\_result\_t

# Type Alias: plugin\_http\_interception\_result\_t

> **plugin\_http\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:173](../../../src/classes/httpmitm/httpmitm.types.ts#L173)

Result returned by plugin HTTP callbacks.

## Properties

### data?

> `optional` **data**: `Buffer` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:176](../../../src/classes/httpmitm/httpmitm.types.ts#L176)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:175](../../../src/classes/httpmitm/httpmitm.types.ts#L175)

***

### state

> **state**: [`plugin_interception_state_t`](plugin_interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:174](../../../src/classes/httpmitm/httpmitm.types.ts#L174)

***

### status\_code?

> `optional` **status\_code**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:177](../../../src/classes/httpmitm/httpmitm.types.ts#L177)

***

### status\_message?

> `optional` **status\_message**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:178](../../../src/classes/httpmitm/httpmitm.types.ts#L178)
