import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '@/src/utils/logger';

// Generic validation middleware factory
export const validate = (schema: {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate params if schema provided
      if (schema.params) {
        req.params = schema.params.parse(req.params) as any;
      }

      // Validate query if schema provided
      if (schema.query) {
        const validatedQuery = schema.query.parse(req.query) as any;

        (req as any).validatedQuery = validatedQuery;
      }

      // Validate body if schema provided
      if (schema.body) {
        req.body = schema.body.parse(req.body) as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error', {
          url: req.url,
          method: req.method,
          errors: error.issues,
          ip: req.ip,
        });

        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues.map(error => ({
            path: error.path.join('.'),
            message: error.message,
            ...(error.code === 'invalid_type' && 'received' in error
              ? { received: error.received }
              : {}),
          })),
        });
      }

      next(error);
    }
  };
};

// Input sanitization middleware
export const sanitizeInput = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Recursively sanitize strings in objects
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential XSS characters
      return obj
        .replace(/[<>"']/g, '') // Remove HTML characters
        .trim(); // Remove whitespace
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    const sanitizedQuery = sanitizeObject(req.query);
    // Store sanitized query in a custom property
    (req as any).sanitizedQuery = sanitizedQuery;
  }

  next();
};

// SQL injection prevention middleware
export const preventSQLInjection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|"|`)/,
    /(\bOR\b|\bAND\b).*?=.*?=/i,
  ];

  const checkForSQL = (value: string): boolean => {
    return sqlPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkForSQL(obj);
    }

    if (Array.isArray(obj)) {
      return obj.some(checkObject);
    }

    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(checkObject);
    }

    return false;
  };

  // Check query parameters
  if (req.query && checkObject(req.query)) {
    logger.warn('Potential SQL injection attempt in query', {
      ip: req.ip,
      url: req.url,
      query: req.query,
    });

    return res.status(400).json({
      success: false,
      error: 'Invalid characters detected in request',
    });
  }

  // Check request body
  if (req.body && checkObject(req.body)) {
    logger.warn('Potential SQL injection attempt in body', {
      ip: req.ip,
      url: req.url,
      body: req.body,
    });

    return res.status(400).json({
      success: false,
      error: 'Invalid characters detected in request',
    });
  }

  next();
};
