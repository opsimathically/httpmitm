import { HTTPMITM } from "../../src";

(async function Main() {
  const httpmitm = new HTTPMITM();

  await httpmitm.start({
    host: "127.0.0.1",
    listen_port: 6767,
    ssl_ca_dir: "/tmp/httpmitm_test_ca_keycerts/",
    http: {
      client_to_server: {
        requestHeaders: async () => {
          console.log("CLIENT_TO_SERVER: requestHeaders");
          return { state: "PASSTHROUGH" };
        },
        requestData: async () => {
          console.log("CLIENT_TO_SERVER: requestData");
          return { state: "PASSTHROUGH" };
        },
      },
      server_to_client: {
        responseHeaders: async ({ context }) => {
          console.log("SERVER_TO_CLIENT: responseHeaders");

          if (
            context.remote_host === "192.168.11.35" &&
            context.request.method === "GET" &&
            context.request.url === "/"
          ) {
            return {
              state: "MODIFIED",
              headers: [
                ...context.response.headers,
                { name: "woohoo", value: "yeehaw" },
              ],
            };
          }

          return { state: "PASSTHROUGH" };
        },
        responseData: async ({ context }) => {
          if (
            context.remote_host === "192.168.11.35" &&
            context.request.method === "GET" &&
            context.request.url === "/"
          ) {
            return {
              state: "MODIFIED",
              data: "MOOOO",
            };
          }

          return { state: "PASSTHROUGH" };
        },
      },
    },
    websocket: {
      onServerUpgrade: async () => {
        console.log("WS: onServerUpgrade");
        return { state: "PASSTHROUGH" };
      },
      onFrameSent: async () => {
        console.log("WS: onFrameSent");
        return { state: "PASSTHROUGH" };
      },
      onFrameReceived: async () => {
        console.log("WS: onFrameReceived");
        return { state: "PASSTHROUGH" };
      },
      onConnectionTerminated: async () => {
        console.log("WS: onConnectionTerminated");
      },
    },
  });
})();
