
import sqlite3
import sys
from flask import Flask, jsonify
from transformers import pipeline

sys.path.insert(0, r"c:\\users\\asusa\\appdata\\roaming\\python\\python311\\site-packages")

#extracting and preparing text from db
con = sqlite3.connect("database.db")
cur = con.cursor()
postsReq = cur.execute("SELECT * from reddit_post")
postsRaw=postsReq.fetchall()
data = []
for x in postsRaw:
    data.append(x[2] + '\n' + x[5])
from bertopic import BERTopic
from bertopic.representation import KeyBERTInspired

representation_model = KeyBERTInspired()

topic_model = BERTopic(language="english", calculate_probabilities=True, verbose=True,representation_model=representation_model)
topics, probs = topic_model.fit_transform(data)
output = topic_model.get_document_info(data)
#print(topic_model.topic_labels_)


app = Flask(__name__)

@app.route('/topics', methods=['GET'])
def get_topics():
    return jsonify(topic_model.topic_labels_)

@app.route('/content/<topic_id>', methods=['GET'])
def get_content(topic_id):
    return output[output["Topic"] == int(topic_id)].to_json()

@app.route('/search/<search_term>', methods=['GET'])
def get_search_res(search_term):
    similarTopics, similarity = topic_model.find_topics(search_term)
    return output[output["Topic"] == similarTopics[0]].to_json()

@app.route('/api', methods=['GET'])
def get_api():
    return jsonify({'message': 'Hello, World!'})

@app.route('/summarize/<topic_id>', methods=['GET'])
def create_summary(topic_id):
    prompt = "Summarize the discussion in these posts. Include all possible details: \n"
    postsRaw = output[output["Topic"] == int(topic_id)]['Document'].tolist()
    for x in postsRaw:
        prompt+='Post: ' + x
        prompt+='\n\n'
    generator = pipeline('summarization', model='philschmid/bart-large-cnn-samsum')
    summary = generator(prompt)
    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True)