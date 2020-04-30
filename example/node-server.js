const express = require('express')
const serveStatic = require('serve-static')
const path = require('path')
const port = process.env.PORT || 30000
const indexFile = process.env.INDEX_FILE

const app = express()
app.use(serveStatic(path.join(__dirname), {'index': [indexFile]}))
// This allows the dist/3Box.js relative path to be resolved
app.use(serveStatic(path.join(__dirname, '../')))
app.listen(port, () => {
  console.log(`Open http://localhost:${port} in a browser to start using the example`)
})
