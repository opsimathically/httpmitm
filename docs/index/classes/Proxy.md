[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / Proxy

# Class: Proxy

Defined in: [forked\_code/proxy.ts:103](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L103)

Low-level forked proxy export retained for compatibility and advanced
integrations. Prefer `HTTPMITM` for normal package usage.

## Implements

- `IProxy`

## Constructors

### Constructor

> **new Proxy**(): `Proxy`

Defined in: [forked\_code/proxy.ts:141](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L141)

#### Returns

`Proxy`

## Properties

### ca

> **ca**: `CA`

Defined in: [forked\_code/proxy.ts:104](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L104)

#### Implementation of

`IProxy.ca`

***

### certificateOptions

> **certificateOptions**: `object`

Defined in: [forked\_code/proxy.ts:131](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L131)

#### leafCertificates

> **leafCertificates**: `object`

##### leafCertificates.cache

> **cache**: `object`

##### leafCertificates.cache.maxEntries

> **maxEntries**: `number`

##### leafCertificates.cache.ttlMs

> **ttlMs**: `number`

##### leafCertificates.keyAlgorithm

> **keyAlgorithm**: [`IProxyCertificateKeyAlgorithm`](../type-aliases/IProxyCertificateKeyAlgorithm.md)

##### leafCertificates.storage

> **storage**: [`IProxyCertificateStorage`](../type-aliases/IProxyCertificateStorage.md)

##### leafCertificates.wildcard

> **wildcard**: [`IProxyLeafCertificateWildcard`](../type-aliases/IProxyLeafCertificateWildcard.md)

#### rootCA

> **rootCA**: `object`

##### rootCA.keyAlgorithm

> **keyAlgorithm**: [`IProxyCertificateKeyAlgorithm`](../type-aliases/IProxyCertificateKeyAlgorithm.md)

##### rootCA.sslCaDir

> **sslCaDir**: `string`

##### rootCA.storage

> **storage**: [`IProxyCertificateStorage`](../type-aliases/IProxyCertificateStorage.md)

#### Implementation of

`IProxy.certificateOptions`

***

### connectRequests

> **connectRequests**: `Record`\<`string`, `http.IncomingMessage`\> = `{}`

Defined in: [forked\_code/proxy.ts:105](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L105)

***

### forceSNI

> **forceSNI**: `boolean`

Defined in: [forked\_code/proxy.ts:106](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L106)

#### Implementation of

`IProxy.forceSNI`

***

### httpAgent

> **httpAgent**: `Agent`

Defined in: [forked\_code/proxy.ts:107](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L107)

#### Implementation of

`IProxy.httpAgent`

***

### httpHost?

> `optional` **httpHost**: `string`

Defined in: [forked\_code/proxy.ts:108](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L108)

***

### httpPort

> **httpPort**: `number`

Defined in: [forked\_code/proxy.ts:109](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L109)

#### Implementation of

`IProxy.httpPort`

***

### httpsAgent

> **httpsAgent**: `Agent`

Defined in: [forked\_code/proxy.ts:111](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L111)

#### Implementation of

`IProxy.httpsAgent`

***

### httpServer

> **httpServer**: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`

Defined in: [forked\_code/proxy.ts:110](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L110)

***

### httpsPort?

> `optional` **httpsPort**: `number`

Defined in: [forked\_code/proxy.ts:112](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L112)

#### Implementation of

`IProxy.httpsPort`

***

### httpsServer

> **httpsServer**: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`

Defined in: [forked\_code/proxy.ts:113](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L113)

***

### keepAlive

> **keepAlive**: `boolean`

Defined in: [forked\_code/proxy.ts:114](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L114)

#### Implementation of

`IProxy.keepAlive`

***

### onConnectHandlers

> **onConnectHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:115](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L115)

***

### onErrorHandlers

> **onErrorHandlers**: `HandlerType`\<(`callback`) => `void`\>

Defined in: [forked\_code/proxy.ts:116](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L116)

***

### onRequestDataHandlers

> **onRequestDataHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:117](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L117)

***

### onRequestEndHandlers

> **onRequestEndHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:118](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L118)

***

### onRequestHandlers

> **onRequestHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:119](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L119)

***

### onRequestHeadersHandlers

> **onRequestHeadersHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:120](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L120)

***

### onResponseDataHandlers

> **onResponseDataHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:121](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L121)

***

### onResponseEndHandlers

> **onResponseEndHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:122](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L122)

***

### onResponseHandlers

> **onResponseHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:123](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L123)

***

### onResponseHeadersHandlers

> **onResponseHeadersHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:124](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L124)

***

### onWebSocketCloseHandlers

> **onWebSocketCloseHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:125](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L125)

***

### onWebSocketConnectionHandlers

> **onWebSocketConnectionHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:126](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L126)

***

### onWebSocketErrorHandlers

