const axios = require("axios")
async function getSubredditPosts(subreddit="news", token) {
  return new Promise((resolve, reject) => {
    let config = {
      method: "get",
      url: `https://oauth.reddit.com/r/${subreddit}/new?limit=100`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
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