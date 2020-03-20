const SharedCache = require('../src/client')
const Storage = require('orbit-db-storage-adapter')
const Cache = require('orbit-db-cache')
const OrbitDB = require('orbit-db')
const IPFS = require('ipfs')

function openIframe() {
  const iframe = document.createElement('iframe')
  iframe.src = IFRAME_RPC_SERVER_URL
  iframe.style = 'width:0; height:0; border:0; border:none !important'

  document.body.appendChild(iframe)
}

function getIframePostMessage() {
  const iframe = document
    .querySelector('iframe')
    
  return iframe
    .contentWindow
    .postMessage
    .bind(iframe.contentWindow) 
}

async function runClient() {
  const ClientStore = SharedCache.createClient({
    postMessage: getIframePostMessage()
  })

  const cachePath = './orbitdb/cache'

  const storage = Storage(
    (...args) => new ClientStore(...args),
    {}
  )
  const cacheStorage = await storage.createStore(cachePath)
  const cache = new Cache(cacheStorage)
  
  ipfs = await IPFS.create()

  orbitdb = await OrbitDB.createInstance(ipfs, { cache })
  
  db = await orbitDb.log('news')

  await db.add('first')
  await db.add('second')
  await db.add('third')
  await db.add('fourth')
}

openIframe()
runClient()
