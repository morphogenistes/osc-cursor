import global from './schemas/global.js'

const propByAddress = {};
for (let k in global) {
  if (global[k].hasOwnProperty('meta') &&
      global[k].meta.hasOwnProperty('address')) {
    propByAddress[global[k].meta.address] = k;
  }
}

const addressByProp = {};
for (let [k, v] of Object.entries(propByAddress)) {
  addressByProp[v] = k;
}

export {
  propByAddress,
  addressByProp,
};