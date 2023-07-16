const {openDb,getAccessToken,closeConnection} = require('./db_queries')

async () => {
    const db = await openDb()
    const token = await getAccessToken()
    console.log(token)
    await closeConnection(db)
}