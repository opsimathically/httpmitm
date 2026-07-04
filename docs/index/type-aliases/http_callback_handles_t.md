[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_callback\_handles\_t

# Type Alias: http\_callback\_handles\_t

> **http\_callback\_handles\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:192](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L192)

Low-level HTTP handles exposed for advanced integrations.

Prefer normalized metadata on the callback context unless direct socket,
request, or response access is required.

## Properties

### client\_to\_proxy\_request

> **client\_to\_proxy\_request**: `IncomingMessage`

Defined in: [classes/httpmitm/httpmitm.types.ts:195](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L195)

***

### connect\_request

> **connect\_request**: `IncomingMessage` \| `undefined`

Defined in: [classes/httpmitm/httpmitm.types.ts:194](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L194)

***

### proxy\_to\_client\_response

> **proxy\_to\_client\_response**: `ServerResponse`

Defined in: [classes/httpmitm/httpmitm.types.ts:196](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L196)

***

### proxy\_to\_server\_request

> **proxy\_to\_server\_request**: `IContext`\[`"proxyToServerRequest"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:197](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L197)

***

### raw\_context

> **raw\_context**: `IContext`

Defined in: [classes/httpmitm/httpmitm.types.ts:193](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L193)

***

### server\_to\_proxy\_response

> **server\_to\_proxy\_response**: `IContext`\[`"serverToProxyResponse"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:198](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L198)
