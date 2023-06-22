const axios = require("axios")
const qs = require("qs")
require('dotenv').config()

async function twitterCallback(code, state) {
  let data = qs.stringify({
    code: code,
    grant_type: "authorization_code",
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: process.env.TWITTER_CALLBACK_URL,
    code_verifier: state,
  })
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api.twitter.com/2/oauth2/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        `Basic ${btoa(process.env.TWITTER_CLIENT_ID + ':' + process.env.TWITTER_CLIENT_SECRET)}`,
    },
    data: data,
  }
  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data))
    })
    .catch((error) => {
      console.log(error.response.data)
    })
}

module.exports = {twitterCallback}