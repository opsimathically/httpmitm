[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_callback\_handles\_t

# Type Alias: http\_callback\_handles\_t

> **http\_callback\_handles\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:199](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L199)

Low-level HTTP handles exposed for advanced integrations.

Prefer normalized metadata on the callback context unless direct socket,
request, or response access is required.

## Properties

### client\_to\_proxy\_request

> **client\_to\_proxy\_request**: `IncomingMessage`

Defined in: [classes/httpmitm/httpmitm.types.ts:202](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L202)

***

### connect\_request

> **connect\_request**: `IncomingMessage` \| `undefined`

Defined in: [classes/httpmitm/httpmitm.types.ts:201](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L201)

***

### proxy\_to\_client\_response

> **proxy\_to\_client\_response**: `ServerResponse`

Defined in: [classes/httpmitm/httpmitm.types.ts:203](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L203)

***

### proxy\_to\_server\_request

> **proxy\_to\_server\_request**: `IContext`\[`"proxyToServerRequest"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:204](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L204)

***

### raw\_context

> **raw\_context**: `IContext`

Defined in: [classes/httpmitm/httpmitm.types.ts:200](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L200)

***

### server\_to\_proxy\_response

> **server\_to\_proxy\_response**: `IContext`\[`"serverToProxyResponse"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:205](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L205)
