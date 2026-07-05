[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_callback\_handles\_t

# Type Alias: http\_callback\_handles\_t

> **http\_callback\_handles\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:211](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L211)

Low-level HTTP handles exposed for advanced integrations.

Prefer normalized metadata on the callback context unless direct socket,
request, or response access is required.

## Properties

### client\_to\_proxy\_request

> **client\_to\_proxy\_request**: `IncomingMessage`

Defined in: [classes/httpmitm/httpmitm.types.ts:214](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L214)

***

### connect\_request

> **connect\_request**: `IncomingMessage` \| `undefined`

Defined in: [classes/httpmitm/httpmitm.types.ts:213](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L213)

***

### proxy\_to\_client\_response

> **proxy\_to\_client\_response**: `ServerResponse`

Defined in: [classes/httpmitm/httpmitm.types.ts:215](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L215)

***

### proxy\_to\_server\_request

> **proxy\_to\_server\_request**: `IContext`\[`"proxyToServerRequest"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:216](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L216)

***

### raw\_context

> **raw\_context**: `IContext`

Defined in: [classes/httpmitm/httpmitm.types.ts:212](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L212)

***

### server\_to\_proxy\_response

> **server\_to\_proxy\_response**: `IContext`\[`"serverToProxyResponse"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:217](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L217)
