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

    _serializeKey(key) {
      return JSON.stringify(key)
    }

    _serializeValue(value) {
      return JSON.stringify(value)
    }

    _deserialize (v) {
      return JSON.parse(v)
    }

    _deserializeBuffer(v) {
      return JSON.parse(v).data
    }

    async _open (options, callback) {
      const open = caller('open', opts)

      try {
        await open(this.location, options)
      } catch (error) {
        callback(error)
      }

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
        error.notFound = true
        return callback(error)
      }

      if (options.asBuffer) {
        const r = Buffer.from(this._deserializeBuffer(response))
        callback(null, r)
      } else {
        callback(null, this._deserialize(response))
      }
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
  
    async _batch (arr, options, callback) {
      const batch = caller('batch', opts)

      let response
      try {
        response = await batch(this.location, arr, options)
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

export {
  createClient,
  createOrbitStorageProxy,
  createIpfsStorageProxy,
}
