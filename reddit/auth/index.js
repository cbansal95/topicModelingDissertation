const axios = require("axios")
const qs = require("qs")
const sqlite3 = require("sqlite3")
require("dotenv").config()
const { openDb, updateUser, closeConnection } = require("../../db_queries")

async function redditCallback(code, state) {
  let data = qs.stringify({
    code: code,
    grant_type: "authorization_code",
    redirect_uri: process.env.REDDIT_CALLBACK_URL,
    state: state,
  })
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://www.reddit.com/api/v1/access_token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        process.env.REDDIT_CLIENT_ID + ":" + process.env.REDDIT_SECRET
      )}`,
    },
    data: data,
  }
  axios
    .request(config)
    .then(async (response) => {
      const db = await openDb()
      let test = await updateUser(db, response.data.access_token)
      await closeConnection(db)
    })
    .catch((error) => {
      console.log(error.response.data)
      //console.log(error.response.data || error)
    })
}

module.exports = { redditCallback }
