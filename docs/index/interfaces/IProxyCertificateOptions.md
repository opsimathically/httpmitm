[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / IProxyCertificateOptions

# Interface: IProxyCertificateOptions

Defined in: [forked\_code/types.ts:56](../../../src/forked_code/types.ts#L56)

## Properties

### leafCertificates?

> `optional` **leafCertificates**: `object`

Defined in: [forked\_code/types.ts:63](../../../src/forked_code/types.ts#L63)

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

Defined in: [forked\_code/types.ts:57](../../../src/forked_code/types.ts#L57)

#### keyAlgorithm?

> `optional` **keyAlgorithm**: [`IProxyCertificateKeyAlgorithm`](../type-aliases/IProxyCertificateKeyAlgorithm.md)

#### material?

> `optional` **material**: [`IProxyRootCAMaterial`](IProxyRootCAMaterial.md)

#### sslCaDir?

> `optional` **sslCaDir**: `string`

#### storage?

> `optional` **storage**: [`IProxyCertificateStorage`](../type-aliases/IProxyCertificateStorage.md)
