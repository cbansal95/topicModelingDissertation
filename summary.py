import sqlite3
#extracting and preparing text from db
con = sqlite3.connect("database.db")
cur = con.cursor()
postsReq = cur.execute("SELECT * from reddit_post")
postsRaw=postsReq.fetchall()
