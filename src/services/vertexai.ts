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
const DEFAULT_MODEL = 'gemini-2.5-flash'; // more capable by default
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_TOP_K = 40;
const DEFAULT_TOP_P = 0.95;
// Do NOT cap output unless caller specifies it
const DEFAULT_MAX_TOKENS: number | undefined = undefined;

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

      // Build generation config without forcing maxOutputTokens
      const generationConfig: Record<string, unknown> = {
        temperature: request.temperature ?? DEFAULT_TEMPERATURE,
        topK: request.topK ?? DEFAULT_TOP_K,
        topP: request.topP ?? DEFAULT_TOP_P,
      };
      const effectiveMax = request.maxOutputTokens ?? DEFAULT_MAX_TOKENS;
      if (typeof effectiveMax === 'number') {
        generationConfig.maxOutputTokens = effectiveMax;
      }

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        generationConfig: generationConfig as any,
      });

      const result = await model.generateContent(request.prompt);
      // Prefer response.text(), but fall back to aggregating parts
      let text = result.response.text()?.trim() || '';

      if (!text) {
        const parts =
          result.response.candidates?.[0]?.content?.parts
            ?.map((p: any) => (typeof p?.text === 'string' ? p.text : ''))
            .filter(Boolean)
            .join('\n')
            .trim() || '';
        text = parts;
      }

      // If still empty, surface finish reason / safety blocks explicitly
      if (!text) {
        const candidate = result.response.candidates?.[0];
        const finish = candidate?.finishReason;
        const safety = candidate?.safetyRatings;
        const blocked = safety?.some((s: any) => s?.blocked)
          ? ' (safety-blocked)'
          : '';
        const reason = finish ? `finishReason=${finish}` : 'unknown';
        throw new Error(`Empty model response${blocked}; ${reason}`);
      }

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
