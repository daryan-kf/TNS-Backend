import express from 'express';
import {
  generateText,
  vertexAIHealthCheck,
} from '@/src/controllers/ai/vertexai.controller';

const router = express.Router();

// Health check endpoint
router.get('/health', vertexAIHealthCheck);

// Simple text generation
router.post('/generate', generateText);

export default router;
