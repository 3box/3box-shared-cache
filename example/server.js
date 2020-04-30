const { createServer } = require("../src")

const serverOpts = {
  postMessage: (...args) => {
    return window.parent.postMessage(...args)
  }
}

function runServer() {
  const server = createServer(serverOpts)
  server.init()
  server.start()
}

runServer()
