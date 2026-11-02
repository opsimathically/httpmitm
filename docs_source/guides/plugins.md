# Plugins

Plugins package HTTP and WebSocket hooks into ordered reusable units. They use the same callback contexts as instance-level hooks.

```typescript
import type { httpmitm_plugin_i } from "@opsimathically/httpmitm";

class AuditPlugin implements httpmitm_plugin_i {
  plugin_name = "audit";

  http = {
    client_to_server: {
      requestHeaders: async ({ context }) => {
        console.log(context.connection_id, context.request.url);
        return { state: "CONTINUE" };
      },
    },
  };
}
```

## Ordering

Plugins run in array order. For a given hook:

1. Plugin 1 hook runs.
2. Plugin 2 hook runs if plugin 1 returned `CONTINUE` or did not implement the hook.
3. Later plugin hooks continue the same pattern.
4. The instance callback from `start()` runs only if the plugin chain continues through every plugin.

## Plugin States

Plugin hooks may return:

- `CONTINUE`: run the next plugin hook or instance callback.
- `PASSTHROUGH`: stop the chain and forward original traffic.
- `MODIFIED`: stop the chain and apply returned changes.
- `TERMINATE`: stop the chain and close the affected connection.

## Validation And Errors

Each plugin must implement at least one supported HTTP or WebSocket hook. Callback throw/reject behavior follows `callback_error_policy`: fail closed with `TERMINATE` by default, or fail open with `PASSTHROUGH` when configured.
