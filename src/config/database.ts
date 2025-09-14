import {env} from "./environment";
import {logger} from "@/src/utils/logger";

// Database health check function
export const checkDatabaseHealth = async () => {
  const health = {
    bigquery: false,
  };

  // Check BigQuery connection
  try {
    const {validateBigQueryConnection} = await import("./bigquery");
    health.bigquery = await validateBigQueryConnection();
  } catch (error) {
    logger.error("BigQuery health check failed", {error});
    health.bigquery = false;
  }

  return health;
};

// Initialize database connections
export const initializeDatabases = async () => {
  logger.info("Initializing database connections...");

  const health = await checkDatabaseHealth();

  if (health.bigquery) {
    logger.info("✅ BigQuery connection established");
  } else {
    logger.warn("⚠️  BigQuery connection failed");
  }

  return health;
};
