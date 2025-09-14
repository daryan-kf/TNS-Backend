import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

// Import configuration
import {env} from "@/src/config/environment";
import {logger} from "@/src/utils/logger";

// Import middleware
import {
  createRateLimit,
  corsOptions,
  requestSizeLimit,
  securityHeaders,
  requestLogger,
} from "@/src/middleware/security";
import {sanitizeInput, preventSQLInjection} from "@/src/middleware/validation";
import {errorHandler} from "@/src/middleware/errorHandler";

// Import routes
import playerRoutes from "@/src/routes/player";
import teamRoutes from "@/src/routes/team";

const app = express();

// Trust proxy (important for rate limiting and IP detection)
app.set("trust proxy", 1);

// Apply security middleware first
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for API
    crossOriginEmbedderPolicy: false,
  })
);

app.use(securityHeaders);
app.use(compression());
app.use(createRateLimit());
app.use(cors(corsOptions));

// Request parsing and size limiting
app.use(requestSizeLimit);
app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));

// Security and logging middleware
app.use(requestLogger);
app.use(sanitizeInput);
app.use(preventSQLInjection);

// Health check endpoint (no rate limiting)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
  });
});

// Main route
app.get("/", (req, res) => {
  logger.info("Home route accessed", {ip: req.ip});
  res.json({
    message: "TNS Backend API Running Securely! 🚀🔒",
    version: "1.0.0",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    security: {
      rateLimit: `${env.RATE_LIMIT_MAX_REQUESTS} requests per ${
        env.RATE_LIMIT_WINDOW_MS / 60000
      } minutes`,
      cors: "enabled",
      helmet: "enabled",
      validation: "enabled",
    },
  });
});

// API Routes
app.use("/players", playerRoutes);
app.use("/teams", teamRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
  logger.warn("Route not found", {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server for local development (not on Vercel)
if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    logger.info(`🚀 TNS Backend Server running securely on port ${env.PORT}`);
    logger.info(`🌐 Visit: http://localhost:${env.PORT}`);
    logger.info(
      `🔒 Security features: Rate limiting, CORS, Helmet, Input validation`
    );
    logger.info(`📊 Environment: ${env.NODE_ENV}`);
  });
}

// Graceful shutdown handling
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Export for Vercel
export default app;
