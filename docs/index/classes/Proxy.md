[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / Proxy

# Class: Proxy

Defined in: [forked\_code/proxy.ts:101](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L101)

Low-level forked proxy export retained for compatibility and advanced
integrations. Prefer `HTTPMITM` for normal package usage.

## Implements

- `IProxy`

## Constructors

### Constructor

> **new Proxy**(): `Proxy`

Defined in: [forked\_code/proxy.ts:139](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L139)

#### Returns

`Proxy`

## Properties

### ca

> **ca**: `CA`

Defined in: [forked\_code/proxy.ts:102](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L102)

#### Implementation of

`IProxy.ca`

***

### certificateOptions

> **certificateOptions**: `object`

Defined in: [forked\_code/proxy.ts:129](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L129)

#### leafCertificates

> **leafCertificates**: `object`

##### leafCertificates.cache

> **cache**: `object`

##### leafCertificates.cache.maxEntries

> **maxEntries**: `number`

##### leafCertificates.cache.ttlMs

> **ttlMs**: `number`

##### leafCertificates.storage

> **storage**: `IProxyCertificateStorage`

##### leafCertificates.wildcard

> **wildcard**: `IProxyLeafCertificateWildcard`

#### rootCA

> **rootCA**: `object`

##### rootCA.sslCaDir

> **sslCaDir**: `string`

##### rootCA.storage

> **storage**: `IProxyCertificateStorage`

#### Implementation of

`IProxy.certificateOptions`

***

### connectRequests

> **connectRequests**: `Record`\<`string`, `http.IncomingMessage`\> = `{}`

Defined in: [forked\_code/proxy.ts:103](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L103)

***

### forceSNI

> **forceSNI**: `boolean`

Defined in: [forked\_code/proxy.ts:104](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L104)

#### Implementation of

`IProxy.forceSNI`

***

### httpAgent

> **httpAgent**: `Agent`

Defined in: [forked\_code/proxy.ts:105](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L105)

#### Implementation of

`IProxy.httpAgent`

***

### httpHost?

> `optional` **httpHost**: `string`

Defined in: [forked\_code/proxy.ts:106](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L106)

***

### httpPort

> **httpPort**: `number`

Defined in: [forked\_code/proxy.ts:107](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L107)

#### Implementation of

`IProxy.httpPort`

***

### httpsAgent

> **httpsAgent**: `Agent`

Defined in: [forked\_code/proxy.ts:109](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L109)

#### Implementation of

`IProxy.httpsAgent`

***

### httpServer

> **httpServer**: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`

Defined in: [forked\_code/proxy.ts:108](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L108)

***

### httpsPort?

> `optional` **httpsPort**: `number`

Defined in: [forked\_code/proxy.ts:110](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L110)

#### Implementation of

`IProxy.httpsPort`

***

### httpsServer

> **httpsServer**: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`

Defined in: [forked\_code/proxy.ts:111](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L111)

***

### keepAlive

> **keepAlive**: `boolean`

Defined in: [forked\_code/proxy.ts:112](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L112)

#### Implementation of

`IProxy.keepAlive`

***

### onConnectHandlers

> **onConnectHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:113](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L113)

***

### onErrorHandlers

> **onErrorHandlers**: `HandlerType`\<(`callback`) => `void`\>

Defined in: [forked\_code/proxy.ts:114](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L114)

***

### onRequestDataHandlers

> **onRequestDataHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:115](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L115)

***

### onRequestEndHandlers

> **onRequestEndHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:116](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L116)

***

### onRequestHandlers

> **onRequestHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:117](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L117)

***

### onRequestHeadersHandlers

> **onRequestHeadersHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:118](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L118)

***

### onResponseDataHandlers

> **onResponseDataHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:119](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L119)

***

### onResponseEndHandlers

> **onResponseEndHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:120](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L120)

***

### onResponseHandlers

> **onResponseHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:121](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L121)

***

### onResponseHeadersHandlers

> **onResponseHeadersHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:122](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L122)

***

### onWebSocketCloseHandlers

> **onWebSocketCloseHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:123](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L123)

***

### onWebSocketConnectionHandlers

> **onWebSocketConnectionHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:124](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L124)

***

### onWebSocketErrorHandlers

> **onWebSocketErrorHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:125](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L125)

***

### onWebSocketFrameHandlers

> **onWebSocketFrameHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:126](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L126)

***

### options

> **options**: `IProxyOptions`

Defined in: [forked\_code/proxy.ts:127](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L127)

#### Implementation of

`IProxy.options`

***

### responseContentPotentiallyModified

> **responseContentPotentiallyModified**: `boolean`

Defined in: [forked\_code/proxy.ts:128](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L128)

***

### sslCaDir

> **sslCaDir**: `string`

Defined in: [forked\_code/proxy.ts:130](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L130)

#### Implementation of

`IProxy.sslCaDir`

