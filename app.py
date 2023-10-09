
import sqlite3
import sys
from flask import Flask, jsonify
from transformers import pipeline
import json

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
from sklearn.feature_extraction.text import CountVectorizer
from bertopic.vectorizers import ClassTfidfTransformer
from sklearn.cluster import KMeans
from bertopic.representation import MaximalMarginalRelevance
from umap import UMAP
from hdbscan import HDBSCAN

representation_model = KeyBERTInspired()
ctfidf_model = ClassTfidfTransformer(reduce_frequent_words=True)
vectorizer_model = CountVectorizer(stop_words="english")
hdbscan_model = HDBSCAN(min_cluster_size=10,min_samples=1, metric='euclidean', prediction_data=False)
cluster_model = KMeans(n_clusters=20)
umap_model = UMAP(n_neighbors=10, n_components=5, min_dist=0, metric='cosine', random_state=42)
topic_model = BERTopic(umap_model=umap_model,hdbscan_model=cluster_model,vectorizer_model=vectorizer_model,ctfidf_model=ctfidf_model, representation_model=representation_model)
topics, probs = topic_model.fit_transform(data)
output = topic_model.get_document_info(data)
#print(topic_model.topic_labels_)


app = Flask(__name__)

@app.route('/topics', methods=['GET'])
def get_topics():
    return jsonify(topic_model.topic_labels_)

@app.route('/content/<topic_id>', methods=['GET'])
def get_content(topic_id):
    content_data = json.loads(output[output["Topic"] == int(topic_id)].to_json())
    out = {
        'Terms': content_data['Representation'][list(content_data['Representation'].keys())[0]],
        'Documents': content_data['Document']
    }
    return out

@app.route('/search/<search_term>', methods=['GET'])
def get_search_res(search_term):
    similarTopics, similarity = topic_model.find_topics(search_term)
    content_data = json.loads(output[output["Topic"] == similarTopics[0]].to_json())
    out = {
    'Topic': content_data['Name'][list(content_data['Name'].keys())[0]],
    'Terms': content_data['Representation'][list(content_data['Representation'].keys())[0]],
    'Documents': content_data['Document']
    }
    return out

@app.route('/set_topics/<topic_number>', methods=['GET'])
def reduce_topics(topic_number):
    topic_model.reduce_topics(data, nr_topics=int(topic_number))
    return jsonify({'message': 'Topics reduced!'})


@app.route('/api', methods=['GET'])
def get_api():
    return jsonify({'message': 'Hello, World!'})

@app.route('/merge_topics/<topic_ids>', methods=['GET'])
def merge_topics(topic_ids):
    temp_ids = topic_ids.split("_")
    res = [eval(i) for i in temp_ids]
    topic_model.merge_topics(data,res)
    return jsonify({'message': 'Topics merged!'})

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