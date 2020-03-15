const createServer = ({ postMessage }) => {
  const databases = {}

  const init = () => {
    databases.orbit = {}
    databases.ipfsBlockstore = {}
  }

  const start = () => {}

  const stop = () => {}

  return {
    init,
    start,
    stop
  }
}

module.exports = { createServer }
