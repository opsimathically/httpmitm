[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_certificate\_options\_t

# Type Alias: httpmitm\_certificate\_options\_t

> **httpmitm\_certificate\_options\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:85](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L85)

Root CA and leaf certificate storage options.

## Properties

### leaf\_certificates?

> `optional` **leaf\_certificates**: `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:92](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L92)

#### cache?

> `optional` **cache**: [`httpmitm_certificate_cache_options_t`](httpmitm_certificate_cache_options_t.md)

In-memory leaf certificate cache options.

#### storage?

> `optional` **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Leaf certificate storage backend. Default: `disk`.

#### wildcard?

> `optional` **wildcard**: [`httpmitm_leaf_certificate_wildcard_t`](httpmitm_leaf_certificate_wildcard_t.md)

Leaf certificate identity strategy. Default: `registrable_domain` when `certificates` is configured.

***

### root\_ca?

> `optional` **root\_ca**: `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:86](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L86)

#### ssl\_ca\_dir?

> `optional` **ssl\_ca\_dir**: `string`

Disk directory for persisted root CA material.

#### storage?

> `optional` **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Root CA storage backend. Default: `disk`.
