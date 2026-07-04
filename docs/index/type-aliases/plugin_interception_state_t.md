[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_interception\_state\_t

# Type Alias: plugin\_interception\_state\_t

> **plugin\_interception\_state\_t** = [`interception_state_t`](interception_state_t.md) \| `"CONTINUE"`

Defined in: [classes/httpmitm/httpmitm.types.ts:17](https://github.com/opsimathically/httpmitm/blob/4e9f1fda2062b9eb02e25b4928dc9b6d7c4b9f7a/src/classes/httpmitm/httpmitm.types.ts#L17)

Result state returned by plugin callbacks. `CONTINUE` is plugin-only and
tells HTTPMITM to keep walking the plugin chain.
