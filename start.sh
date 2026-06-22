#!/bin/bash

echo "Starting Unified Container..."

# 1. Start the ML API (Python) in the background
echo "Starting Python ML API on internal port 8000..."
cd /app/ml
uvicorn ml_api:app --host 127.0.0.1 --port 8000 &
ML_PID=$!

# 2. Wait a moment to ensure it starts
sleep 3

# 3. Start the Backend (Node.js) in the foreground
echo "Starting Node.js Backend on port $PORT..."
cd /app/backend

# Inform the backend where the internal ML API is running
export ML_API_URL="http://127.0.0.1:8000"

npm start

# Wait for any process to exit
wait -n
  
# Exit with status of process that exited first
exit $?
