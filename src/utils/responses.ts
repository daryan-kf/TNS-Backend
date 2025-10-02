import { Response } from 'express';

// Standard API response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: any;
  timestamp: string;
  count?: number;
}

// Helper function to create consistent API responses
export const createResponse = <T>(
  success: boolean,
  message: string,
  data?: T,
  error?: string,
  details?: any,
  count?: number
): ApiResponse<T> => ({
  success,
  message,
  ...(data !== undefined && { data }),
  ...(error && { error }),
  ...(details && { details }),
  ...(count !== undefined && { count }),
  timestamp: new Date().toISOString(),
});

// Success response helpers
export const successResponse = <T>(
  res: Response,
  message: string,
  data?: T,
  count?: number,
  statusCode: number = 200
) => {
  return res
    .status(statusCode)
    .json(createResponse(true, message, data, undefined, undefined, count));
};

export const createdResponse = <T>(
  res: Response,
  message: string,
  data?: T
) => {
  return successResponse(res, message, data, undefined, 201);
};

// Error response helpers
export const errorResponse = (
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 500,
  details?: any
) => {
  return res
    .status(statusCode)
    .json(createResponse(false, message, undefined, error, details));
};

export const badRequestResponse = (
  res: Response,
  message: string = 'Bad request',
  details?: any
) => {
  return errorResponse(res, message, 'Bad request', 400, details);
};

export const notFoundResponse = (
  res: Response,
  resource: string = 'Resource'
) => {
  return errorResponse(res, `${resource} not found`, 'Not found', 404);
};

export const unauthorizedResponse = (
  res: Response,
  message: string = 'Unauthorized'
) => {
  return errorResponse(res, message, 'Unauthorized', 401);
};

export const forbiddenResponse = (
  res: Response,
  message: string = 'Forbidden'
) => {
  return errorResponse(res, message, 'Forbidden', 403);
};

export const conflictResponse = (
  res: Response,
  message: string = 'Resource already exists'
) => {
  return errorResponse(res, message, 'Conflict', 409);
};

export const validationErrorResponse = (
  res: Response,
  details: any,
  message: string = 'Validation failed'
) => {
  return errorResponse(res, message, 'Validation error', 422, details);
};

export const internalServerErrorResponse = (
  res: Response,
  message: string = 'Internal server error'
) => {
  return errorResponse(res, message, 'Internal server error', 500);
};
