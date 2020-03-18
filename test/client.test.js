const levelup = require('levelup')
const EventEmitter = require('events')

const { expose } = require('postmsg-rpc')
const { createClient } = require('../src')

const OrbitDbStorageAdapter = require('orbit-db-storage-adapter')
const OrbitDbCache = require('orbit-db-cache')
const OrbitDB = require('orbit-db')
const IPFS = require('ipfs')

describe("Shared cache module", () => {  
  let ClientStore, db
  
  beforeAll(
    () => {
      const window = {
        self: new EventEmitter(),
        postMessage: jest.fn().mockImplementation((msg, trgt) => {
          window.self.emit('message', msg)
        }),
        addListener: jest.fn().mockImplementation((evtName, evtCb) => {
          window.self.on(evtName, (data) => {
            evtCb({ data })
          })
        })
      }
      
      const iframe = {
        self: new EventEmitter(),
        postMessage: jest.fn().mockImplementation((msg, trgt) => {
          iframe.self.emit('message', msg)
        }),
        addListener: jest.fn().mockImplementation((evtName, evtCb) => {
          iframe.self.on(evtName, (data) => {
            evtCb({ data })
          })
        })
      }

      const serverOpts = {
        postMessage: window.postMessage,
        addListener: iframe.addListener,
      }

      const backendDb = {}

      expose('open', (options) => {
        console.log('open', options)
        return backendDb = {}
      }, serverOpts)
    
      expose('close', () => {
        console.log('close')
        return backendDb = {}
      }, serverOpts)
    
      expose('get', (key, options) => {
        return backendDb[key]
      }, serverOpts)
      
      expose('put', (key, value, options) => {
        return backendDb[key] = value
      }, serverOpts)
    
      expose('del', (key, options) => {
        delete backendDb[key]
      }, serverOpts)
    
      ClientStore = createClient({
        postMessage: iframe.postMessage,
        addListener: window.addListener,
      })
    }
  )

  afterAll(
    () => {
      Object.keys(backendDb).forEach(
        (k) => delete backendDb[k]
      )
    }
  )

  describe("ClientStore against object store through levelup", () => {

    db = levelup(new ClientStore('./mydb'))

    it('open', (done) => {
      db.open({}, (err) => {
        expect(err).toBe(null)
        done()
      })
    })
 
    it("put", (done) => {
      db.put('key', 123, (err) => {
        expect(backendDb.key).toEqual(123)
        done()
      })
    })

    it("get", (done) => {
      db.get('key', {}, (err, value) => {
        expect(backendDb.key).toEqual(value)
        done()
      })
    })

    it("del", (done) => {
      db.del('key', (err) => {
        expect(backendDb.key).toEqual(undefined)
        done()
      })
    })
  })

  describe.only("ClientStore against object store through orbit-db as cache", () => {
    beforeAll(
      async () => {
        const cachePath = './orbitdb/cache'
        const orbitDbStorage = OrbitDbStorageAdapter(
          (...args) => new ClientStore(...args),
          {}
        )

        const cacheStorage = await orbitDbStorage.createStore(cachePath)
        const cache = new OrbitDbCache(cacheStorage)

        const ipfs = await IPFS.create()
        const orbitDb = await OrbitDB.createInstance(ipfs, { cache })
        
        db = await orbitDb.log('0')
        console.log('before all')
      }
    )

    it('creates cache on new entry: add', async () => {
      await db.add('1')
      console.log({ backendDb})
      expect(
        Object.keys(backendDb).length
      ).toEqual(2)
    })

    afterAll(
      () => {
        console.log('after all')
        ipfs.stop()
      }
    )
  })
})
