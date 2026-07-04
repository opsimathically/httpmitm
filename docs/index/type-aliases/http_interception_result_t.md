[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_interception\_result\_t

# Type Alias: http\_interception\_result\_t

> **http\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:130](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L130)

Result returned by instance-level HTTP callbacks.

`headers`, `data`, `status_code`, and `status_message` are applied only when
the callback returns `state: "MODIFIED"`.

## Properties

### data?

> `optional` **data**: `Buffer` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:133](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L133)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:132](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L132)

***

### state

> **state**: [`interception_state_t`](interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:131](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L131)

***

### status\_code?

> `optional` **status\_code**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:134](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L134)

***

### status\_message?

> `optional` **status\_message**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:135](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L135)
