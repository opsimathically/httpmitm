[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_callback\_handles\_t

# Type Alias: http\_callback\_handles\_t

> **http\_callback\_handles\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:190](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L190)

Low-level HTTP handles exposed for advanced integrations.

Prefer normalized metadata on the callback context unless direct socket,
request, or response access is required.

## Properties

### client\_to\_proxy\_request

> **client\_to\_proxy\_request**: `IncomingMessage`

Defined in: [classes/httpmitm/httpmitm.types.ts:193](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L193)

***

### connect\_request

> **connect\_request**: `IncomingMessage` \| `undefined`

Defined in: [classes/httpmitm/httpmitm.types.ts:192](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L192)

***

### proxy\_to\_client\_response

> **proxy\_to\_client\_response**: `ServerResponse`

Defined in: [classes/httpmitm/httpmitm.types.ts:194](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L194)

***

### proxy\_to\_server\_request

> **proxy\_to\_server\_request**: `IContext`\[`"proxyToServerRequest"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:195](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L195)

***

### raw\_context

> **raw\_context**: `IContext`

Defined in: [classes/httpmitm/httpmitm.types.ts:191](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L191)

***

### server\_to\_proxy\_response

> **server\_to\_proxy\_response**: `IContext`\[`"serverToProxyResponse"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:196](https://github.com/opsimathically/httpmitm/blob/11bc0beac1e739d2243eb4c7bd876900a03c12d4/src/classes/httpmitm/httpmitm.types.ts#L196)