> **onWebSocketErrorHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:127](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L127)

***

### onWebSocketFrameHandlers

> **onWebSocketFrameHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:128](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L128)

***

### options

> **options**: `IProxyOptions`

Defined in: [forked\_code/proxy.ts:129](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L129)

#### Implementation of

`IProxy.options`

***

### responseContentPotentiallyModified

> **responseContentPotentiallyModified**: `boolean`

Defined in: [forked\_code/proxy.ts:130](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L130)

***

### sslCaDir

> **sslCaDir**: `string`

Defined in: [forked\_code/proxy.ts:132](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L132)

#### Implementation of

`IProxy.sslCaDir`

***

### sslSemaphores

> **sslSemaphores**: `Record`\<`string`, `semaphore.Semaphore`\> = `{}`

Defined in: [forked\_code/proxy.ts:133](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L133)

***

### sslServers

> **sslServers**: `Record`\<`string`, `IProxySSLServer`\> = `{}`

Defined in: [forked\_code/proxy.ts:134](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L134)

***

### timeout

> **timeout**: `number`

Defined in: [forked\_code/proxy.ts:135](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L135)

#### Implementation of

`IProxy.timeout`

***

### wsServer

> **wsServer**: `WebSocketServer` \| `undefined`

Defined in: [forked\_code/proxy.ts:136](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L136)

***

### wssServer

> **wssServer**: `WebSocketServer` \| `undefined`

Defined in: [forked\_code/proxy.ts:137](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L137)

***

### gunzip

> `static` **gunzip**: `object`

Defined in: [forked\_code/proxy.ts:139](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L139)

#### onRequest()

> **onRequest**(`ctx`, `callback`): `any`

##### Parameters

###### ctx

`IContext`

###### callback

`Function`

##### Returns

`any`

#### onResponse()

> **onResponse**(`ctx`, `callback`): `any`

##### Parameters

###### ctx

`IContext`

###### callback

`Function`

##### Returns

`any`

***

### wildcard

> `static` **wildcard**: `object`

Defined in: [forked\_code/proxy.ts:138](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L138)

#### onCertificateRequired()

> **onCertificateRequired**(`hostname`, `callback`): `void`

##### Parameters

###### hostname

`string`

###### callback

`ErrorCallback`

##### Returns

`void`

## Methods

### \_createHttpsServer()

> **\_createHttpsServer**(`options`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:238](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L238)

#### Parameters

##### options

`ServerOptions`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> & `object`

##### callback

`ICreateServerCallback`

#### Returns

`void`

***

### \_onError()

> **\_onError**(`kind`, `ctx`, `err`): `void`

Defined in: [forked\_code/proxy.ts:851](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L851)

#### Parameters

##### kind

`string`

##### ctx

`IContext` | `null`

##### err

`Error`

#### Returns

`void`

***

### \_onHttpServerConnect()

> **\_onHttpServerConnect**(`req`, `socket`, `head`): `void`

Defined in: [forked\_code/proxy.ts:550](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L550)

#### Parameters

##### req

`IncomingMessage`

##### socket

`Duplex`

##### head

`Buffer`

#### Returns

`void`

***

### \_onHttpServerConnectData()

> **\_onHttpServerConnectData**(`req`, `socket`, `head`): `void`

Defined in: [forked\_code/proxy.ts:593](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L593)

#### Parameters

##### req

`IncomingMessage`

##### socket

`Duplex`

##### head

`Buffer`

#### Returns

`void`

***

### \_onHttpServerRequest()

> **\_onHttpServerRequest**(`isSSL`, `clientToProxyRequest`, `proxyToClientResponse`): `void`

Defined in: [forked\_code/proxy.ts:1072](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1072)

#### Parameters

##### isSSL

`boolean`

##### clientToProxyRequest

`IncomingMessage`

##### proxyToClientResponse

`ServerResponse`

#### Returns

`void`

***

### \_onRequest()

> **\_onRequest**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1318](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1318)

#### Parameters

##### ctx

`IContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onRequestData()

> **\_onRequestData**(`ctx`, `chunk`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1465](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1465)

#### Parameters

##### ctx

`IContext`

##### chunk

`any`

##### callback

`any`

#### Returns

`void`

***

### \_onRequestEnd()

> **\_onRequestEnd**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1486](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1486)

#### Parameters

##### ctx

`IContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onRequestHeaders()

> **\_onRequestHeaders**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1310](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1310)

#### Parameters

##### ctx

`IContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onResponse()

> **\_onResponse**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1500](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1500)

#### Parameters

##### ctx

`IContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onResponseData()

> **\_onResponseData**(`ctx`, `chunk`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1516](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1516)

#### Parameters

##### ctx

`IContext`

##### chunk

`any`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onResponseEnd()

> **\_onResponseEnd**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1536](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1536)

