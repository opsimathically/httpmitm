[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_interception\_result\_t

# Type Alias: http\_interception\_result\_t

> **http\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:139](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L139)

Result returned by instance-level HTTP callbacks.

`headers`, `data`, `status_code`, and `status_message` are applied only when
the callback returns `state: "MODIFIED"`.

## Properties

### data?

> `optional` **data**: `Buffer` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:142](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L142)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:141](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L141)

***

### state

> **state**: [`interception_state_t`](interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:140](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L140)

***

### status\_code?

> `optional` **status\_code**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:143](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L143)

***

### status\_message?

> `optional` **status\_message**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:144](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L144)
