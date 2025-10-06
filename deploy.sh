#!/bin/bash

# Simple Cloud Run Deployment Script
# Make sure you have gcloud CLI installed and authenticated

set -e

# Configuration
PROJECT_ID="twinspire-neural-solutions"
SERVICE_NAME="tns-backend"
REGION="europe-north2"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying TNS Backend to Cloud Run..."

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "⬆️ Pushing image to Google Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "ALLOWED_ORIGINS=https://your-domain.com" \
  --set-env-vars "RATE_LIMIT_WINDOW_MS=900000" \
  --set-env-vars "RATE_LIMIT_MAX_REQUESTS=1000" \
  --set-env-vars "BQ_DATASET_SPORTS=sports" \
  --set-env-vars "BQ_TBL_PLAYER_TRAINING_SESSIONS=player_training_sessions" \
  --set-env-vars "BQ_TBL_TRAINING_SESSIONS=training_sessions" \
  --set-env-vars "BQ_TBL_PLAYER_TIMESERIES=player_timeseries_1s" \
  --set-env-vars "BIGQUERY_PROJECT_ID=$PROJECT_ID" \
  --set-env-vars "VERTEX_PROJECT_ID=$PROJECT_ID" \
  --set-env-vars "VERTEX_LOCATION=us-central1" \
  --set-secrets "GOOGLE_API_KEY=google-api-key:latest" \
  --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "🌐 Your service URL:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID



