import {BigQuery} from "@google-cloud/bigquery";
import {env} from "./environment";
import {logger} from "@/src/utils/logger";

// Initialize BigQuery client with error handling
export const bq = new BigQuery({
  projectId: env.BIGQUERY_PROJECT_ID,
  location: env.BIGQUERY_LOCATION,
  // ADC will automatically use the credentials from `gcloud auth application-default login`
});

// Configuration object with validation
export const BQ = {
  projectId: env.BIGQUERY_PROJECT_ID,
  sports: {
    dataset: env.BQ_DATASET_SPORTS,
    playerTraining: env.BQ_TBL_PLAYER_TRAINING_SESSIONS,
    training: env.BQ_TBL_TRAINING_SESSIONS,
    timeseries: env.BQ_TBL_PLAYER_TIMESERIES,
  },
  location: env.BIGQUERY_LOCATION,
};

// Helper: fully-qualified table id with proper escaping
export const fq = (dataset: string, table: string): string => {
  if (!dataset || !table) {
    throw new Error(`Invalid dataset (${dataset}) or table (${table}) name`);
  }

  return BQ.projectId
    ? `\`${BQ.projectId}.${dataset}.${table}\``
    : `\`${dataset}.${table}\``;
};

// Helper: Create a safe query job with default options
export const createSafeQueryJob = async (sql: string, params: any = {}) => {
  const queryOptions = {
    query: sql,
    params,
    location: BQ.location,
    useLegacySql: false,
    maximumBytesBilled: "5368709120", // 5 GiB limit to prevent expensive queries
    jobTimeoutMs: 30000, // 30 second timeout
    dryRun: false, // Set to true for query validation without execution
  };

  try {
    logger.info("Executing BigQuery", {
      query: sql.substring(0, 200), // Log first 200 chars only
      hasParams: Object.keys(params).length > 0,
      location: BQ.location,
    });

    const [job] = await bq.createQueryJob(queryOptions);
    const [rows] = await job.getQueryResults();

    logger.info("BigQuery completed", {
      rowCount: rows.length,
      jobId: job.id,
    });

    return rows;
  } catch (error: any) {
    logger.error("BigQuery error", {
      error: error.message,
      code: error.code,
      query: sql.substring(0, 200),
    });
    throw error;
  }
};

// Helper: Validate BigQuery connection on startup
export const validateBigQueryConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test connection
    const testQuery = `SELECT 1 as test_connection`;
    await createSafeQueryJob(testQuery);
    logger.info("BigQuery connection validated successfully");
    return true;
  } catch (error: any) {
    logger.error("BigQuery connection failed", {error: error.message});
    return false;
  }
};
