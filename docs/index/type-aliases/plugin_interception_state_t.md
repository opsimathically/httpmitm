[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / plugin\_interception\_state\_t

# Type Alias: plugin\_interception\_state\_t

> **plugin\_interception\_state\_t** = [`interception_state_t`](interception_state_t.md) \| `"CONTINUE"`

Defined in: [classes/httpmitm/httpmitm.types.ts:17](https://github.com/opsimathically/httpmitm/blob/907fc22be15c6dd08c90d5c416ed97a5bd7082a8/src/classes/httpmitm/httpmitm.types.ts#L17)

Result state returned by plugin callbacks. `CONTINUE` is plugin-only and
tells HTTPMITM to keep walking the plugin chain.
