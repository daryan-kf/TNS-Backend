import express from 'express';
import {
  generateText,
  vertexAIHealthCheck,
} from '@/src/controllers/ai/ask.controller';

const router = express.Router();

// Health check endpoint
router.get('/health', vertexAIHealthCheck);

// AI Ask endpoint (POST only)
router.post('/', generateText);

export default router;
