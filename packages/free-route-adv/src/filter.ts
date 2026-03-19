import type { OpenRouterModel } from '@openrouter-free-models/shared';
import type { FilterOptions, MatchStrategy, AliasMap } from './types';
import { extractProvider, matchByStrategy, expandAliases } from './utils';

/**
 * Model filter for filtering models based on criteria
 */
export class ModelFilter {
  private models: OpenRouterModel[];
  private aliases: AliasMap;

  constructor(models: OpenRouterModel[], customAliases?: AliasMap) {
    this.models = models;
    this.aliases = customAliases || {};
  }

  /**
   * Filter by providers
   */
  byProviders(providers: string[]): OpenRouterModel[] {
    if (!providers || providers.length === 0) {
      return this.models;
    }

    const providerVariations = providers.flatMap((p) => expandAliases(p, this.aliases));

    return this.models.filter((model) => {
      const provider = extractProvider(model);
      return providerVariations.some((p) => provider.includes(p.toLowerCase()));
    });
  }

  /**
   * Filter by modality
   */
  byModality(modality: string): OpenRouterModel[] {
    if (!modality) {
      return this.models;
    }

    return this.models.filter((model) => {
      return model.architecture?.modality === modality;
    });
  }

  /**
   * Filter by context length range
   */
  byContextLength(min?: number, max?: number): OpenRouterModel[] {
    return this.models.filter((model) => {
      const contextLength = model.context_length || 0;

      if (min !== undefined && contextLength < min) {
        return false;
      }

      if (max !== undefined && contextLength > max) {
        return false;
      }

      return true;
    });
  }

  /**
   * Filter by keyword in id, name, or description
   */
  byKeyword(
    keyword: string,
    strategy: MatchStrategy = 'includes'
  ): OpenRouterModel[] {
    if (!keyword) {
      return this.models;
    }

    const keywordVariations = expandAliases(keyword, this.aliases);

    return this.models.filter((model) => {
      // Check if any keyword variation matches
      return keywordVariations.some((kw) => {
        // Match against model ID
        if (matchByStrategy(model.id, kw, strategy)) {
          return true;
        }

        // Match against model name
        if (model.name && matchByStrategy(model.name, kw, strategy)) {
          return true;
        }

        // Match against description
        if (model.description && matchByStrategy(model.description, kw, strategy)) {
          return true;
        }

        return false;
      });
    });
  }

  /**
   * Apply all filters from FilterOptions
   */
  apply(options: FilterOptions): OpenRouterModel[] {
    let filtered = [...this.models];

    // Apply provider filter
    if (options.providers && options.providers.length > 0) {
      filtered = new ModelFilter(filtered, this.aliases).byProviders(options.providers);
    }

    // Apply modality filter
    if (options.modality) {
      filtered = new ModelFilter(filtered).byModality(options.modality);
    }

    // Apply context length filter
    if (options.minContextLength !== undefined || options.maxContextLength !== undefined) {
      filtered = new ModelFilter(filtered).byContextLength(
        options.minContextLength,
        options.maxContextLength
      );
    }

    // Apply keyword filter
    if (options.keyword) {
      filtered = new ModelFilter(filtered, this.aliases).byKeyword(
        options.keyword,
        options.matchStrategy
      );
    }

    return filtered;
  }
}

/**
 * Filter chain for fluent API
 */
export class FilterChain {
  private models: OpenRouterModel[];
  private filters: Partial<FilterOptions>;
  private aliases: AliasMap;

  constructor(models: OpenRouterModel[], aliases?: AliasMap) {
    this.models = models;
    this.filters = {};
    this.aliases = aliases || {};
  }

  /**
   * Filter by providers
   */
  filterByProviders(providers: string[]): FilterChain {
    this.filters.providers = providers;
    return this;
  }

  /**
   * Filter by modality
   */
  filterByModality(modality: string): FilterChain {
    this.filters.modality = modality;
    return this;
  }

  /**
   * Filter by minimum context length
   */
  filterByMinContextLength(min: number): FilterChain {
    this.filters.minContextLength = min;
    return this;
  }

  /**
   * Filter by maximum context length
   */
  filterByMaxContextLength(max: number): FilterChain {
    this.filters.maxContextLength = max;
    return this;
  }

  /**
   * Filter by keyword
   */
  filterByKeyword(keyword: string, strategy?: MatchStrategy): FilterChain {
    this.filters.keyword = keyword;
    if (strategy) {
      this.filters.matchStrategy = strategy;
    }
    return this;
  }

  /**
   * Execute the filter chain
   */
  async exec(): Promise<OpenRouterModel[]> {
    const filter = new ModelFilter(this.models, this.aliases);
    return filter.apply(this.filters);
  }

  /**
   * Reset the filter chain
   */
  reset(): FilterChain {
    this.filters = {};
    return this;
  }

  /**
   * Get current filters (for debugging)
   */
  getFilters(): Partial<FilterOptions> {
    return { ...this.filters };
  }
}
