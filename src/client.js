const { caller } = require('postmsg-rpc')
const { AbstractLevelDOWN } = require('abstract-leveldown')

const OrbitDbStorageAdapter = require('orbit-db-storage-adapter')
const LevelUp = require('levelup')

const createClient = (opts) => {
  return class Store extends AbstractLevelDOWN {
    constructor (location, ...args) {
      super(location, ...args)
      this.location = location

      caller('create', opts)(this.location, ...args)
    }

    async _open (options, callback) {
      console.log('calling open')
      const open = caller('open', opts)

      try {
        await open(this.location, options)
      } catch (error) {
        console.log("caught error", error)
        callback(error)
      }

      console.log('resolved, calling callback')
      callback()
    }

    async _close (callback) {
      const close = caller('close', opts)

      try {
        await close(this.location)
      } catch (error) {
        callback(error)
      }

      callback()
    }

    async _get (key, options, callback) {
      const get = caller('get', opts)

      let response
      try {
        response = await get(this.location, key, options)
      } catch (error) {
        console.log('error', { error })
        callback(error)
      }

      callback(null, response)
    }

    async _put (key, value, options, callback) {
      const put = caller('put', opts)

      let response
      try {
        response = await put(this.location, key, value, options)
      } catch (error) {
        callback(error)
      }

      callback(null, response)
    }

    async _del (key, options, callback) {
      const del = caller('del', opts)

      let response
      try {
        response = await del(this.location, key, options)
      } catch (error) {
        callback(error)
      }

      callback(null, response)
    }
  }
}

const createOrbitStorageProxy = async (path, { postMessage }) => {

  const ClientStore = createClient({ postMessage })
  const storage = OrbitDbStorageAdapter(
    (...args) => new ClientStore(...args),
    {}
  )

  return await storage.createStore(path)
}

const createIpfsStorageProxy = ({ postMessage }) => {
  const ClientStore = createClient({ postMessage })
  
  return (...args) => LevelUp(
    new ClientStore(...args)
  )
}

module.exports = {
  createClient,
  createOrbitStorageProxy,
  createIpfsStorageProxy,
}
