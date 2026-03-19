import type { OpenRouterModel } from '@openrouter-free-models/shared';
import type {
  ClientOptions,
  FilterOptions,
  CacheStats,
  ModelAvailabilityResult,
  AvailabilityCheckOptions,
  AlternativeModels,
  EmptyResultOptions,
} from './types';
import { ModelFetcher } from './fetcher';
import { ModelFilter, FilterChain } from './filter';
import { AvailabilityChecker } from './availability';
import {
  FreeRouteClientError,
  NoModelsFoundError,
  ValidationError,
  BUILT_IN_ALIASES,
} from './types';

/**
 * Main client for free route advanced functionality
 *
 * @example
 * ```typescript
 * const client = new FreeRouteClient({
 *   apiBase: '/api/models',
 *   cache: { enabled: true, ttl: 300000, maxSize: 100 }
 * });
 *
 * const models = await client.filter({
 *   providers: ['google'],
 *   modality: 'text'
 * });
 * ```
 */
export class FreeRouteClient {
  private fetcher: ModelFetcher;
  private aliases: Record<string, string>;
  private emptyResultOptions: EmptyResultOptions;
  private availabilityOptions: boolean | AvailabilityCheckOptions;
  private availabilityChecker?: AvailabilityChecker;

  /**
   * Create a new FreeRouteClient instance
   *
   * @param options - Client configuration options
   *
   * @example
   * ```typescript
   * // Default configuration
   * const client = new FreeRouteClient();
   *
   * // With custom cache
   * const client = new FreeRouteClient({
   *   cache: { enabled: true, ttl: 60000, maxSize: 50 }
   * });
   *
   * // With OpenRouter API
   * const client = new FreeRouteClient({
   *   apiBase: 'https://openrouter.ai/api/v1/models',
   *   apiKey: 'sk-...'
   * });
   * ```
   */
  constructor(options: ClientOptions = {}) {
    // Initialize fetcher
    this.fetcher = new ModelFetcher(options);

    // Merge custom aliases with built-in aliases
    this.aliases = {
      ...BUILT_IN_ALIASES,
      ...(options.aliases || {}),
    };

    // Store empty result options
    this.emptyResultOptions = options.emptyResult ?? {
      throwOnEmpty: false,
      logWarning: true,
    };

    // Store availability options
    this.availabilityOptions = options.verifyAvailability ?? false;

    // Initialize availability checker if needed
    if (this.availabilityOptions) {
      const apiBase = options.apiBase ?? '/api/models';
      const apiKey = options.apiKey;
      const availOptions =
        typeof this.availabilityOptions === 'object' ? this.availabilityOptions : undefined;

      this.availabilityChecker = new AvailabilityChecker(apiBase, apiKey, availOptions);
    }
  }

