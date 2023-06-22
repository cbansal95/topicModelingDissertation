const express = require("express")
const axios = require("axios")
require('dotenv').config()
const bodyparser = require("body-parser")
const qs = require("qs")
const app = express()
const port = 3000
const path = require("path")
const {twitterCallback} = require('./twitter/auth/index')
app.use(bodyparser.json())


app.get("/callback", async function (req, res) {
  res.send("ok")
  let state = req.query.state
  let code = req.query.code
  // exchanging code for tokens
  await twitterCallback(code, state)
})

app.listen(port, () => {
  // Code.....
})
