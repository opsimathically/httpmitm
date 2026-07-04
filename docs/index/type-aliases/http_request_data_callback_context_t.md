[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / http\_request\_data\_callback\_context\_t

# Type Alias: http\_request\_data\_callback\_context\_t

> **http\_request\_data\_callback\_context\_t** = [`http_callback_context_base_t`](http_callback_context_base_t.md) & `object`

Defined in: [classes/httpmitm/httpmitm.types.ts:233](https://github.com/opsimathically/httpmitm/blob/e7c5b973f6579a3a4516f03611e4775f936ef4df/src/classes/httpmitm/httpmitm.types.ts#L233)

Context passed to `http.client_to_server.requestData`.

`data` is decoded when decoding succeeds. `raw_data` always contains the
original wire bytes.

## Type Declaration

### content\_encoding

> **content\_encoding**: `string` \| `null`

### content\_encodings

> **content\_encodings**: `string`[]

### data

> **data**: `Buffer`

### data\_is\_decoded

> **data\_is\_decoded**: `boolean`

### decode\_error

> **decode\_error**: `string` \| `null`

### decoded\_data

> **decoded\_data**: `Buffer`

### event

> **event**: `"request_data"`

### raw\_data

> **raw\_data**: `Buffer`

### request

> **request**: [`http_request_metadata_t`](http_request_metadata_t.md)
