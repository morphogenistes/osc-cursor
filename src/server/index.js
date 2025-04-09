import '@soundworks/helpers/polyfills.js';
import { Server } from '@soundworks/core/server.js';
import platformInitPlugin from '@soundworks/plugin-platform-init/server.js';
import * as NodeOsc from 'node-osc';
import globalSchema from './schemas/global.js';
import { propByAddress, addressByProp } from './osc-routing.js';

import { loadConfig } from '@soundworks/helpers/node.js';

import '../utils/catch-unhandled-errors.js';

// - General documentation: https://soundworks.dev/
// - API documentation:     https://soundworks.dev/api
// - Issue Tracker:         https://github.com/collective-soundworks/soundworks/issues
// - Wizard & Tools:        `npx soundworks`

const config = loadConfig(process.env.ENV, import.meta.url);

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${process.env.ENV || 'default'}" environment
- [pid: ${process.pid}]
--------------------------------------------------------
`);

/**
 * Create the soundworks server
 */
const server = new Server(config);

/**
 * Create the OSC client
 */
const oscSendPort = 3334;
const oscListenPort = 3333;

// configure the server for usage within this application template
server.useDefaultApplicationTemplate();

/**
 * Register plugins and schemas
 */
server.pluginManager.register('platform-init', platformInitPlugin);
// server.pluginManager.register('my-plugin', plugin);
// server.stateManager.registerSchema('my-schema', definition);

/**
 * Register schemas
 */
server.stateManager.registerSchema('global', globalSchema);
const oscClient = new NodeOsc.Client('127.0.0.1', oscSendPort);

/**
 * Send OSC messages from schema updates
 */
const hook = server.stateManager.registerUpdateHook('global', (updates, values) => {
  for (let [key, value] of Object.entries(updates)) {
    const address = addressByProp[key];
    if (address) {
      const v = globalSchema[key].type === 'boolean'
                ? (value ? 1 : 0)
                : value;
      
      oscClient.send(address, v, () => { /* ... ack ? */ });
    }
  }
});

/**
 * Launch application (init plugins, http server, etc.)
 */
await server.start();

/**
 * Create shared state
 */
const globalState = await server.stateManager.create('global');
// const globalState = server.stateManager.create('global');

/**
 * Update global state from OSC messages
 */
const oscServer = new NodeOsc.Server(oscListenPort, '0.0.0.0', () => {
  console.log(`OSC server is listening on port ${oscListenPort}`)
});

//*
oscServer.on('message', async (msg) => {
  const [ a, ...m ] = msg;
  const prop = propByAddress[a];
  if (prop) {
    let v = m[0];
    if (globalSchema[prop].type === 'boolean') {
      v = m[0] !== 0;
    } else if (globalSchema[prop].type === 'any' &&
               m.length > 1) {
      v = m;
    }

    const updates = {};
    updates[prop] = v;
    await globalState.set(updates);
  }
});
//*/


// and do your own stuff!

