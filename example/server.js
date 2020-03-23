const level = require('level')
const { expose } = require('postmsg-rpc')

let dbs = {

}

const serverOpts = {
  postMessage: (...args) => {
    console.log("posting to windpw")
    return window.parent.postMessage(...args)
  }
}

function runServer() {
  expose('create', (path, options) => {
    console.log('creating', path, options)
    dbs[path] = level(path, options)
    return new Promise((resolve) => resolve())
  })

  expose('open', (path, options) => {
    console.log("opening database")
    return new Promise(
      (resolve, reject) => {
        dbs[path].open(options, (err) => {
          console.log("opened db", err)
          if (err) {
            reject(err)
          }
          resolve()
        })
      }
    )
  }, serverOpts)
  
  expose('close', (path) => {
    console.log("closing database")

    return new Promise(
      (resolve, reject) => {
        dbs[path].close(
          (err) => {
            console.log("closed database", err)
            if (err) { reject(err) }
            resolve()
          }
        )
      }
    )
  }, serverOpts)
  
  expose('get', (path, key, options) => {
    console.log("get from database", path, "key", key)

    return new Promise(
      (resolve, reject) => {
        dbs[path].get(key, options, (err, value) => {
          console.log("get database", err, key, value)

          // if (err) { reject(err) }
          resolve(value || "")
        })
      }
    )
  }, serverOpts)
  
  expose('put', (path, key, value, options) => {
    console.log("put database", key, value)

    return new Promise(
      (resolve, reject) => {
        dbs[path].put(key, value, options, (err) => {
          console.log("put database", err, key, value)

          if (err) { reject(err) }
          resolve(value)
        })
      }
    )
  }, serverOpts)
  
  expose('del', (path, key, options) => {
    console.log("del database", key, options)

    return new Promise(
      (resolve, reject) => {
        dbs[path].del(key, options, (err) => {
          console.log("del database", err, key, options)

          if (err) { reject(err) }
          resolve()
        })
      }
    )
  }, serverOpts)
}

runServer()
