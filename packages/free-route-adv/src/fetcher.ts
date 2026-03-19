import type { OpenRouterModel } from '@openrouter-free-models/shared';
import type { ClientOptions } from './types';
import { ModelCache } from './cache';
import { FetchError, RateLimitError, AuthenticationError } from './types';
import { retryWithBackoff, createTimeoutController, sanitizeError } from './utils';

/**
 * API response structure
 */
interface ModelsResponse {
  data: OpenRouterModel[];
}

/**
 * Fetches models from OpenRouter API or local endpoint
 */
export class ModelFetcher {
  private cache: ModelCache<OpenRouterModel[]>;
  private apiBase: string;
  private apiKey?: string;
  private retryAttempts: number;
  private timeout: number;

  constructor(options: ClientOptions = {}) {
    this.apiBase = options.apiBase ?? '/api/models';
    this.apiKey = options.apiKey;
    this.retryAttempts = options.retryAttempts ?? 3;
    this.timeout = options.timeout ?? 30000; // 30 seconds default

    // Initialize cache
    this.cache = new ModelCache(
      options.cache ?? {
        enabled: true,
        ttl: 300000, // 5 minutes
        maxSize: 100,
      }
    );
  }

  /**
   * Fetch models from API (with cache support)
   */
  async fetchModels(): Promise<OpenRouterModel[]> {
    // Check cache first
    const cached = this.cache.get('models');
    if (cached) {
      return cached;
    }

    // Fetch from API
    const models = await this.fetchFromAPI();

    // Store in cache
    this.cache.set('models', models);

    return models;
  }

  /**
   * Force refresh models from API (bypasses cache)
   */
  async forceRefresh(): Promise<OpenRouterModel[]> {
    const models = await this.fetchFromAPI();

    // Update cache
    this.cache.set('models', models);

    return models;
  }

  /**
   * Fetch models from API (no cache)
   */
  private async fetchFromAPI(): Promise<OpenRouterModel[]> {
    try {
      const response = await retryWithBackoff(
        () => this.makeRequest(),
        this.retryAttempts
      );

      return this.parseResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request to API
   */
  private async makeRequest(): Promise<Response> {
    const controller = createTimeoutController(this.timeout);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if API key is provided
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(this.apiBase, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    return response;
  }

  /**
   * Parse API response and filter for free models
   */
  private async parseResponse(response: Response): Promise<OpenRouterModel[]> {
    // Check for error status codes
    if (response.status === 401) {
      throw new AuthenticationError('Authentication failed. Check your API key.');
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(
        'Rate limit exceeded. Please try again later.',
        retryAfter ? parseInt(retryAfter, 10) : undefined
      );
    }

    if (!response.ok) {
      throw new FetchError(
        `API request failed with status ${response.status}: ${response.statusText}`
      );
    }

    // Parse JSON response
    const json = await response.json();
    const data: ModelsResponse = json;

    // Filter for free models (pricing.prompt === "0" or ends with ":free")
    const freeModels = this.filterFreeModels(data.data);

    return freeModels;
  }

  /**
   * Filter models to only include free ones
   */
  private filterFreeModels(models: OpenRouterModel[]): OpenRouterModel[] {
    return models.filter((model) => {
      const promptPrice = model.pricing?.prompt || '0';
      const isZeroPrice =
        promptPrice === '0' || promptPrice === '0.0' || parseFloat(promptPrice) === 0;

      // Also check if model ID ends with :free
      const isFreeModel = model.id.endsWith(':free');

      return isZeroPrice || isFreeModel;
    });
  }

  /**
   * Handle and wrap errors appropriately
   */
  private handleError(error: unknown): Error {
    if (error instanceof FetchError) {
      return error;
    }

    if (error instanceof Error) {
      // Check for network errors
      if (error.name === 'AbortError') {
        return new FetchError('Request timeout. Please try again.');
      }

      // Check for network connection errors
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new FetchError('Network error. Please check your connection.', error);
      }

      return new FetchError(sanitizeError(error), error);
    }

    return new FetchError('An unknown error occurred');
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Check if caching is enabled
   */
  get isCacheEnabled(): boolean {
    return this.cache.isEnabled;
  }
}
