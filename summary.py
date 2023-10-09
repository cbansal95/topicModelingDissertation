import sqlite3
import BERTopic from bertopic
#extracting and preparing text from db
con = sqlite3.connect("database.db")
cur = con.cursor()
postsReq = cur.execute("SELECT * from reddit_post")
postsRaw=postsReq.fetchall()

from sentence_transformers import SentenceTransformer

sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
topic_model = bertopic(embedding_model=sentence_model)

from umap import UMAP

umap_model = UMAP(n_neighbors=15, n_components=5, min_dist=0.0, metric='cosine')
topic_model = BERTopic(umap_model=umap_model)

from hdbscan import HDBSCAN

hdbscan_model = HDBSCAN(min_cluster_size=15, metric='euclidean', cluster_selection_method='eom', prediction_data=True)

from sklearn.cluster import KMeans

cluster_model = KMeans(n_clusters=50)

from sklearn.feature_extraction.text import CountVectorizer

vectorizer_model = CountVectorizer(ngram_range=(1, 3), stop_words="english", min_df=10)