#!/bin/bash

# Manual Cloud Run Deployment Script
# Use this for local deployments when you need to deploy manually
# For automated deployments, use GitHub Actions (push to main)

set -e

# Configuration
PROJECT_ID="twinspire-neural-solutions"
SERVICE_NAME="tns-backend"
REGION="europe-north2"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying TNS Backend to Cloud Run..."

# Authenticate with gcloud
echo "🔐 Checking authentication..."
gcloud auth configure-docker

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

echo "⬆️ Pushing image to Google Container Registry..."
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run (update-only, keeps existing env vars)
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --project $PROJECT_ID

echo "✅ Deployment complete!"
echo "🌐 Your service URL:"
gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)' --project $PROJECT_ID
