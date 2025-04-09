export default {
  // utility to avoid state update loops :
  // check who sent the message and ignore if self
  clientId: {
    type: 'float',
    default: -1,
  },
  // ---------------------------------------------------------------------------
  mousePressed: {
    type: 'boolean',
    default: false,
    meta: {
      address: '/mousepressed'
    }
  },
  mousePosition: {
    type: 'any',
    default: [ 0, 0 ],
    meta: {
      address: '/mouseposition'
    }
  },
};