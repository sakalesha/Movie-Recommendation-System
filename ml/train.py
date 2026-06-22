import numpy as np
import pandas as pd
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.naive_bayes import MultinomialNB
from nltk.corpus import stopwords
import os
import pickle

def train_models():
    print("Starting ML Model Training...")
    
    # Setup directories
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(BASE_DIR, 'data')
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Train Movie Recommendation (Cosine Similarity)
    print("Training Movie Recommendation Model...")
    movies_data_path = os.path.join(DATA_DIR, 'movies.csv')
    movies_data = pd.read_csv(movies_data_path)
    
    selected_features = ['genres', 'keywords', 'tagline', 'cast', 'director']
    for feature in selected_features:
        movies_data[feature] = movies_data[feature].fillna('')
        
    combined_features = movies_data['genres'] + ' ' + movies_data['keywords'] + ' ' + movies_data['tagline'] + ' ' + movies_data['cast'] + ' ' + movies_data['director']
    
    rec_vectorizer = TfidfVectorizer()
    feature_vectors = rec_vectorizer.fit_transform(combined_features)
    similarity = cosine_similarity(feature_vectors)
    
    similarity_path = os.path.join(MODELS_DIR, 'similarity.pkl')
    with open(similarity_path, 'wb') as f:
        pickle.dump(similarity, f)
    print(f"Saved {similarity_path}")

    # 2. Train Sentiment Analysis Model
    print("Training Sentiment Analysis Model...")
    nltk.download("stopwords")
    reviews_data_path = os.path.join(DATA_DIR, 'reviews.txt')
    dataset = pd.read_csv(reviews_data_path, sep='\t', names=['Reviews', 'Comments'])
    
    stopset = stopwords.words('english')
    sentiment_vectorizer = TfidfVectorizer(use_idf=True, lowercase=True, strip_accents='ascii', stop_words=stopset)
    
    X = sentiment_vectorizer.fit_transform(dataset.Comments)
    y = dataset.Reviews
    
    # Train Naive Bayes model (as the best model from previous tests)
    model = MultinomialNB()
    model.fit(X, y)
    
    # Save the vectorizer as 'tranform.pkl' to match ml_api.py typo
    transform_path = os.path.join(MODELS_DIR, 'tranform.pkl')
    with open(transform_path, 'wb') as f:
        pickle.dump(sentiment_vectorizer, f)
    print(f"Saved {transform_path}")
        
    # Save the model
    best_model_path = os.path.join(MODELS_DIR, 'best_model.pkl')
    with open(best_model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"Saved {best_model_path}")
    
    print("All models trained and saved successfully!")

if __name__ == '__main__':
    train_models()
