import assert from 'node:assert';
import { once } from 'node:events';
import http, { type IncomingMessage, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import path from 'node:path';
import test from 'node:test';
import WebSocket, { WebSocketServer } from 'ws';

import { HTTPMITM } from '../../src';
import type { httpmitm_start_params_t } from '../../src';

(async function () {
  const httpmitm = new HTTPMITM();

  await httpmitm.start({
    host: '127.0.0.1',
    listen_port: 6767,
    ssl_ca_dir: '/tmp/httpmitm_test_ca_keycerts/',
    http: {
      client_to_server: {
        requestHeaders: async () => {
          console.log('CLIENT_TO_SERVER: requestHeaders');
          return { state: 'PASSTHROUGH' };
        },
        requestData: async () => {
          console.log('CLIENT_TO_SERVER: requestData');
          return { state: 'PASSTHROUGH' };
        }
      },
      server_to_client: {
        responseHeaders: async () => {
          console.log('SERVER_TO_CLIENT: responseHeaders');
          return { state: 'PASSTHROUGH' };
        },
        responseData: async () => {
          console.log('SERVER_TO_CLIENT: responseData');
          return { state: 'PASSTHROUGH' };
        }
      }
    },
    websocket: {
      onServerUpgrade: async (params) => {
        console.log('WS: onServerUpgrade');
        return { state: 'PASSTHROUGH' };
      },
      onFrameSent: async (params) => {
        console.log('WS: onFrameSent');
        return {
          state: 'PASSTHROUGH'
        };
      },
      onFrameReceived: async (params) => {
        console.log('WS: onFrameRecieved');
        debugger;
        return {
          state: 'PASSTHROUGH'
        };
      },
      onConnectionTerminated: async (params) => {
        console.log('WS: onConnectionTerminated');
      }
    }
  });
})();
