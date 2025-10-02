import { z } from 'zod';

// Environment schema for validation
const envSchema = z.object({
  // Server Configuration
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  // BigQuery Configuration
  BIGQUERY_PROJECT_ID: z.string().optional(),
  BIGQUERY_LOCATION: z.string().default('US'),
  BQ_DATASET_SPORTS: z.string().min(1, 'Sports dataset name is required'),
  BQ_TBL_PLAYER_TRAINING_SESSIONS: z
    .string()
    .min(1, 'Player training sessions table is required'),
  BQ_TBL_TRAINING_SESSIONS: z
    .string()
    .min(1, 'Training sessions table is required'),
  BQ_TBL_PLAYER_TIMESERIES: z
    .string()
    .min(1, 'Player timeseries table is required'),

  // Vertex AI Configuration
  VERTEX_PROJECT_ID: z.string().min(1, 'Vertex AI project ID is required'),
  VERTEX_LOCATION: z.string().default('us-central1'),

  // Google Generative AI Configuration
  GOOGLE_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  // Security Configuration
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173,*'),
});

// Validate environment variables on startup
export const env = envSchema.parse(process.env as Record<string, string>);

// Export typed environment
export type Environment = z.infer<typeof envSchema>;

// Helper functions
export const isProduction = (): boolean => env.NODE_ENV === 'production';
export const isDevelopment = (): boolean => env.NODE_ENV === 'development';
export const isTest = (): boolean => env.NODE_ENV === 'test';

// GCP Configuration helpers
export const getGoogleAPIKey = (): string => {
  const apiKey = env.GOOGLE_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required'
    );
  }
  return apiKey;
};

export const getBigQueryConfig = () => ({
  projectId: env.BIGQUERY_PROJECT_ID,
  location: env.BIGQUERY_LOCATION,
});

export const getVertexAIConfig = () => ({
  projectId: env.VERTEX_PROJECT_ID,
  location: env.VERTEX_LOCATION,
});
