# 3box-shared-cache
"The shared cache module that 3box uses to share cache across domains using an iframe

# API

Client Store in a window
```
const levelup = require('levelup')
const { createClient } = require("3box-shared-cache")

const ClientStore = createClient({ postMessage: iframe.contentWindow.postMessage })

const db = levelup(ClientStore, opts)
```

Server running in an iframe
```
const { createServer } = require('3box-shared-cache')

const server = createServer({ postMessage: window.parent.postMessage })
// server.init()
// server.start()
// server.stop()
```

