[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / websocket\_interception\_result\_t

# Type Alias: websocket\_interception\_result\_t

> **websocket\_interception\_result\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:153](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L153)

Result returned by instance-level WebSocket callbacks.

`data` and `flags` are applied only when the callback returns
`state: "MODIFIED"`.

## Properties

### data?

> `optional` **data**: `WebSocket.RawData` \| `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:156](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L156)

***

### flags?

> `optional` **flags**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:157](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L157)

***

### headers?

> `optional` **headers**: [`header_entry_t`](header_entry_t.md)[]

Defined in: [classes/httpmitm/httpmitm.types.ts:155](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L155)

***

### state

> **state**: [`interception_state_t`](interception_state_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:154](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L154)
