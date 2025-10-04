import { Request, Response } from 'express';
import { vertexAIService, type VertexAIRequest } from '@/src/services/vertexai';
import { logger } from '@/src/utils/logger';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from '@/src/utils/responses';
import { z } from 'zod';

// Validation schema for text generation requests
const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxOutputTokens: z.number().min(1).max(8192).optional(),
  topP: z.number().min(0).max(1).optional(),
  topK: z.number().min(1).max(100).optional(),
});

/**
 * Generate text using Vertex AI
 * @param req - Express request object
 * @param res - Express response object
 */
export const generateText = async (req: Request, res: Response) => {
  try {
    const validatedData = generateTextSchema.parse(req.body) as VertexAIRequest;

    logger.info('Generating text with Vertex AI', {
      promptLength: validatedData.prompt.length,
      model: validatedData.model,
      temperature: validatedData.temperature,
    });

    const result = await vertexAIService.generateText(validatedData);

    return successResponse(
      res,
      'Text generated successfully',
      result,
      undefined,
      200
    );
  } catch (error) {
    logger.error('Error in generateText controller', {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof z.ZodError) {
      return validationErrorResponse(res, error.issues);
    }

    return errorResponse(
      res,
      'Failed to generate text',
      error instanceof Error ? error.message : String(error),
      500
    );
  }
};

/**
 * Health check for Vertex AI service
 * @param req - Express request object
 * @param res - Express response object
 */
export const vertexAIHealthCheck = async (req: Request, res: Response) => {
  try {
    const isHealthy = await vertexAIService.healthCheck();

    if (isHealthy) {
      return successResponse(
        res,
        'Vertex AI service is healthy',
        { status: 'healthy' },
        undefined,
        200
      );
    } else {
      return errorResponse(
        res,
        'Vertex AI service is unhealthy',
        'Health check failed',
        503
      );
    }
  } catch (error) {
    logger.error('Vertex AI health check failed', {
      error: error instanceof Error ? error.message : String(error),
    });

    return errorResponse(
      res,
      'Vertex AI service is unhealthy',
      error instanceof Error ? error.message : String(error),
      503
    );
  }
};