***

### sslSemaphores

> **sslSemaphores**: `Record`\<`string`, `semaphore.Semaphore`\> = `{}`

Defined in: [forked\_code/proxy.ts:131](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L131)

***

### sslServers

> **sslServers**: `Record`\<`string`, `IProxySSLServer`\> = `{}`

Defined in: [forked\_code/proxy.ts:132](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L132)

***

### timeout

> **timeout**: `number`

Defined in: [forked\_code/proxy.ts:133](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L133)

#### Implementation of

`IProxy.timeout`

***

### wsServer

> **wsServer**: `WebSocketServer` \| `undefined`

Defined in: [forked\_code/proxy.ts:134](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L134)

***

### wssServer

> **wssServer**: `WebSocketServer` \| `undefined`

Defined in: [forked\_code/proxy.ts:135](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L135)

***

### gunzip

> `static` **gunzip**: `object`

Defined in: [forked\_code/proxy.ts:137](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L137)

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

Defined in: [forked\_code/proxy.ts:136](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L136)

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

Defined in: [forked\_code/proxy.ts:236](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L236)

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

Defined in: [forked\_code/proxy.ts:823](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L823)

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

Defined in: [forked\_code/proxy.ts:526](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L526)

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

Defined in: [forked\_code/proxy.ts:569](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L569)

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

Defined in: [forked\_code/proxy.ts:1044](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1044)

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

Defined in: [forked\_code/proxy.ts:1290](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1290)

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

Defined in: [forked\_code/proxy.ts:1437](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1437)

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

Defined in: [forked\_code/proxy.ts:1458](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1458)

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

Defined in: [forked\_code/proxy.ts:1282](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1282)

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

Defined in: [forked\_code/proxy.ts:1472](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1472)

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

Defined in: [forked\_code/proxy.ts:1488](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1488)

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

Defined in: [forked\_code/proxy.ts:1508](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1508)

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

Defined in: [forked\_code/proxy.ts:1480](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1480)

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

Defined in: [forked\_code/proxy.ts:518](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L518)

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

Defined in: [forked\_code/proxy.ts:1360](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1360)

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

Defined in: [forked\_code/proxy.ts:1298](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1298)

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

Defined in: [forked\_code/proxy.ts:1408](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1408)

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

Defined in: [forked\_code/proxy.ts:1308](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1308)

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

Defined in: [forked\_code/proxy.ts:844](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L844)

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

Defined in: [forked\_code/proxy.ts:285](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L285)

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

Defined in: [forked\_code/proxy.ts:306](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L306)

#### Returns

`Promise`\<`Proxy`\>

#### Implementation of

`IProxy.closeAsync`

***

### listen()

> **listen**(`options`, `callback`): `Proxy`

Defined in: [forked\_code/proxy.ts:157](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L157)

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

Defined in: [forked\_code/proxy.ts:807](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L807)

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

Defined in: [forked\_code/proxy.ts:800](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L800)

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

Defined in: [forked\_code/proxy.ts:357](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L357)

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

Defined in: [forked\_code/proxy.ts:352](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L352)

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

Defined in: [forked\_code/proxy.ts:367](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L367)

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

Defined in: [forked\_code/proxy.ts:418](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L418)

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

Defined in: [forked\_code/proxy.ts:423](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L423)

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

Defined in: [forked\_code/proxy.ts:362](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L362)

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

Defined in: [forked\_code/proxy.ts:428](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L428)

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

Defined in: [forked\_code/proxy.ts:438](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L438)

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

Defined in: [forked\_code/proxy.ts:444](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L444)

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

Defined in: [forked\_code/proxy.ts:433](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L433)

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

Defined in: [forked\_code/proxy.ts:408](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L408)

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

Defined in: [forked\_code/proxy.ts:372](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L372)

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

Defined in: [forked\_code/proxy.ts:413](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L413)

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

Defined in: [forked\_code/proxy.ts:403](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L403)

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

Defined in: [forked\_code/proxy.ts:390](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L390)

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

Defined in: [forked\_code/proxy.ts:377](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L377)

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

Defined in: [forked\_code/proxy.ts:449](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L449)

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
Proxy.wildcard Generates wilcard certificates by default (so less certificates are generated)

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

Defined in: [forked\_code/proxy.ts:1556](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1556)

#### Parameters

##### originalHeaders

`IncomingHttpHeaders`

#### Returns

`object`

***

### parseHost()

> `static` **parseHost**(`hostString`, `defaultPort?`): `object`

Defined in: [forked\_code/proxy.ts:1533](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1533)

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

Defined in: [forked\_code/proxy.ts:1521](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/forked_code/proxy.ts#L1521)

#### Parameters

##### req

`IncomingMessage`

##### defaultPort?

`number`

#### Returns

\{ `host`: `string`; `port`: `number` \| `undefined`; \} \| `null`
