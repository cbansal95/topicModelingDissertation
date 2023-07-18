const axios = require("axios")
async function getSubredditPosts(subreddit="news", token, cursor="") {
  return new Promise((resolve, reject) => {
    let config = {
      method: "get",
      url: `https://oauth.reddit.com/r/${subreddit}/new?limit=100`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
    if (cursor) {
      config.params = {}
      config.params.after=cursor
    }
    axios
      .request(config)
      .then((response) => {
        //console.log(JSON.stringify(response.data))
        resolve(response.data)
      })
      .catch((error) => {
        console.log(error)
        reject(error)
      })
  })
}
module.exports = {getSubredditPosts}