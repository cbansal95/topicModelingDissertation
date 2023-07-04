const axios = require("axios")
const qs = require("qs")
require('dotenv').config()

async function redditCallback(code, state) {
  let data =qs.stringify({
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
      Authorization:
        `Basic ${btoa(process.env.REDDIT_CLIENT_ID + ':' + process.env.REDDIT_SECRET)}`,
    },
    data: data,
  }
  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data))
      console.log(Object.keys(response.data))
      console
      return response.data.access_token
    })
    .catch((error) => {
      console.log(error.response.data)
    })
}

module.exports = {redditCallback}