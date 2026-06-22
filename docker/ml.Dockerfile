# Use official Python lightweight image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY ml/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data needed during training and runtime
RUN python -c "import nltk; nltk.download('stopwords')"

# Copy the ml folder
COPY ml/ ./ml/

# Navigate to the ml directory
WORKDIR /app/ml

# Run the training script to generate models dynamically during Docker build!
RUN python train.py

# Expose the port (Render provides $PORT dynamically, but FastAPI needs to know what port to bind to. We'll handle this in CMD)
ENV PORT=10000
EXPOSE 10000

# Start the FastAPI app using Uvicorn
CMD uvicorn ml_api:app --host 0.0.0.0 --port $PORT
