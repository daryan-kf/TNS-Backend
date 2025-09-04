import {BigQuery} from "@google-cloud/bigquery";

export const bq = new BigQuery({
  location: process.env.BIGQUERY_LOCATION,
  // ADC will automatically use the credentials from `gcloud auth application-default login`
});

export const BQ = {
  projectId:
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT,
  sports: {
    dataset: process.env.BQ_DATASET_SPORTS,
    playerTraining: process.env.BQ_TBL_PLAYER_TRAINING_SESSIONS,
    training: process.env.BQ_TBL_TRAINING_SESSIONS,
    timeseries: process.env.BQ_TBL_PLAYER_TIMESERIES,
  },
  location: process.env.BIGQUERY_LOCATION,
};

// Helper: fully-qualified table id (omit project if not set)
export const fq = (dataset: string, table: string) =>
  BQ.projectId
    ? `\`${BQ.projectId}.${dataset}.${table}\``
    : `\`${dataset}.${table}\``;
