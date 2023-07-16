const express = require("express")
const axios = require("axios")
require("dotenv").config()
const bodyparser = require("body-parser")
const qs = require("qs")
const app = express()
const port = 3000
const path = require("path")
const { twitterCallback } = require("./twitter/auth/index")
const { redditCallback } = require("./reddit/auth/index")
const { getSubredditPosts } = require("./reddit/api/index")
const init = require("./init/index")
const sqlite3 = require("sqlite3")
// import { HuggingFace } from "@huggingface/inference"
var inference = require("@huggingface/inference")
const hf = new inference.HfInference(process.env.HF_TOKEN)
const {
  openDb,
  getAccessToken,
  closeConnection,
  insertPostToDB,
  readPostFromDB,
  readPostFromDB2,
  updateFunctionWithTag
} = require("./db_queries")
const labels= ['arts & culture','business & entrepreneurs','family & daily life','fashion & celebrity','film and music','fitness & health' ,'food & dining', 'news & social concern', 'science & technology', 'sports & gaming']
app.use(bodyparser.json())

app.get("/twitter/callback", async function (req, res) {
  let state = req.query.state
  let code = req.query.code
  // exchanging code for tokens
  await twitterCallback(code, state)
  res.sendStatus(200)
})

app.get("/reddit/callback", async function (req, res) {
  let state = req.query.state
  let code = req.query.code
  await redditCallback(code, state)
  res.sendStatus(200)
})

app.get("/sync", async function (req, res) {
  const db = await openDb()
  const row = await getAccessToken(db)
  let token = row[0].access_token
  console.log(token)
  const postsData = await getSubredditPosts("news", token)
  const posts = postsData.data.children
  posts.forEach(async (post) => {
    let postRow = {
      id: post.data.name,
      title: post.data.title,
      created: post.data.created_utc * 10,
      selftext: post.data.selftext,
    }
    await insertPostToDB(db, postRow)
  })
  // get
  await closeConnection(db)
})

app.get("/classify", async function (req, res) {
  const db = await openDb()
  const dbPosts = await readPostFromDB(db)
  dbPosts.forEach(async dbPost => {
    const output = await hf.zeroShotClassification({
      model: 'facebook/bart-large-mnli',
      inputs: dbPost.title,
      parameters: { candidate_labels: labels }
    })
    await updateFunctionWithTag(db, dbPost.post_id,output[0].labels[0])
  });
  //await closeConnection(db)
})

app.get("/summarize_post", async function (req,res) {
  const db = await openDb()
  const dbPosts = await readPostFromDB2(db)
  dbPosts.forEach(async dbPost => {
    const output = await hf.summarization({
      model: 'philschmid/bart-large-cnn-samsum',
      inputs: "About a year ago I met this woman in a bar, we had a few drinks and we ended up at her place. Things went well and after a few dates I decided to lay down what I wanted in a relationship. We discussed it and she wanted to have a kid, but I already had the pleasure of raising my daughter, and was unwilling to do it again. So we decided to break it off. I never told my daughter because it wasn't anything serious. Well, a month ago I got a call from my daughter telling me she went on an amazing date with a woman who she instantly connected with. I was happy for her, and wished her the best with future encounters. Well, after a few weeks and several dates, they decided to make it official. So my daughter changed her relationship status on FB and posted a picture of her and my ex. The wave of shock that rushed over me was to say the least, paralyzing. I didn't know what to do so I called my daughter and invited her over alone to talk.",
      parameters: {
        max_length: 100
      }
    })
    console.log(output)
    //await updateFunctionWithTag(db, dbPost.post_id,output[0].labels[0])
  });
})

app.listen(port, async () => {
  // Code.....
})
