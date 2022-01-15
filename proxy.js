const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const fetch = require('node-fetch')
const cors = require('cors')
const app = express()
app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(cors())
const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

app.use('/potato/*', (req, res) => {
  console.log('request', req.method)
})

app.use('/api/*', async (req, res) => {
  let response;

  if (req.method === "GET") {
    response = await fetch('https://' + req.originalUrl.substring(5), {
      headers: {
        authorization: req.headers.authorization
      },
      method: req.method,
      mode: "cors"
    })
  }
  else {
    response = await fetch('https://' + req.originalUrl.substring(5), {
      "credentials": "omit",
      headers: {
        authorization: req.headers.authorization,
      },
      body: typeof req.body == 'object' ? JSON.stringify(req.body) : req.body,
      method: req.method,
      mode: "cors"
    })
  }


  res.setHeader('content-type', response.headers.get('content-type'))
  res.setHeader('Access-Control-Allow-Origin', '*')
  response.body.pipe(res)
})

app.listen(8080)
