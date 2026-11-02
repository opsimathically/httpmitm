[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_interception\_result\_t

# Type Alias: websocket\_interception\_result\_t

> **websocket\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:165](../../../src/classes/httpmitm/httpmitm.types.ts#L165)

Result returned by instance-level WebSocket callbacks.

`data` and `flags` are applied only when the callback returns
`state: "MODIFIED"`.

## Properties

### data?

> `optional` **data**: `WebSocket.RawData` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:168](../../../src/classes/httpmitm/httpmitm.types.ts#L168)

***

### flags?

> `optional` **flags**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:169](../../../src/classes/httpmitm/httpmitm.types.ts#L169)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:167](../../../src/classes/httpmitm/httpmitm.types.ts#L167)

***

### state

> **state**: [`interception_state_t`](interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:166](../../../src/classes/httpmitm/httpmitm.types.ts#L166)
