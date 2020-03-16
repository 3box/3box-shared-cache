const { caller } = require('postmsg-rpc')
const { AbstractLevelDOWN } = require('abstract-leveldown')

const createClient = (opts) => {

  return class Store extends AbstractLevelDOWN {
    constructor (location, ...args) {
      super(location, ...args)
      this.location = location
    }

    _get (key, options, callback) {
			const get = caller('get', opts)
      get(key, options)
				.then((response) => {
					callback(null, response)
				})
				.catch(callback)
    }

    _put (key, value, options, callback) {
			const put = caller('put', opts)
      put(key, value, options)
				.then((response) => {
					callback(null, response)
				})
				.catch(callback)
    }
  }
}

module.exports = { createClient }
