# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Install Node.js
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set master work directory
WORKDIR /app

# ---- 1. Setup ML API (Python) ----
COPY ml/requirements.txt ./ml/
RUN pip install --no-cache-dir -r ml/requirements.txt
RUN python -c "import nltk; nltk.download('stopwords')"

# Copy ML files and run training script
COPY ml/ ./ml/
WORKDIR /app/ml
RUN python train.py
WORKDIR /app

# ---- 2. Setup Backend (Node.js) ----
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy Backend files
COPY backend/ ./
WORKDIR /app

# ---- 3. Setup Startup Script ----
COPY start.sh .
RUN chmod +x start.sh

# Render dynamically sets $PORT for the public web server
EXPOSE 5000

# Execute the startup script
CMD ["./start.sh"]
