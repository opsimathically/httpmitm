[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_callback\_context\_base\_t

# Type Alias: http\_callback\_context\_base\_t

> **http\_callback\_context\_base\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:229](../../../src/classes/httpmitm/httpmitm.types.ts#L229)

Shared fields present on every HTTP callback context.

## Properties

### client\_host

> **client\_host**: `string` \| `null`

Defined in: [classes/httpmitm/httpmitm.types.ts:241](../../../src/classes/httpmitm/httpmitm.types.ts#L241)

***

### client\_ip

> **client\_ip**: `string` \| `null`

Defined in: [classes/httpmitm/httpmitm.types.ts:239](../../../src/classes/httpmitm/httpmitm.types.ts#L239)

***

### client\_port

> **client\_port**: `number` \| `null`

Defined in: [classes/httpmitm/httpmitm.types.ts:240](../../../src/classes/httpmitm/httpmitm.types.ts#L240)

***

### connection\_id

> **connection\_id**: `string`

Defined in: [classes/httpmitm/httpmitm.types.ts:230](../../../src/classes/httpmitm/httpmitm.types.ts#L230)

***

### connection\_started\_at\_ms

> **connection\_started\_at\_ms**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:231](../../../src/classes/httpmitm/httpmitm.types.ts#L231)

***

### direction

> **direction**: `"client_to_server"` \| `"server_to_client"`

Defined in: [classes/httpmitm/httpmitm.types.ts:235](../../../src/classes/httpmitm/httpmitm.types.ts#L235)

***

### handles

> **handles**: [`http_callback_handles_t`](http_callback_handles_t.md)

Defined in: [classes/httpmitm/httpmitm.types.ts:242](../../../src/classes/httpmitm/httpmitm.types.ts#L242)

***

### intercepted\_at\_ms

> **intercepted\_at\_ms**: `number`

Defined in: [classes/httpmitm/httpmitm.types.ts:232](../../../src/classes/httpmitm/httpmitm.types.ts#L232)

***

### is\_ssl

> **is\_ssl**: `boolean`

Defined in: [classes/httpmitm/httpmitm.types.ts:234](../../../src/classes/httpmitm/httpmitm.types.ts#L234)

***

### protocol

> **protocol**: `"http"`

Defined in: [classes/httpmitm/httpmitm.types.ts:233](../../../src/classes/httpmitm/httpmitm.types.ts#L233)

***

### remote\_host

> **remote\_host**: `string` \| `null`

Defined in: [classes/httpmitm/httpmitm.types.ts:238](../../../src/classes/httpmitm/httpmitm.types.ts#L238)

***

### remote\_ip

> **remote\_ip**: `string` \| `null`

Defined in: [classes/httpmitm/httpmitm.types.ts:236](../../../src/classes/httpmitm/httpmitm.types.ts#L236)

***

### remote\_port

> **remote\_port**: `number` \| `null`

Defined in: [classes/httpmitm/httpmitm.types.ts:237](../../../src/classes/httpmitm/httpmitm.types.ts#L237)
