const { EventEmitter } = require('events')
const { expose } = require('postmsg-rpc')

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

const getServerOpts = () => ({
  postMessage: window.postMessage,
  addListener: iframe.addListener,
})

const getClientOpts = () => ({
  postMessage: iframe.postMessage,
  addListener: window.addListener,
})

const startRpcServer = (opts) => {
  const serverOpts = getServerOpts()

  expose('open', (options) => {
    return opts.db = {}
  }, serverOpts)

  expose('close', () => {
    return opts.db = {}
  }, serverOpts)

  expose('get', (key, options) => {
    return opts.db[key]
  }, serverOpts)
  
  expose('put', (key, value, options) => {
    opts.db[key] = value
    return opts.db[key]
  }, serverOpts)

  expose('del', (key, options) => {
    delete opts.db[key]
  }, serverOpts)
}

module.exports = {
  window,
  iframe,
  getServerOpts,
  getClientOpts,
  startRpcServer,
}
