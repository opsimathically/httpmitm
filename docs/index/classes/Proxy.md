[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / Proxy

# Class: Proxy

Defined in: [forked\_code/proxy.ts:63](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L63)

Low-level forked proxy export retained for compatibility and advanced
integrations. Prefer `HTTPMITM` for normal package usage.

## Implements

- `IProxy`

## Constructors

### Constructor

> **new Proxy**(): `Proxy`

Defined in: [forked\_code/proxy.ts:100](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L100)

#### Returns

`Proxy`

## Properties

### ca

> **ca**: `CA`

Defined in: [forked\_code/proxy.ts:64](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L64)

#### Implementation of

`IProxy.ca`

***

### connectRequests

> **connectRequests**: `Record`\<`string`, `http.IncomingMessage`\> = `{}`

Defined in: [forked\_code/proxy.ts:65](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L65)

***

### forceSNI

> **forceSNI**: `boolean`

Defined in: [forked\_code/proxy.ts:66](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L66)

#### Implementation of

`IProxy.forceSNI`

***

### httpAgent

> **httpAgent**: `Agent`

Defined in: [forked\_code/proxy.ts:67](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L67)

#### Implementation of

`IProxy.httpAgent`

***

### httpHost?

> `optional` **httpHost**: `string`

Defined in: [forked\_code/proxy.ts:68](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L68)

***

### httpPort

> **httpPort**: `number`

Defined in: [forked\_code/proxy.ts:69](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L69)

#### Implementation of

`IProxy.httpPort`

***

### httpsAgent

> **httpsAgent**: `Agent`

Defined in: [forked\_code/proxy.ts:71](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L71)

#### Implementation of

`IProxy.httpsAgent`

***

### httpServer

> **httpServer**: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`

Defined in: [forked\_code/proxy.ts:70](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L70)

***

### httpsPort?

> `optional` **httpsPort**: `number`

Defined in: [forked\_code/proxy.ts:72](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L72)

#### Implementation of

`IProxy.httpsPort`

***

### httpsServer

> **httpsServer**: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`

Defined in: [forked\_code/proxy.ts:73](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L73)

***

### keepAlive

> **keepAlive**: `boolean`

Defined in: [forked\_code/proxy.ts:74](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L74)

#### Implementation of

`IProxy.keepAlive`

***

### onConnectHandlers

> **onConnectHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:75](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L75)

***

### onErrorHandlers

> **onErrorHandlers**: `HandlerType`\<(`callback`) => `void`\>

Defined in: [forked\_code/proxy.ts:76](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L76)

***

### onRequestDataHandlers

> **onRequestDataHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:77](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L77)

***

### onRequestEndHandlers

> **onRequestEndHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:78](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L78)

***

### onRequestHandlers

> **onRequestHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:79](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L79)

***

### onRequestHeadersHandlers

> **onRequestHeadersHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:80](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L80)

***

### onResponseDataHandlers

> **onResponseDataHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:81](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L81)

***

### onResponseEndHandlers

> **onResponseEndHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:82](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L82)

***

### onResponseHandlers

> **onResponseHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:83](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L83)

***

### onResponseHeadersHandlers

> **onResponseHeadersHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:84](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L84)

***

### onWebSocketCloseHandlers

> **onWebSocketCloseHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:85](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L85)

***

### onWebSocketConnectionHandlers

> **onWebSocketConnectionHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:86](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L86)

***

### onWebSocketErrorHandlers

> **onWebSocketErrorHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:87](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L87)

***

### onWebSocketFrameHandlers

> **onWebSocketFrameHandlers**: `HandlerType`\<(`fcn`) => `void`\>

Defined in: [forked\_code/proxy.ts:88](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L88)

***

### options

> **options**: `IProxyOptions`

Defined in: [forked\_code/proxy.ts:89](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L89)

#### Implementation of

`IProxy.options`

***

### responseContentPotentiallyModified

> **responseContentPotentiallyModified**: `boolean`

Defined in: [forked\_code/proxy.ts:90](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L90)

***

### sslCaDir

> **sslCaDir**: `string`

Defined in: [forked\_code/proxy.ts:91](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L91)

#### Implementation of

`IProxy.sslCaDir`

***

### sslSemaphores

> **sslSemaphores**: `Record`\<`string`, `semaphore.Semaphore`\> = `{}`

Defined in: [forked\_code/proxy.ts:92](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L92)

***

### sslServers

> **sslServers**: `Record`\<`string`, `IProxySSLServer`\> = `{}`

