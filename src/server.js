const Level = require('level')
const { expose } = require('postmsg-rpc')

const deserialize = (v) => JSON.parse(v)
const serialize = (v) => JSON.stringify(v)

const methods = {
  create: (databases, path, ...args) => new Promise(
    (resolve, reject) => {
      databases[path] = Level(path, ...args)
      resolve(path)
    }
  ),

  open: (databases, path, options) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }

      databases[path].open(options, (err) => {
        if (err) reject(err)
        resolve()
      })
    }
  ),

  close: (databases, path) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }

      databases[path].close((err) => {
        if (err) reject(err)
        resolve()
      })
    }
  ),

  get: (databases, path, key, options) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }
      
      const k = deserialize(key)

      databases[path].get(k, options, (err, value) => {
        if (err) {
          reject(err)
          // const keyNotFound = (/notfound/i).test(err) || err.notFound
          // console.log({ keyNotFound, key })
          // if (!keyNotFound) reject(err)
        }
        resolve(serialize(value))
      })
    }
  ),

  put: (databases, path, key, value, options) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }

      const k = deserialize(key)
      const v = deserialize(value)

      databases[path].put(k, v, options, (err) => {
        if (err) reject(err)
        resolve()
      })
    }
  ),

  del: (databases, path, key, options) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }

      const k = deserialize(key)

      databases[path].del(k, options, (err) => {
        if (err) reject(err)
        resolve()
      })
    }
  ),

  batch: (databases, path, arr, options) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }
      
      const ops = arr.map(
        (op) => {
          const o = {
            ...op,
            key: deserialize(op.key)
          }

          if (op.value) {
            o.value = deserialize(op.value)
          }

          return o
        }
      )

      databases[path].batch(ops, options, (err) => {
        if (err) reject(err)
        resolve()
      })
    }
  ),
}

const createServer = ({ postMessage }) => {
  let databases = {}
  let rpcs = {}

  const init = () => {
    databases = {}
    rpcs = {
      create: null,
      open: null,
      close: null,
      get: null,
      put: null,
      del: null,
      batch: null,
    }
  }

  const start = () => {
    rpcs.open = expose('create', methods.create.bind(null, databases), { postMessage })
    rpcs.open = expose('open', methods.open.bind(null, databases), { postMessage })
    rpcs.close = expose('close', methods.close.bind(null, databases), { postMessage })
    rpcs.get = expose('get', methods.get.bind(null, databases), { postMessage })
    rpcs.put = expose('put', methods.put.bind(null, databases), { postMessage })
    rpcs.del = expose('del', methods.del.bind(null, databases), { postMessage })
    rpcs.batch = expose('batch', methods.batch.bind(null, databases), { postMessage })
  }

  const stop = () => {
    Object.keys(rpcs).forEach(
      (rpcName) => {
        rpcs[rpcName].close()
      }
    )

    Object.keys(databases).forEach(
      (name) => {
        delete databases[name]
      }
    )
  }

  return {
    init,
    start,
    stop,
  }
}

export { createServer }
