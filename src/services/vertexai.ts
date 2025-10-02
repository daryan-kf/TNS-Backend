import { GoogleGenerativeAI } from '@google/generative-ai';

import { getGoogleAPIKey } from '@/src/config/environment';
import { logger } from '@/src/utils/logger';

// Types
export interface VertexAIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}

export interface VertexAIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    candidatesTokens: number;
    totalTokens: number;
  };
}

// Configuration
const DEFAULT_MODEL = 'gemini-2.5-flash';
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TOP_K = 40;
const DEFAULT_TOP_P = 0.95;
const DEFAULT_MAX_TOKENS = 1024;

class VertexAIService {
  private readonly genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = getGoogleAPIKey();
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate text using Google's Generative AI
   * @param request - The text generation request
   * @returns Promise<VertexAIResponse> - The generated text response
   */
  async generateText(request: VertexAIRequest): Promise<VertexAIResponse> {
    try {
      const modelName = request.model || DEFAULT_MODEL;

      logger.info('Generating text with Generative AI', {
        promptLength: request.prompt.length,
        model: modelName,
        temperature: request.temperature,
        maxTokens: request.maxOutputTokens,
      });

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: request.temperature ?? DEFAULT_TEMPERATURE,
          topK: request.topK ?? DEFAULT_TOP_K,
          topP: request.topP ?? DEFAULT_TOP_P,
          maxOutputTokens: request.maxOutputTokens ?? DEFAULT_MAX_TOKENS,
        },
      });

      const result = await model.generateContent(request.prompt);
      const text = result.response.text() || 'No response generated';

      logger.info('Generative AI response generated successfully', {
        responseLength: text.length,
        model: modelName,
      });

      return {
        text,
        usage: undefined, // TODO: Implement token usage tracking
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.error('Error generating text with Generative AI', {
        error: errorMessage,
        model: request.model || DEFAULT_MODEL,
        promptLength: request.prompt.length,
      });

      throw new Error(`Generative AI generation failed: ${errorMessage}`);
    }
  }

  /**
   * Health check for the Vertex AI service
   * @returns Promise<boolean> - True if service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.generateText({
        prompt: "Say 'Hello, Vertex AI is working!'",
        maxOutputTokens: 50,
      });
      return true;
    } catch (error) {
      logger.error('Vertex AI health check failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

// Export singleton instance
export const vertexAIService = new VertexAIService();
export default vertexAIService;
