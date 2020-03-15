const AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN

const createClient = ({ postMessage }) => {
  if (!postMessage) {
    throw new Error('postMessage argument is required')
  }

  return class Store extends AbstractLevelDOWN {
    constructor (location, ...args) {
      super(location, ...args)
      this.location = location
    }

    _get (key, options, callback) {
      console.log('calling get', { postMessage })
      postMessage('get', key, options, callback)
      setTimeout(callback)
    }
  }
}

module.exports = { createClient }
