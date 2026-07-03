[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_interception\_result\_t

# Type Alias: websocket\_interception\_result\_t

> **websocket\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:96](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L96)

Result returned by instance-level WebSocket callbacks.

`data` and `flags` are applied only when the callback returns
`state: "MODIFIED"`.

## Properties

### data?

> `optional` **data**: `WebSocket.RawData` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:99](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L99)

***

### flags?

> `optional` **flags**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:100](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L100)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:98](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L98)

***

### state

> **state**: [`interception_state_t`](interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:97](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/classes/httpmitm/httpmitm.types.ts#L97)