#### Parameters

##### ctx

`IContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onResponseHeaders()

> **\_onResponseHeaders**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1508](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1508)

#### Parameters

##### ctx

`IContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onSocketError()

> **\_onSocketError**(`socketDescription`, `err`): `void`

Defined in: [forked\_code/proxy.ts:542](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L542)

#### Parameters

##### socketDescription

`string`

##### err

`ErrnoException`

#### Returns

`void`

***

### \_onWebSocketClose()

> **\_onWebSocketClose**(`ctx`, `closedByServer`, `code`, `message`): `void`

Defined in: [forked\_code/proxy.ts:1388](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1388)

#### Parameters

##### ctx

`IWebSocketContext`

##### closedByServer

`boolean`

##### code

`number`

##### message

`Buffer`

#### Returns

`void`

***

### \_onWebSocketConnection()

> **\_onWebSocketConnection**(`ctx`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:1326](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1326)

#### Parameters

##### ctx

`IWebSocketContext`

##### callback

`ErrorCallback`

#### Returns

`void`

***

### \_onWebSocketError()

> **\_onWebSocketError**(`ctx`, `err`): `void`

Defined in: [forked\_code/proxy.ts:1436](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1436)

#### Parameters

##### ctx

`IWebSocketContext`

##### err

`Error`

#### Returns

`void`

***

### \_onWebSocketFrame()

> **\_onWebSocketFrame**(`ctx`, `type`, `fromServer`, `data`, `flags?`): `void`

Defined in: [forked\_code/proxy.ts:1336](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1336)

#### Parameters

##### ctx

`IWebSocketContext`

##### type

`string`

##### fromServer

`boolean`

##### data

`RawData`

##### flags?

`boolean` | `WebSocketFlags`

#### Returns

`void`

***

### \_onWebSocketServerConnect()

> **\_onWebSocketServerConnect**(`isSSL`, `ws`, `upgradeReq`): `void`

Defined in: [forked\_code/proxy.ts:872](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L872)

#### Parameters

##### isSSL

`boolean`

##### ws

`WebSocket`

##### upgradeReq

`IncomingMessage`

#### Returns

`void`

***

### close()

> **close**(): `Proxy`

Defined in: [forked\_code/proxy.ts:287](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L287)

proxy.close
Stops the proxy listening.

Example

proxy.close();

#### Returns

`Proxy`

#### Implementation of

`IProxy.close`

***

### closeAsync()

> **closeAsync**(): `Promise`\<`Proxy`\>

Defined in: [forked\_code/proxy.ts:308](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L308)

#### Returns

`Promise`\<`Proxy`\>

#### Implementation of

`IProxy.closeAsync`

***

### listen()

> **listen**(`options`, `callback`): `Proxy`

Defined in: [forked\_code/proxy.ts:159](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L159)

Starts the proxy listening on the given port.  example: proxy.listen({ port: 80 });

#### Parameters

##### options

`IProxyOptions`

##### callback

`ErrorCallback` = `...`

#### Returns

`Proxy`

#### Implementation of

`IProxy.listen`

***

### onCertificateMissing()

> **onCertificateMissing**(`ctx`, `files`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:831](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L831)

#### Parameters

##### ctx

`ICertficateContext`

##### files

`ICertDetails`

##### callback

`ErrorCallback`

#### Returns

`void`

#### Implementation of

`IProxy.onCertificateMissing`

***

### onCertificateRequired()

> **onCertificateRequired**(`hostname`, `callback`): `void`

Defined in: [forked\_code/proxy.ts:824](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L824)

#### Parameters

##### hostname

`string`

##### callback

`OnCertificateRequiredCallback`

#### Returns

`void`

#### Implementation of

`IProxy.onCertificateRequired`

***

### onConnect()

> **onConnect**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:381](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L381)

#### Parameters

##### fn

`OnConnectParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onConnect`

***

### onError()

> **onError**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:376](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L376)

Adds a function to the list of functions to get called if an error occures.

Arguments

fn(ctx, err, errorKind) - The function to be called on an error.

#### Parameters

##### fn

`OnErrorParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onError`

***

### onRequest()

> **onRequest**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:391](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L391)

Adds a function to get called at the beginning of a request.

Arguments

fn(ctx, callback) - The function that gets called on each request.
Example

proxy.onRequest(function(ctx, callback) {
      console.log('REQUEST:', ctx.clientToProxyRequest.url);
      return callback();
    });

#### Parameters

##### fn

`OnRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onRequest`

***

### onRequestData()

> **onRequestData**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:442](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L442)

#### Parameters

##### fn

`OnRequestDataParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onRequestData`

***

### onRequestEnd()

> **onRequestEnd**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:447](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L447)

#### Parameters

##### fn

`OnRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onRequestEnd`

***

