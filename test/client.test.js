const levelup = require('levelup')
const EventEmitter = require('events')

const { expose } = require('postmsg-rpc')
const { createClient } = require('../src')

describe("Shared cache module", () => {
  describe("Client", () => {
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
			
    let Client, db, backendDb = {}, serverOpts = {
      postMessage: window.postMessage,
      addListener: iframe.addListener,
    }
    
		beforeAll(
      () => {

        expose('get', (key, options) => {
          return backendDb[key]
        }, serverOpts)
        
        expose('put', (key, value, options) => {
          return backendDb[key] = value
        }, serverOpts)

        expose('del', (key, options) => {
          delete backendDb[key]
        }, serverOpts)

        Client = createClient({
					postMessage: iframe.postMessage,
					addListener: window.addListener,
				})

        db = levelup(new Client('./mydb'))
      }
    )
 
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
})

