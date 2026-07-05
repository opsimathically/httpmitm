[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / httpmitm\_certificate\_options\_t

# Type Alias: httpmitm\_certificate\_options\_t

> **httpmitm\_certificate\_options\_t** = `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:102](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L102)

Root CA and leaf certificate storage options.

When this object is omitted, the legacy compatibility behavior is preserved:
root CA and exact-host leaf certificates are stored on disk under
`ssl_ca_dir` or `.http-mitm-proxy`.

## Properties

### leaf\_certificates?

> `optional` **leaf\_certificates**: `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:113](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L113)

#### cache?

> `optional` **cache**: [`httpmitm_certificate_cache_options_t`](httpmitm_certificate_cache_options_t.md)

In-memory leaf certificate cache options used when leaf storage is `memory`.

#### key\_algorithm?

> `optional` **key\_algorithm**: [`httpmitm_certificate_key_algorithm_t`](httpmitm_certificate_key_algorithm_t.md)

Leaf certificate key algorithm. Default: `ecdsa_p256`.

#### storage?

> `optional` **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Leaf certificate storage backend. Default: `disk`.

#### wildcard?

> `optional` **wildcard**: [`httpmitm_leaf_certificate_wildcard_t`](httpmitm_leaf_certificate_wildcard_t.md)

Leaf certificate identity strategy. Default: `registrable_domain` when `certificates` is configured; legacy default is `exact_host` when `certificates` is omitted.

***

### root\_ca?

> `optional` **root\_ca**: `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:103](https://github.com/opsimathically/httpmitm/blob/77ee9556653857e9362697295c3c7ddb7f307a5c/src/classes/httpmitm/httpmitm.types.ts#L103)

#### key\_algorithm?

> `optional` **key\_algorithm**: [`httpmitm_certificate_key_algorithm_t`](httpmitm_certificate_key_algorithm_t.md)

Root CA key algorithm. Default: `rsa_2048`.

#### material?

> `optional` **material**: [`httpmitm_root_ca_material_t`](httpmitm_root_ca_material_t.md)

Existing memory-only root CA material. When present, root storage defaults to `memory`.

#### ssl\_ca\_dir?

> `optional` **ssl\_ca\_dir**: `string`

Disk directory for persisted root CA material. Defaults to `ssl_ca_dir` or `.http-mitm-proxy`.

#### storage?

> `optional` **storage**: [`httpmitm_certificate_storage_t`](httpmitm_certificate_storage_t.md)

Root CA storage backend. Default: `disk`.