### onRequestHeaders()

> **onRequestHeaders**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:386](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L386)

#### Parameters

##### fn

`OnRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onRequestHeaders`

***

### onResponse()

> **onResponse**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:452](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L452)

Adds a function to get called at the beginning of the response.

Arguments

fn(ctx, callback) - The function that gets called on each response.
Example

proxy.onResponse(function(ctx, callback) {
      console.log('BEGIN RESPONSE');
      return callback();
    });

#### Parameters

##### fn

`OnRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onResponse`

***

### onResponseData()

> **onResponseData**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:462](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L462)

#### Parameters

##### fn

`OnRequestDataParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onResponseData`

***

### onResponseEnd()

> **onResponseEnd**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:468](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L468)

#### Parameters

##### fn

`OnRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onResponseEnd`

***

### onResponseHeaders()

> **onResponseHeaders**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:457](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L457)

#### Parameters

##### fn

`OnRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onResponseHeaders`

***

### onWebSocketClose()

> **onWebSocketClose**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:432](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L432)

#### Parameters

##### fn

`OnWebSocketCloseParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onWebSocketClose`

***

### onWebSocketConnection()

> **onWebSocketConnection**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:396](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L396)

#### Parameters

##### fn

`OnWebsocketRequestParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onWebSocketConnection`

***

### onWebSocketError()

> **onWebSocketError**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:437](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L437)

#### Parameters

##### fn

`OnWebSocketErrorParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onWebSocketError`

***

### onWebSocketFrame()

> **onWebSocketFrame**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:427](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L427)

#### Parameters

##### fn

`OnWebSocketFrameParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onWebSocketFrame`

***

### onWebSocketMessage()

> **onWebSocketMessage**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:414](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L414)

#### Parameters

##### fn

`OnWebSocketMessageParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onWebSocketMessage`

***

### onWebSocketSend()

> **onWebSocketSend**(`fn`): `Proxy`

Defined in: [forked\_code/proxy.ts:401](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L401)

#### Parameters

##### fn

`OnWebSocketSendParams`

#### Returns

`Proxy`

#### Implementation of

`IProxy.onWebSocketSend`

***

### use()

> **use**(`mod`): `Proxy`

Defined in: [forked\_code/proxy.ts:473](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L473)

Adds a module into the proxy. Modules encapsulate multiple life cycle processing functions into one object.

Arguments

module - The module to add. Modules contain a hash of functions to add.
Example

proxy.use({
        onError: function(ctx, err) { },
        onCertificateRequired: function(hostname, callback) { return callback(); },
        onCertificateMissing: function(ctx, files, callback) { return callback(); },
        onRequest: function(ctx, callback) { return callback(); },
        onRequestData: function(ctx, chunk, callback) { return callback(null, chunk); },
        onResponse: function(ctx, callback) { return callback(); },
        onResponseData: function(ctx, chunk, callback) { return callback(null, chunk); },
        onWebSocketConnection: function(ctx, callback) { return callback(); },
        onWebSocketSend: function(ctx, message, flags, callback) { return callback(null, message, flags); },
        onWebSocketMessage: function(ctx, message, flags, callback) { return callback(null, message, flags); },
        onWebSocketError: function(ctx, err) {  },
        onWebSocketClose: function(ctx, code, message, callback) {  },
        });
node-http-mitm-proxy provide some ready to use modules:

Proxy.gunzip Gunzip response filter (uncompress gzipped content before onResponseData and compress back after)
Proxy.wildcard provides the forked proxy's legacy wildcard certificate middleware. Prefer the `HTTPMITM` `certificates` option for new code.

#### Parameters

##### mod

`any`

#### Returns

`Proxy`

#### Implementation of

`IProxy.use`

***

### filterAndCanonizeHeaders()

> `static` **filterAndCanonizeHeaders**(`originalHeaders`): `object`

Defined in: [forked\_code/proxy.ts:1584](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1584)

#### Parameters

##### originalHeaders

`IncomingHttpHeaders`

#### Returns

`object`

***

### parseHost()

> `static` **parseHost**(`hostString`, `defaultPort?`): `object`

Defined in: [forked\_code/proxy.ts:1561](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1561)

#### Parameters

##### hostString

`string`

##### defaultPort?

`number`

#### Returns

`object`

##### host

> **host**: `string`

##### port

> **port**: `number` \| `undefined`

***

### parseHostAndPort()

> `static` **parseHostAndPort**(`req`, `defaultPort?`): \{ `host`: `string`; `port`: `number` \| `undefined`; \} \| `null`

Defined in: [forked\_code/proxy.ts:1549](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/proxy.ts#L1549)

#### Parameters

##### req

`IncomingMessage`

##### defaultPort?

`number`

#### Returns

\{ `host`: `string`; `port`: `number` \| `undefined`; \} \| `null`
