const { createServer } = require("../src/index")

const serverOpts = {
  postMessage: (...args) => {
    console.log("posting to windpw")
    return window.parent.postMessage(...args)
  }
}

function runServer() {
  const server = createServer(serverOpts)
  server.init()
  server.start()
}

runServer()
