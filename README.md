# 🚀 TNS Backend - AI Ask API

## Quick Deploy to Cloud Run

### **Option 1: Automated (GitHub Actions)**

**1. Setup GitHub Secret:**

- Go to: `https://github.com/your-username/your-repo/settings/secrets/actions`
- Add secret: `GCP_SA_KEY` with your service account JSON

**2. Deploy:**

```bash
git push origin main
```

**3. Done!**

- GitHub Actions automatically builds and deploys to Cloud Run
- Check the Actions tab for deployment URL

### **Option 2: Manual Deploy**

```bash
# Run the deployment script
./deploy.sh
```

## 🎯 API Endpoints

### **AI Ask (Main Endpoint)**

```bash
curl -X POST https://your-cloud-run-url/ask \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, how are you?", "maxOutputTokens": 100}'
```

### **Health Check**

```bash
curl https://your-cloud-run-url/ask/health
```

## 🔧 Environment Variables

**Required Environment Variables:**

- `NODE_ENV=production`
- `GOOGLE_API_KEY` (from Secret Manager)
- `VERTEX_PROJECT_ID=twinspire-neural-solutions`
- `VERTEX_LOCATION=us-central1`
- `BIGQUERY_PROJECT_ID=twinspire-neural-solutions`
- `BQ_DATASET_SPORTS=sports`
- `BQ_TBL_PLAYER_TRAINING_SESSIONS=player_training_sessions`
- `BQ_TBL_TRAINING_SESSIONS=training_sessions`
- `BQ_TBL_PLAYER_TIMESERIES=player_timeseries_1s`

**Security Variables:**

- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX_REQUESTS=1000`
- `ALLOWED_ORIGINS=https://your-domain.com`

## 📝 Adding New Environment Variables

**Via GitHub Actions (Recommended):**

1. Edit `.github/workflows/deploy.yml`
2. Add `--set-env-vars "NEW_VAR=value"` to the deploy command
3. Push to main branch

**Via Manual Deploy:**

1. Edit `deploy.sh`
2. Add `--set-env-vars "NEW_VAR=value"` to the gcloud command
3. Run `./deploy.sh`

**Via Cloud Console:**

1. Go to Cloud Run → Your Service → Edit
2. Add environment variables in the Variables tab
3. Deploy
