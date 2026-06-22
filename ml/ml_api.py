from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import pickle
import os
import nltk

app = FastAPI()

# Make sure nltk stopwords are available
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Load the models and data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, 'models')
DATA_DIR = os.path.join(BASE_DIR, 'data')

# Load similarity matrix
try:
    with open(os.path.join(MODELS_DIR, 'similarity.pkl'), 'rb') as f:
        similarity = pickle.load(f)
except Exception as e:
    print(f"Error loading similarity.pkl: {e}")
    similarity = None

# Load movies dataset to map ID to index
try:
    movies_data = pd.read_csv(os.path.join(DATA_DIR, 'movies.csv'))
except Exception as e:
    print(f"Error loading movies.csv: {e}")
    movies_data = None

# Load Sentiment Models
try:
    with open(os.path.join(MODELS_DIR, 'tranform.pkl'), 'rb') as f:
        vectorizer = pickle.load(f)
    with open(os.path.join(MODELS_DIR, 'best_model.pkl'), 'rb') as f:
        sentiment_model = pickle.load(f)
except Exception as e:
    print(f"Error loading sentiment models: {e}")
    vectorizer = None
    sentiment_model = None


class SentimentRequest(BaseModel):
    text: str


@app.get("/recommend")
def get_recommendations(movie_id: int):
    if similarity is None or movies_data is None:
        raise HTTPException(status_code=500, detail="Recommendation models not loaded.")

    # Find the index of the movie with the given ID
    matching_movies = movies_data[movies_data['id'] == movie_id]
    if len(matching_movies) == 0:
        raise HTTPException(status_code=404, detail=f"Movie with ID {movie_id} not found.")
    
    # Get the index (the DataFrame row index matching the similarity matrix)
    movie_idx = matching_movies.index[0]
    
    # Get similarity scores for this movie
    similarity_scores = list(enumerate(similarity[movie_idx]))
    
    # Sort the movies based on the similarity scores
    sorted_similar_movies = sorted(similarity_scores, key=lambda x: x[1], reverse=True)
    
    # Get the top 10 recommended movie IDs (skip the first one as it is the movie itself)
    # The frontend usually requests up to 20 or so. Let's return top 20.
    recommended_ids = []
    # i=0 is the movie itself, so start from 1
    for movie in sorted_similar_movies[1:21]:
        idx = movie[0]
        # Get the ID from movies_data
        rec_id = int(movies_data.iloc[idx]['id'])
        recommended_ids.append(rec_id)

    return {"recommendations": recommended_ids}


@app.post("/predict-sentiment")
def predict_sentiment(request: SentimentRequest):
    if vectorizer is None or sentiment_model is None:
        raise HTTPException(status_code=500, detail="Sentiment models not loaded.")
    
    # Vectorize the text
    X_test = vectorizer.transform([request.text])
    
    # Predict
    prediction = sentiment_model.predict(X_test)[0]
    
    # Returning boolean true/false based on prediction
    # Assuming 1 is positive and 0 is negative
    return {"sentiment": bool(prediction == 1)}
