
async function init(redditAccessToken){
    console.log(redditAccessToken)
    if(redditAccessToken) {
        //fetch reddit posts from the last checkpoint
    }
    else {
        console.log('reddit auth initiate')
    }
}
module.exports = init