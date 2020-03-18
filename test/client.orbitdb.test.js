const { createClient } = require('../src')

const OrbitDbStorageAdapter = require('orbit-db-storage-adapter')
const OrbitDbCache = require('orbit-db-cache')
const OrbitDB = require('orbit-db')
const IPFS = require('ipfs')

describe("Shared cache module", () => {  
  let ClientStore, db, backendDb = {}
  
  beforeAll(
    async () => {
      const clientOpts = getClientOpts()
      
      startRpcServer({ backendDb })

      ClientStore = createClient(clientOpts)

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
    }
  )

  afterAll(
    () => {
      Object.keys(backendDb).forEach(
        (k) => delete backendDb[k]
      )

      ipfs.stop()
    }
  )

  describe("ClientStore against object store through orbit-db as cache", () => {
    it('creates cache on new entry: add', async () => {
      await db.add('1')
      console.log({ backendDb})
      expect(
        Object.keys(backendDb).length
      ).toEqual(2)
    })
  })
})
