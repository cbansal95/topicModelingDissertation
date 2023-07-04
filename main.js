const express = require("express")
const axios = require("axios")
require('dotenv').config()
const bodyparser = require("body-parser")
const qs = require("qs")
const app = express()
const port = 3000
const path = require("path")
const {twitterCallback} = require('./twitter/auth/index')
const {redditCallback} = require('./reddit/auth/index')
const init = require('./init/index')
app.use(bodyparser.json())
var redditAccessToken = ''

app.get("/twitter/callback", async function (req, res) {
  
  let state = req.query.state
  let code = req.query.code
  // exchanging code for tokens
  await twitterCallback(code, state)
  res.sendStatus(200)
})

app.get("/reddit/callback", async function (req,res) {
  let state = req.query.state
  let code = req.query.code
  redditAccessToken = await redditCallback(code, state)
  console.log("reddit token " + redditAccessToken)
  res.sendStatus(200)
})

// app.post("/reddit/callback", async function (req,res) {
//   console.log(req.data)
//   console.log(req.query)
//   console.log(Object.keys(req))
//   res.sendStatus(200)
// })
app.listen(port, () => {
  // Code.....
  init(redditAccessToken)
})