Defined in: [forked\_code/proxy.ts:93](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L93)

***

### timeout

> **timeout**: `number`

Defined in: [forked\_code/proxy.ts:94](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L94)

#### Implementation of

`IProxy.timeout`

***

### wsServer

> **wsServer**: `WebSocketServer` \| `undefined`

Defined in: [forked\_code/proxy.ts:95](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L95)

***

### wssServer

> **wssServer**: `WebSocketServer` \| `undefined`

Defined in: [forked\_code/proxy.ts:96](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L96)

***

### gunzip

> `static` **gunzip**: `object`

Defined in: [forked\_code/proxy.ts:98](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L98)

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

Defined in: [forked\_code/proxy.ts:97](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L97)

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

Defined in: [forked\_code/proxy.ts:191](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L191)

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

Defined in: [forked\_code/proxy.ts:767](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L767)

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

Defined in: [forked\_code/proxy.ts:481](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L481)

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

Defined in: [forked\_code/proxy.ts:524](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L524)

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

Defined in: [forked\_code/proxy.ts:988](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L988)

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

Defined in: [forked\_code/proxy.ts:1234](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1234)

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

Defined in: [forked\_code/proxy.ts:1381](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1381)

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

Defined in: [forked\_code/proxy.ts:1402](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1402)

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

Defined in: [forked\_code/proxy.ts:1226](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1226)

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

Defined in: [forked\_code/proxy.ts:1416](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1416)

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

Defined in: [forked\_code/proxy.ts:1432](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1432)

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

Defined in: [forked\_code/proxy.ts:1452](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1452)

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

Defined in: [forked\_code/proxy.ts:1424](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1424)

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

Defined in: [forked\_code/proxy.ts:473](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L473)

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

Defined in: [forked\_code/proxy.ts:1304](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1304)

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

Defined in: [forked\_code/proxy.ts:1242](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1242)

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

Defined in: [forked\_code/proxy.ts:1352](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1352)

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

Defined in: [forked\_code/proxy.ts:1252](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1252)

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

Defined in: [forked\_code/proxy.ts:788](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L788)

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

Defined in: [forked\_code/proxy.ts:240](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L240)

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

Defined in: [forked\_code/proxy.ts:261](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L261)

#### Returns

`Promise`\<`Proxy`\>

#### Implementation of

`IProxy.closeAsync`

***

### listen()

> **listen**(`options`, `callback`): `Proxy`

Defined in: [forked\_code/proxy.ts:118](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L118)

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

Defined in: [forked\_code/proxy.ts:752](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L752)

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

Defined in: [forked\_code/proxy.ts:740](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L740)

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

Defined in: [forked\_code/proxy.ts:312](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L312)

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

Defined in: [forked\_code/proxy.ts:307](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L307)

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

Defined in: [forked\_code/proxy.ts:322](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L322)

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

Defined in: [forked\_code/proxy.ts:373](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L373)

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

Defined in: [forked\_code/proxy.ts:378](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L378)

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

Defined in: [forked\_code/proxy.ts:317](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L317)

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

Defined in: [forked\_code/proxy.ts:383](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L383)

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

Defined in: [forked\_code/proxy.ts:393](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L393)

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

Defined in: [forked\_code/proxy.ts:399](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L399)

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

Defined in: [forked\_code/proxy.ts:388](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L388)

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

Defined in: [forked\_code/proxy.ts:363](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L363)

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

Defined in: [forked\_code/proxy.ts:327](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L327)

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

Defined in: [forked\_code/proxy.ts:368](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L368)

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

Defined in: [forked\_code/proxy.ts:358](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L358)

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

Defined in: [forked\_code/proxy.ts:345](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L345)

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

Defined in: [forked\_code/proxy.ts:332](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L332)

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

Defined in: [forked\_code/proxy.ts:404](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L404)

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

Defined in: [forked\_code/proxy.ts:1500](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1500)

#### Parameters

##### originalHeaders

`IncomingHttpHeaders`

#### Returns

`object`

***

### parseHost()

> `static` **parseHost**(`hostString`, `defaultPort?`): `object`

Defined in: [forked\_code/proxy.ts:1477](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1477)

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

Defined in: [forked\_code/proxy.ts:1465](https://github.com/opsimathically/httpmitm/blob/4aebb5332c43f07134a000a763217bcbef810564/src/forked_code/proxy.ts#L1465)

#### Parameters

##### req

`IncomingMessage`

##### defaultPort?

`number`

#### Returns

\{ `host`: `string`; `port`: `number` \| `undefined`; \} \| `null`
