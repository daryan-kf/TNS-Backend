import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger, logError } from '@/src/utils/logger';
import { isProduction } from '@/src/config/environment';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log all errors for monitoring
  logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.issues.map(error => ({
        path: error.path.join('.'),
        message: error.message,
        ...(error.code === 'invalid_type' && 'received' in error
          ? { received: error.received }
          : {}),
      })),
    });
  }

  // Handle BigQuery errors
  if (err.name === 'BigQueryError' || err.code) {
    logger.error('BigQuery error', {
      code: err.code,
      message: err.message,
      errors: err.errors,
    });

    return res.status(500).json({
      success: false,
      error: 'Database query failed',
      // Don't expose internal database errors in production
      ...(isProduction() ? {} : { details: err.message }),
    });
  }

  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'Origin not allowed',
    });
  }

  // Default error response
  const status = err.status || err.statusCode || 500;
  const message = isProduction()
    ? 'An internal error occurred'
    : err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    // Include stack trace only in development
    ...(isProduction() ? {} : { stack: err.stack }),
  });
}
