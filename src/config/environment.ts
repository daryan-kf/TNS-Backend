import {z} from "zod";

// Environment schema for validation
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),

  // BigQuery Configuration
  BIGQUERY_PROJECT_ID: z.string().optional(),
  BIGQUERY_LOCATION: z.string().default("US"),
  BQ_DATASET_SPORTS: z.string().min(1, "Sports dataset name is required"),
  BQ_TBL_PLAYER_TRAINING_SESSIONS: z
    .string()
    .min(1, "Player training sessions table is required"),
  BQ_TBL_TRAINING_SESSIONS: z
    .string()
    .min(1, "Training sessions table is required"),
  BQ_TBL_PLAYER_TIMESERIES: z
    .string()
    .min(1, "Player timeseries table is required"),

  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:5173,*"),
});

// Validate environment variables on startup
export const env = envSchema.parse(process.env);

// Export typed environment
export type Environment = z.infer<typeof envSchema>;

// Helper function to check if we're in production
export const isProduction = () => env.NODE_ENV === "production";
export const isDevelopment = () => env.NODE_ENV === "development";
