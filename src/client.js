const { caller } = require('postmsg-rpc')
const { AbstractLevelDOWN } = require('abstract-leveldown')

const createClient = (opts) => {
  return class Store extends AbstractLevelDOWN {
    constructor (location, ...args) {
      super(location, ...args)
      this.location = location
    }

    async _open (options, callback) {
      const open = caller('open', opts)

      try {
        await open(options)
      } catch (error) {
        callback(error)
      }

      callback()
    }

    async _close (callback) {
      const close = caller('close', opts)

      try {
        await close()
      } catch (error) {
        callback(error)
      }

      callback()
    }

    async _get (key, options, callback) {
      const get = caller('get', opts)

      let response
      try {
        response = await get(key, options)
      } catch (error) {
        callback(error)
      }

      callback(null, response)
    }

    async _put (key, value, options, callback) {
      const put = caller('put', opts)

      let response
      try {
        response = await put(key, value, options)
      } catch (error) {
        callback(error)
      }

      callback(null, response)
    }

    async _del (key, options, callback) {
      const del = caller('del', opts)

      let response
      try {
        response = await del(key, options)
      } catch (error) {
        callback(error)
      }

      callback(null, response)
    }
  }
}

module.exports = { createClient }
