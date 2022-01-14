const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const fetch = require('node-fetch')
const cors = require('cors')
const app = express()
app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(cors())

app.use('/*', async (req, res) => {
  let response;

  if (req.method === "GET") {
    response = await fetch(req.originalUrl.substring(1), {
      credentials: "include",
      headers: {
        authorization: req.headers.authorization
      },
      method: req.method,
      mode: "cors"
    })
  }
  else {
    response = await fetch(req.originalUrl.substring(1), {
      credentials: "include",
      headers: {
        authorization: req.headers.authorization
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

