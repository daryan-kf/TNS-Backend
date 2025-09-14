import winston from "winston";
import {env, isProduction} from "@/src/config/environment";

// Custom format to avoid logging sensitive data
const sanitizeFormat = winston.format(info => {
  // Remove sensitive fields from logs
  const sensitiveFields = [
    "password",
    "token",
    "authorization",
    "cookie",
    "key",
    "secret",
  ];

  if (info.meta && typeof info.meta === "object") {
    sensitiveFields.forEach(field => {
      if (info.meta && typeof info.meta === "object" && field in info.meta) {
        (info.meta as any)[field] = "[REDACTED]";
      }
    });
  }

  return info;
});

// Create logger instance
export const logger = winston.createLogger({
  level: isProduction() ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    sanitizeFormat(),
    winston.format.errors({stack: true}),
    winston.format.json()
  ),
  defaultMeta: {
    service: "tns-backend",
    version: "1.0.0",
    environment: env.NODE_ENV,
  },
  transports: [
    // Write to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

// Add file logging in production
if (isProduction()) {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    })
  );

  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
    })
  );
}

// Helper functions for common logging patterns
export const logRequest = (req: any) => {
  logger.info("HTTP Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
};

export const logError = (error: Error, context?: any) => {
  logger.error("Application Error", {
    message: error.message,
    stack: error.stack,
    context,
  });
};

export const logQuery = (query: string, duration?: number) => {
  logger.debug("Database Query", {
    query: query.substring(0, 200), // Truncate long queries
    duration: duration ? `${duration}ms` : undefined,
  });
};
