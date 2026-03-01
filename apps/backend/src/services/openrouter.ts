import type { OpenRouterModel } from '@openrouter-free-models/shared';
import { OPENROUTER_MODELS_ENDPOINT, FREE_MODEL_SUFFIX, ERRORS } from '@openrouter-free-models/shared';

/**
 * OpenRouter API service for fetching models
 */
export class OpenRouterService {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(apiKey?: string) {
    this.baseUrl = OPENROUTER_MODELS_ENDPOINT;
    this.apiKey = apiKey;
  }

  /**
   * Fetch all models from OpenRouter API
   */
  async fetchAllModels(): Promise<OpenRouterModel[]> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(this.baseUrl, { headers });

      if (!response.ok) {
        throw new Error(`OpenRouter API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as { data?: unknown };

      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from OpenRouter API');
      }

      return data.data as OpenRouterModel[];
    } catch (error) {
      console.error('Failed to fetch models from OpenRouter:', error);
      throw new Error(ERRORS.OPENROUTER_API_ERROR);
    }
  }

  /**
   * Fetch only free models (models ending with :free)
   */
  async fetchFreeModels(): Promise<OpenRouterModel[]> {
    const allModels = await this.fetchAllModels();

    return allModels.filter((model) => model.id.endsWith(FREE_MODEL_SUFFIX));
  }

  /**
   * Retry fetch with exponential backoff
   */
  async fetchWithRetry(maxRetries = 3, baseDelay = 1000): Promise<OpenRouterModel[]> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchFreeModels();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Fetch attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw new Error(ERRORS.OPENROUTER_API_ERROR);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
