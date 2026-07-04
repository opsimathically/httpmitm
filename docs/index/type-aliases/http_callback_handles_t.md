[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_callback\_handles\_t

# Type Alias: http\_callback\_handles\_t

> **http\_callback\_handles\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:186](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L186)

Low-level HTTP handles exposed for advanced integrations.

Prefer normalized metadata on the callback context unless direct socket,
request, or response access is required.

## Properties

### client\_to\_proxy\_request

> **client\_to\_proxy\_request**: `IncomingMessage`

Defined in: [classes/httpmitm/httpmitm.types.ts:189](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L189)

***

### connect\_request

> **connect\_request**: `IncomingMessage` \| `undefined`

Defined in: [classes/httpmitm/httpmitm.types.ts:188](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L188)

***

### proxy\_to\_client\_response

> **proxy\_to\_client\_response**: `ServerResponse`

Defined in: [classes/httpmitm/httpmitm.types.ts:190](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L190)

***

### proxy\_to\_server\_request

> **proxy\_to\_server\_request**: `IContext`\[`"proxyToServerRequest"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:191](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L191)

***

### raw\_context

> **raw\_context**: `IContext`

Defined in: [classes/httpmitm/httpmitm.types.ts:187](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L187)

***

### server\_to\_proxy\_response

> **server\_to\_proxy\_response**: `IContext`\[`"serverToProxyResponse"`\]

Defined in: [classes/httpmitm/httpmitm.types.ts:192](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L192)
