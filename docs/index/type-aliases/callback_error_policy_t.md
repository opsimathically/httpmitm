[**@opsimathically/httpmitm**](../../README.md)

***

[@opsimathically/httpmitm](../../modules.md) / [index](../README.md) / callback\_error\_policy\_t

# Type Alias: callback\_error\_policy\_t

> **callback\_error\_policy\_t** = `"TERMINATE"` \| `"PASSTHROUGH"`

Defined in: [classes/httpmitm/httpmitm.types.ts:25](../../../src/classes/httpmitm/httpmitm.types.ts#L25)

Error and timeout policy for interception callbacks.

`TERMINATE` is the default fail-closed behavior. `PASSTHROUGH` is fail-open
and forwards original traffic where the proxy can safely do so.
