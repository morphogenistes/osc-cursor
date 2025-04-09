import { createApp } from 'vue';
import { createPinia, defineStore } from 'pinia';

export default function createLayout(client, $container, App, schema) {
  const state = client.stateManager.client[schema];
  const values = state.getValues();

  const pinia = createPinia();
  const app = createApp(App);
  app.use(pinia);

  // used by store.set and state.update to avoid transmitting own updates and
  // go into endless loops
  let localCallbackLock = false;

  const useSoundworksStore = defineStore('global', {
    state: () => values,
    actions: {
      async set(name, value) {
        const updates = { clientId: client.id };
        updates[name] = value;
        this[name] = value;
        if (!localCallbackLock) {
          await state.set(updates);          
        } else {
          localCallbackLock = false;
        }
      }
    }
  });

  const store = useSoundworksStore();

  const useLocalStore = defineStore('local', {
    state: () => ({ currentPlayer: 1 }),
  });

  const localStore = useLocalStore();

  state.onUpdate(async (newValues, oldValues) => {
    // return new Promise((resolve, reject) => {
    //   if (newValues.clientId === client.id) {
    //     resolve();
    //   }
  
    //   for (let k in newValues) {
    //     localCallbackLock = true;
    //     store.set(k, newValues[k]);
    //   }
    //   resolve();
    // });
    if (newValues.clientId !== client.id) {
      localCallbackLock = true;
      for (let k in newValues) {
        if (k !== 'clientId') {
          await store.set(k, newValues[k]);
        }
      }
    }
  }, false);

  app.provide('$store', store);
  app.provide('$localStore', localStore);
  app.provide('$client', client);
  app.mount($container);

  const layoutId = `${client.role}-${client.id}`;
  const $layout = document.querySelector(`#${layoutId}`);
  return $layout;
};