  /**
   * Filter models based on options
   *
   * @param options - Filter options
   * @returns Promise resolving to filtered array of models
   * @throws {ValidationError} If filter options are invalid
   * @throws {NoModelsFoundError} If no models match and throwOnEmpty is true
   *
   * @example
   * ```typescript
   * // Filter by provider
   * const models = await client.filter({ providers: ['google'] });
   *
   * // Filter by modality
   * const models = await client.filter({ modality: 'text' });
   *
   * // Filter by context length
   * const models = await client.filter({
   *   minContextLength: 32000,
   *   maxContextLength: 200000
   * });
   *
   * // Filter by keyword
   * const models = await client.filter({
   *   keyword: 'gemini',
   *   matchStrategy: 'includes'
   * });
   *
   * // Combine filters
   * const models = await client.filter({
   *   providers: ['google', 'anthropic'],
   *   modality: 'text',
   *   minContextLength: 32000,
   *   keyword: 'pro'
   * });
   * ```
   */
  async filter(options: FilterOptions = {}): Promise<OpenRouterModel[]> {
    try {
      // Validate options
      this.validateFilterOptions(options);

      // Fetch all models
      const allModels = await this.fetcher.fetchModels();

      // Apply filters
      const filter = new ModelFilter(allModels, this.aliases);
      let filtered = filter.apply(options);

      // Handle empty results
      if (filtered.length === 0) {
        return this.handleEmptyResults(options, allModels);
      }

      // Verify availability if requested
      if (options.verifyAvailability || (this.availabilityOptions && !options.verifyAvailability)) {
        filtered = await this.verifyAndFilterModels(filtered);
      }

      return filtered;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Filter by providers (chain API)
   *
   * @param providers - Array of provider names to filter by
   * @returns FilterChain for chaining more filters
   *
   * @example
   * ```typescript
   * const chain = client.filterByProviders(['google', 'anthropic']);
   * const models = await chain.filterByModality('text').exec();
   * ```
   */
  filterByProviders(providers: string[]): FilterChain {
    return this.createFilterChain().filterByProviders(providers);
  }

  /**
   * Filter by modality (chain API)
   *
   * @param modality - Modality type to filter by (e.g., 'text', 'text+image')
   * @returns FilterChain for chaining more filters
   *
   * @example
   * ```typescript
   * const models = await client.filterByModality('text').exec();
   * ```
   */
  filterByModality(modality: string): FilterChain {
    return this.createFilterChain().filterByModality(modality);
  }

  /**
   * Filter by keyword (chain API)
   *
   * @param keyword - Keyword to search for
   * @returns FilterChain for chaining more filters
   *
   * @example
   * ```typescript
   * const models = await client.filterByKeyword('gemini').exec();
   * ```
   */
  filterByKeyword(keyword: string): FilterChain {
    return this.createFilterChain().filterByKeyword(keyword);
  }

  /**
   * Get all models (no filtering)
   *
   * @returns Promise resolving to array of all free models
   *
   * @example
   * ```typescript
   * const allModels = await client.getAllModels();
   * console.log(`Total free models: ${allModels.length}`);
   * ```
   */
  async getAllModels(): Promise<OpenRouterModel[]> {
    try {
      return await this.fetcher.fetchModels();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific model by ID
   *
   * @param id - Model identifier (e.g., 'google/gemini-pro')
   * @returns Promise resolving to model or null if not found
   *
   * @example
   * ```typescript
   * const model = await client.getModelById('google/gemini-pro');
   * if (model) {
   *   console.log(`Found: ${model.name}`);
   * }
   * ```
   */
  async getModelById(id: string): Promise<OpenRouterModel | null> {
    try {
      const allModels = await this.fetcher.fetchModels();
      return allModels.find((m) => m.id === id) || null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all unique providers
   *
   * @returns Promise resolving to sorted array of provider names
   *
   * @example
   * ```typescript
   * const providers = await client.getProviders();
   * console.log('Available providers:', providers);
   * // ['anthropic', 'google', 'meta', 'mistralai']
   * ```
   */
  async getProviders(): Promise<string[]> {
    try {
      const allModels = await this.fetcher.fetchModels();
      const providers = new Set<string>();

      for (const model of allModels) {
        const provider = model.id.split('/')[0];
        providers.add(provider);
      }

      return Array.from(providers).sort();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get all unique modalities
   *
   * @returns Promise resolving to sorted array of modality types
   *
   * @example
   * ```typescript
   * const modalities = await client.getModalities();
   * console.log('Available modalities:', modalities);
   * // ['text', 'text+image', 'image']
   * ```
   */
  async getModalities(): Promise<string[]> {
    try {
      const allModels = await this.fetcher.fetchModels();
      const modalities = new Set<string>();

      for (const model of allModels) {
        if (model.architecture?.modality) {
          modalities.add(model.architecture.modality);
        }
      }

      return Array.from(modalities).sort();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify model availability
   *
   * @param modelId - Model identifier to check
   * @returns Promise resolving to availability result
   * @throws {FreeRouteClientError} If availability checking is not enabled
   *
   * @example
   * ```typescript
   * const result = await client.verifyModelAvailability('google/gemini-pro');
   *
   * if (result.available) {
   *   console.log('Model is available');
   * } else {
   *   console.log(`Model unavailable: ${result.reason}`);
   *   console.log(`Suggestion: ${result.suggestion}`);
   * }
   * ```
   */
  async verifyModelAvailability(modelId: string): Promise<ModelAvailabilityResult> {
    if (!this.availabilityChecker) {
      throw new FreeRouteClientError(
        'Availability checking is not enabled. Initialize client with verifyAvailability option.'
      );
    }

    return await this.availabilityChecker.verifyModelAvailability(modelId);
  }

  /**
   * Verify multiple models' availability
   *
   * @param modelIds - Array of model identifiers to check
   * @returns Promise resolving to record of modelId -> availability result
   * @throws {FreeRouteClientError} If availability checking is not enabled
   *
   * @example
   * ```typescript
   * const results = await client.verifyModelsAvailability([
   *   'google/gemini-pro',
   *   'anthropic/claude-3-haiku'
   * ]);
   *
   * for (const [modelId, result] of Object.entries(results)) {
   *   console.log(`${modelId}: ${result.available ? 'OK' : 'Unavailable'}`);
   * }
   * ```
   */
  async verifyModelsAvailability(modelIds: string[]): Promise<Record<string, ModelAvailabilityResult>> {
    if (!this.availabilityChecker) {
      throw new FreeRouteClientError(
        'Availability checking is not enabled. Initialize client with verifyAvailability option.'
      );
    }

    return await this.availabilityChecker.verifyModelsAvailability(modelIds);
  }

  /**
   * Get alternative models
   *
   * @param modelId - Original model identifier
   * @returns Promise resolving to alternative models
   * @throws {FreeRouteClientError} If availability checking is not enabled
   *
   * @example
   * ```typescript
   * const alternatives = await client.getAlternatives('google/gemini-pro');
   * console.log(`Found ${alternatives.alternatives.length} alternatives`);
   * console.log(`Reason: ${alternatives.reason}`);
   * ```
   */
  async getAlternatives(modelId: string): Promise<AlternativeModels> {
    if (!this.availabilityChecker) {
      throw new FreeRouteClientError(
        'Availability checking is not enabled. Initialize client with verifyAvailability option.'
      );
    }

    const allModels = await this.fetcher.fetchModels();
    return this.availabilityChecker.getAlternatives(modelId, allModels);
  }

  /**
   * Clear cache
   *
   * Removes all cached data. Next API call will fetch fresh data.
   *
   * @example
   * ```typescript
   * client.clearCache();
   * const freshModels = await client.getAllModels();
   * ```
   */
  clearCache(): void {
    this.fetcher.clearCache();
    this.availabilityChecker?.clearCache();
  }

  /**
   * Force refresh models
   *
   * Fetches fresh data from API, bypassing cache.
   *
   * @returns Promise resolving to fresh array of models
   *
   * @example
   * ```typescript
   * const latestModels = await client.forceRefresh();
   * ```
   */
  async forceRefresh(): Promise<OpenRouterModel[]> {
    try {
      return await this.fetcher.forceRefresh();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Cache statistics including size, lastUpdate, hits, and misses
   *
   * @example
   * ```typescript
   * const stats = client.getCacheStats();
   * console.log(`Cache size: ${stats.size}`);
   * console.log(`Hits: ${stats.hits}, Misses: ${stats.misses}`);
   * console.log(`Hit rate: ${stats.hits / (stats.hits + stats.misses) * 100}%`);
   * ```
   */
  getCacheStats(): CacheStats {
    return this.fetcher.getCacheStats();
  }

  /**
   * Validate filter options
   */
  private validateFilterOptions(options: FilterOptions): void {
    if (options.minContextLength !== undefined && options.minContextLength < 0) {
      throw new ValidationError('minContextLength must be non-negative', 'minContextLength');
    }

    if (options.maxContextLength !== undefined && options.maxContextLength < 0) {
      throw new ValidationError('maxContextLength must be non-negative', 'maxContextLength');
    }

    if (
      options.minContextLength !== undefined &&
      options.maxContextLength !== undefined &&
      options.minContextLength > options.maxContextLength
    ) {
      throw new ValidationError('minContextLength cannot be greater than maxContextLength');
    }

    if (options.matchStrategy && !['exact', 'includes', 'startsWith', 'regex'].includes(options.matchStrategy)) {
      throw new ValidationError('Invalid matchStrategy', 'matchStrategy');
    }
  }

  /**
   * Handle empty filter results
   */
  private async handleEmptyResults(
    options: FilterOptions,
    allModels: OpenRouterModel[]
  ): Promise<OpenRouterModel[]> {
    const suggestions = this.generateSuggestions(options, allModels);
    const fallbackAvailable = !!this.emptyResultOptions.fallbackProvider;

    // Log warning if enabled
    if (this.emptyResultOptions.logWarning !== false) {
      console.warn('[FreeRouteClient] No models found matching the filter criteria.');
      console.warn('Suggestions:', suggestions.join(', '));
    }

    // Throw error if configured
    if (this.emptyResultOptions.throwOnEmpty) {
      throw new NoModelsFoundError(
        'No models found matching the specified criteria.',
        options,
        allModels.length,
        suggestions,
        fallbackAvailable
      );
    }

    // Try fallback provider
    if (this.emptyResultOptions.fallbackProvider) {
      console.warn(`[FreeRouteClient] Trying fallback provider: ${this.emptyResultOptions.fallbackProvider}`);
      return await this.filter({
        ...options,
        providers: [this.emptyResultOptions.fallbackProvider],
        fallbackProvider: undefined, // Prevent infinite recursion
      });
    }

    return [];
  }

  /**
   * Generate suggestions for empty results
   */
  private generateSuggestions(options: FilterOptions, allModels: OpenRouterModel[]): string[] {
    const suggestions: string[] = [];

    if (options.providers && options.providers.length > 0) {
      const availableProviders = new Set(allModels.map((m) => m.id.split('/')[0]));
      const missing = options.providers.filter((p) => !availableProviders.has(p));
      if (missing.length > 0) {
        suggestions.push(`Provider "${missing.join(', ')}" not found. Try: ${Array.from(availableProviders).slice(0, 5).join(', ')}`);
      }
    }

    if (options.minContextLength) {
      const maxContext = Math.max(...allModels.map((m) => m.context_length || 0));
      if (options.minContextLength > maxContext) {
        suggestions.push(`Minimum context length (${options.minContextLength}) too high. Maximum available: ${maxContext}`);
      }
    }

    if (suggestions.length === 0) {
      suggestions.push('Try relaxing filter conditions', 'Try fewer filters', 'Check available providers with getProviders()');
    }

    return suggestions;
  }

  /**
   * Verify and filter models by availability
   */
  private async verifyAndFilterModels(models: OpenRouterModel[]): Promise<OpenRouterModel[]> {
    if (!this.availabilityChecker) {
      return models;
    }

    const modelIds = models.map((m) => m.id);
    const results = await this.availabilityChecker.verifyModelsAvailability(modelIds);

    return models.filter((model) => {
      const result = results[model.id];
      const available = result?.available ?? false;

      if (!available && this.emptyResultOptions.logWarning !== false) {
        console.warn(`[FreeRouteClient] Model ${model.id} is not available: ${result?.reason || 'unknown'}`);
        if (result?.suggestion) {
          console.warn(`  Suggestion: ${result.suggestion}`);
        }
      }

      return available;
    });
  }

  /**
   * Create a filter chain
   */
  private createFilterChain(): FilterChain {
    // Note: This returns a chain that will fetch models on exec()
    // For simplicity, we're returning a basic chain here
    // In a full implementation, this would be lazy-loaded
    return new FilterChain([], this.aliases);
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof FreeRouteClientError) {
      return error;
    }

    if (error instanceof Error) {
      return new FreeRouteClientError(error.message);
    }

    return new FreeRouteClientError('An unknown error occurred');
  }
}
