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
  let cursor = ''
  let subreddit = ''
  for (let i=0; i< 10; i++) {
    const postsData = await getSubredditPosts(subreddit, token, cursor)
    const posts = postsData.data.children
    cursor = postsData.data.after
    if (cursor){
      let postReqs = []
      posts.forEach(async (post) => {
        let postRow = {
          id: post.data.name,
          title: post.data.title,
          created: post.data.created_utc * 10,
          selftext: post.data.selftext,
        }
        postReqs.push(insertPostToDB(db, postRow, subreddit))
      })
      await Promise.all(postReqs)
    } else {
      break;
    }

  }
  console.log("Finished pulling reddit posts")
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
  console.log('summarize')
  const dbPosts = await readPostFromDB2(db)
  dbPosts.forEach(async dbPost => {
    //Summarize the discussion in these posts. Include all possible details
    text = `Summarize the discussion in these posts. Include all possible details and important events.
    "Harry Potter: Glesga
    Somewhere in the toon looking something out of Harry Potter. Was doing a cleaning job here a few months ago and just found the photo on my phone. Sure I saw that fat prick Hagrid cutting about."
    "KISS today, who’s painting faces?
    Kiss are playing in the hydro tonight , I’m looking to get my face painted
    Anyone know if there will be folk painting faces anywhere today at all?
    Cheers"
    "Looking for this St Mungo collage/artwork
    Wondering if anybody can help me find a copy of this, I saw it in the Lancefield St antiques centre on a visit in November but didn’t buy it then. I revisited the centre in its new location up the road last month but couldn’t find it anywhere this time :( Not sure if it’s a print from a book or a one-off collage by somebody. Does anyone know who it’s by or where I could find the image? Can’t find anything on Google. Thanks!"
    "Why why why why why
    Someone has done something good to an otherwise empty grey wall. It cost time, money and talent to paint that and enhanced the local area.
    
     Some wee tadjer has then spray painted fucking gibberish over it. Why?! What do you gain from ruining art? hope the cunt that did it drowns in a sewer"
    "Butchers Aprons
    Why is Whiteinch suddenly been draped in Butchers Aprons?"
    "Glasgow’s cuts will hamper its museums for years to come
    [https://www.apollo-magazine.com/glasgow-council-culture-cuts-burrell-unison/](https://www.apollo-magazine.com/glasgow-council-culture-cuts-burrell-unison/)
    
    Bad news for Glasgow's art scene, right?"
    "Seeking Glasgow-Based Graffiti Artist for a Research Project
    Dear redditors, a friend of mine is currently engaged in a research project for UoFG focused on the graffiti art scene in the vibrant city of Glasgow. Personally I do not know much about it besides latest Banksy exhibition but I thought asking here might help.
    
    If you're an artist in this sphere or know someone who is, I'd be grateful if you could reach out to me I could connect you two to just ask few questions regarding their view on this art in Glasgow. Please note that anonymity will be maintained.
    
    Thanks so much for your help with this!"
    "Where have these pictures been taken?
    These are from a photographer called Raymond Depardon. Pictures are from 1980 but I cannot remember anything like that staring today. Do you know if these locations still exist?"
    "Paintball
    Work are looking at arranging paintballing - I see there’s two nearby; Delta Force near Paisley, and Bedlam near C’nauld
    
    It would be great to hear some good or bad experiences, at either, from the sub"
    "Another Glasgow Cyanotype postcard I made.
    "
    "Street Art in Maryhill
    "
    "Missing artwork
    Have you seen this painting? Maybe you live in woodlands or the west end and it’s hanging in your flat? Please reply with details! I am on the hunt for it. Cash reward."
    "Fitting mural spotted on my first ever visit to Yoker today
    "
    "Cyanotype Blueprint of the Glasgow School of Art, from a Charles Rennie Mackintosh drawing.
    "`
    const output = await hf.summarization({
      model: 'philschmid/bart-large-cnn-samsum',
      inputs: text,
      parameters: {
        max_length: 100
      }
    })
    res.send(output)
    console.log(output)
    //await updateFunctionWithTag(db, dbPost.post_id,output[0].labels[0])
  });
})

app.listen(port, async () => {
  // Code.....
})
