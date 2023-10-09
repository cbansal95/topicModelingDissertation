const sqlite3 = require("sqlite3")
async function openDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database("database.db", (err) => {
      if (err) {
        reject(err)
      } else {
        resolve(db)
      }
    })
  })
}

async function updateUser(db, token) {
  return new Promise((resolve, reject) => {
    let data = [token]
    let sql = `UPDATE user
            SET access_token = ?
            WHERE id = 1`
    db.all(sql, data, (error, rows) => {
      if (error) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

async function closeConnection(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        console.log(err)
        reject(err)
      }
      resolve()
    })
  })
}

async function getAccessToken(db) {
  return new Promise((resolve, reject) => {
    let data = [1]
    let sql = `SELECT access_token
                FROM user
                WHERE id = ?`
    db.all(sql, data, (error, rows) => {
      if (error) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}
async function insertPostToDB(db, post, subreddit) {
  return new Promise((resolve, reject) => {
    let data = [post.id, post.subreddit, post.title, post.created, post.selftext]
    let sql = `INSERT OR REPLACE INTO reddit_post (post_id, subreddit, title, created, selftext) VALUES (?,?,?,?,?)`
    db.all(sql, data, (error, rows) => {
      if (error) {
        reject(error)
      } else {
        resolve(rows)
      }
    })
  })
}

async function readPostFromDB(db) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM reddit_post WHERE tag is NULL LIMIT 100`
        db.all(sql, (error, rows) => {
            if (error) {
                reject(error)
            } else {
                resolve(rows)
            }
        })
    })
}

async function readPostFromDB2(db) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT * FROM reddit_post WHERE selftext_summary is NULL LIMIT 1`
        db.all(sql, (error, rows) => {
            if (error) {
                reject(error)
            } else {
                resolve(rows)
            }
        })
    })
}

async function updateFunctionWithTag(db,post_id,tag) {
    return new Promise((resolve, reject) => {
        let data = [tag,post_id]
        let sql = `UPDATE reddit_post
        SET tag = ?
        WHERE post_id = ?;`
        db.all(sql, data, (error, rows) => {
          if (error) {
            reject(error)
          } else {
            console.log('Row updated')
            resolve(rows)
          }
        })
      })
}

async function updateSelftextSummmary(db,post_id,summary) {
    return new Promise((resolve, reject) => {
        let data = [summary,post_id]
        let sql = `UPDATE reddit_post
        SET selftext_summary = ?
        WHERE post_id = ?;`
        db.all(sql, data, (error, rows) => {
          if (error) {
            reject(error)
          } else {
            console.log('Row updated')
            resolve(rows)
          }
        })
      })
}
module.exports = {
  openDb,
  updateUser,
  closeConnection,
  getAccessToken,
  insertPostToDB,
  readPostFromDB,
  readPostFromDB2,
  updateFunctionWithTag,
  updateSelftextSummmary
}
