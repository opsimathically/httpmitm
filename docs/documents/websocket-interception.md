[**@opsimathically/httpmitm**](../README.md)

***

[@opsimathically/httpmitm](../modules.md) / websocket-interception

# WebSocket Interception

WebSocket hooks observe the upgrade, client-to-server frames, server-to-client frames, and connection termination.

```typescript
await httpmitm.start({
  websocket: {
    onServerUpgrade: async ({ context }) => ({ state: "PASSTHROUGH" }),
    onFrameSent: async ({ context }) => ({ state: "PASSTHROUGH" }),
    onFrameReceived: async ({ context }) => ({ state: "PASSTHROUGH" }),
    onConnectionTerminated: async ({ context }) => {
      console.log(context.code);
    },
  },
});
```

## Upgrade Hook

`onServerUpgrade` receives upgrade request metadata and can pass through, modify headers, or terminate the upgrade.

## Frame Hooks

`onFrameSent` runs for client-to-server frames. `onFrameReceived` runs for server-to-client frames. Frame callbacks receive:

- `frame_type`: `message`, `ping`, or `pong`.
- `data`: frame payload.
- `flags`: WebSocket flags when supplied by the underlying layer.

Returning `MODIFIED` with `data` replaces the frame payload.

## Close Hook

`onConnectionTerminated` receives the close code, close message, direction, and whether the upstream server initiated the close. It is intended for cleanup and logging.

## Limits And Timeouts

WebSocket frame payloads are bounded by `limits.websocket_frame_bytes`, defaulting to `16 MiB`. Callback execution is bounded by `limits.callback_timeout_ms`, defaulting to `30_000`.
