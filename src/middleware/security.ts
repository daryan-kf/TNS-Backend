import rateLimit from "express-rate-limit";
import {Request, Response, NextFunction} from "express";
import {env} from "@/src/config/environment";
import {logger} from "@/src/utils/logger";

// Rate limiting configuration
export const createRateLimit = () => {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
    max: env.RATE_LIMIT_MAX_REQUESTS, // Limit each IP to 100 requests per windowMs
    message: {
      error: "Too many requests from this IP, please try again later.",
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 60000), // Convert to minutes
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        url: req.url,
        userAgent: req.get("User-Agent"),
      });

      res.status(429).json({
        success: false,
        error: "Too many requests from this IP, please try again later.",
        retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 60000),
      });
    },
  });
};

// CORS configuration
export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map(o => o.trim());

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all origins if "*" is specified (for mobile apps in testing and production)
    if (allowedOrigins.includes("*")) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      callback(null, true);
    } else {
      logger.warn("CORS blocked request", {origin, allowedOrigins});
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  maxAge: 86400, // Cache preflight response for 24 hours
};

// Request size limiting middleware
export const requestSizeLimit = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const maxSize = 10 * 1024 * 1024; // 10MB limit

  if (
    req.get("Content-Length") &&
    parseInt(req.get("Content-Length")!) > maxSize
  ) {
    logger.warn("Request size limit exceeded", {
      ip: req.ip,
      size: req.get("Content-Length"),
      maxSize,
    });

    return res.status(413).json({
      success: false,
      error: "Request entity too large",
      maxSize: `${maxSize / (1024 * 1024)}MB`,
    });
  }

  next();
};

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove server information
  res.removeHeader("X-Powered-By");

  // Set security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Only set HSTS in production over HTTPS
  if (env.NODE_ENV === "production" && req.secure) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log request
  logger.info("Incoming request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Log response when it finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
