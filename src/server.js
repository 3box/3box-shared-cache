const Level = require('level')
const { expose } = require('postmsg-rpc')

const methods = {
  create: (databases, path) => new Promise(
    (resolve, reject) => {
      databases[path] = Level(path)
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

      databases[path].get(key, options, (err, value) => {
        if (err) {
          const keyNotFound = (/notfound/i).test(err) || err.notFound
          if (!keyNotFound) reject(err)
        }

        resolve(value)
      })
    }
  ),

  put: (databases, path, key, value, options) => new Promise(
    (resolve, reject) => {
      if (!databases[path]) {
        reject("Unknown database")
      }

      databases[path].put(key, value, options, (err) => {
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

      databases[path].del(key, options, (err) => {
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
    }
  }

  const start = () => {
    rpcs.open = expose('create', methods.create.bind(null, databases), { postMessage })
    rpcs.open = expose('open', methods.open.bind(null, databases), { postMessage })
    rpcs.close = expose('close', methods.close.bind(null, databases), { postMessage })
    rpcs.get = expose('get', methods.get.bind(null, databases), { postMessage })
    rpcs.put = expose('put', methods.put.bind(null, databases), { postMessage })
    rpcs.del = expose('del', methods.del.bind(null, databases), { postMessage })
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

module.exports = { createServer }
