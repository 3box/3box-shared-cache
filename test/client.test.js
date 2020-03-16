const levelup = require('levelup')
const { createClient } = require('../src')

describe("Shared cache module", () => {
  describe("Client", () => {
    let Client, db
    let postMessageMock = jest.fn()

    beforeAll(
      () => {
        Client = createClient({ postMessage: postMessageMock })
        db = levelup(new Client('./mydb'))
      }
    )
    
    it("get", (done) => {
      db.get('key', {}, (err) => {
        expect(postMessageMock).toHaveBeenCalled()
        done()
      })
    })  
  })
})

