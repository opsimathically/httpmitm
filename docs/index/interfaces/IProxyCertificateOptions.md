[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / IProxyCertificateOptions

# Interface: IProxyCertificateOptions

Defined in: [forked\_code/types.ts:50](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/types.ts#L50)

## Properties

### leafCertificates?

> `optional` **leafCertificates**: `object`

Defined in: [forked\_code/types.ts:56](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/types.ts#L56)

#### cache?

> `optional` **cache**: [`IProxyCertificateCacheOptions`](IProxyCertificateCacheOptions.md)

#### keyAlgorithm?

> `optional` **keyAlgorithm**: [`IProxyCertificateKeyAlgorithm`](../type-aliases/IProxyCertificateKeyAlgorithm.md)

#### storage?

> `optional` **storage**: [`IProxyCertificateStorage`](../type-aliases/IProxyCertificateStorage.md)

#### wildcard?

> `optional` **wildcard**: [`IProxyLeafCertificateWildcard`](../type-aliases/IProxyLeafCertificateWildcard.md)

***

### rootCA?

> `optional` **rootCA**: `object`

Defined in: [forked\_code/types.ts:51](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/forked_code/types.ts#L51)

#### keyAlgorithm?

> `optional` **keyAlgorithm**: [`IProxyCertificateKeyAlgorithm`](../type-aliases/IProxyCertificateKeyAlgorithm.md)

#### sslCaDir?

> `optional` **sslCaDir**: `string`

#### storage?

> `optional` **storage**: [`IProxyCertificateStorage`](../type-aliases/IProxyCertificateStorage.md)
