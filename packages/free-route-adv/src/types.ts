/**
 * Re-export OpenRouterModel from shared package
 */
export type { OpenRouterModel } from '@openrouter-free-models/shared';

/**
 * Filter options for filtering models
 */
export interface FilterOptions {
  /** Filter by provider names (e.g., ['google', 'anthropic']) */
  providers?: string[];
  /** Filter by modality type (e.g., 'text', 'image') */
  modality?: string;
  /** Minimum context length */
  minContextLength?: number;
  /** Maximum context length */
  maxContextLength?: number;
  /** Keyword to search in model id, name, or description */
  keyword?: string;
  /** Match strategy for keyword filtering */
  matchStrategy?: MatchStrategy;
  /** Whether to verify model availability */
  verifyAvailability?: boolean;
  /** Fallback provider if no models match */
  fallbackProvider?: string;
}

/**
 * Match strategy for keyword filtering
 */
export type MatchStrategy = 'exact' | 'includes' | 'startsWith' | 'regex';

/**
 * Cache configuration options
 */
export interface CacheOptions {
  /** Whether caching is enabled */
  enabled: boolean;
  /** Time-to-live in milliseconds */
  ttl: number;
  /** Maximum number of cache entries */
  maxSize: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Current cache size */
  size: number;
  /** Last update timestamp */
  lastUpdate: Date;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
}

/**
 * Client initialization options
 */
export interface ClientOptions {
  /** Base URL for API endpoint */
  apiBase?: string;
  /** API key for authentication */
  apiKey?: string;
  /** Cache configuration */
  cache?: CacheOptions;
  /** Provider aliases mapping */
  aliases?: Record<string, string>;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Empty result handling options */
  emptyResult?: EmptyResultOptions;
  /** Availability verification options */
  verifyAvailability?: boolean | AvailabilityCheckOptions;
}

/**
 * Empty result handling options
 */
export interface EmptyResultOptions {
  /** Whether to throw error on empty results */
  throwOnEmpty?: boolean;
  /** Fallback provider to use if results are empty */
  fallbackProvider?: string;
  /** Whether to log warnings */
  logWarning?: boolean;
}

/**
 * Availability check options
 */
export interface AvailabilityCheckOptions {
  /** Timeout for verification requests (ms) */
  timeout?: number;
  /** Whether to retry on error */
  retryOnError?: boolean;
  /** Whether to cache verification results */
  cacheResults?: boolean;
}

/**
 * Model availability check result
 */
export interface ModelAvailabilityResult {
  /** Whether the model is available */
  available: boolean;
  /** Model identifier */
  modelId: string;
  /** Reason for unavailability */
  reason?: 'privacy_settings_required' | 'model_deprecated' | 'rate_limited' | 'unknown';
  /** Suggestion for fixing the issue */
  suggestion?: string;
  /** When the check was performed */
  lastChecked: Date;
}

/**
 * Privacy requirement information
 */
export interface PrivacyRequirement {
  /** Model identifier */
  modelId: string;
  /** Whether privacy settings are required */
  requiresPrivacySettings: boolean;
  /** URL to configure privacy settings */
  settingsUrl?: string;
  /** Description of the requirement */
  description?: string;
}

/**
 * Alternative models recommendation
 */
export interface AlternativeModels {
  /** Original model ID */
  originalId: string;
  /** List of alternative models */
  alternatives: OpenRouterModel[];
  /** Reason for recommendation */
  reason: string;
}

/**
 * Import OpenRouterModel for use in other types
 */
import type { OpenRouterModel } from '@openrouter-free-models/shared';

/**
 * Environment type
 */
export type Environment = 'browser' | 'node' | 'workers';

/**
 * Provider alias mapping type
 */
export type AliasMap = Record<string, string>;

/**
 * Built-in provider aliases
 */
export const BUILT_IN_ALIASES: AliasMap = {
  gemini: 'google',
  claude: 'anthropic',
  llama: 'meta',
  bard: 'google',
};

/**
 * Base error class for all client errors
 */
export class FreeRouteClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FreeRouteClientError';
  }
}

/**
 * Error thrown when API request fails
 */
export class FetchError extends FreeRouteClientError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'FetchError';
    this.originalError = originalError;
  }
}

/**
 * Error thrown when API rate limit is hit
 */
export class RateLimitError extends FetchError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, originalError?: Error) {
    super(message, originalError);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends FetchError {
  constructor(message: string, originalError?: Error) {
    super(message, originalError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends FreeRouteClientError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Error thrown when no models match the filter criteria
 */
export class NoModelsFoundError extends FreeRouteClientError {
  public readonly filters: FilterOptions;
  public readonly totalModels: number;
  public readonly suggestions: string[];
  public readonly fallbackAvailable: boolean;

  constructor(
    message: string,
    filters: FilterOptions,
    totalModels: number,
    suggestions: string[],
    fallbackAvailable: boolean
  ) {
    super(message);
    this.name = 'NoModelsFoundError';
    this.filters = filters;
    this.totalModels = totalModels;
    this.suggestions = suggestions;
    this.fallbackAvailable = fallbackAvailable;
  }
}

/**
 * Error thrown when model availability verification fails
 */
export class ModelAvailabilityError extends FreeRouteClientError {
  public readonly modelId: string;
  public readonly reason: string;
  public readonly suggestion: string;

  constructor(message: string, modelId: string, reason: string, suggestion: string) {
    super(message);
    this.name = 'ModelAvailabilityError';
    this.modelId = modelId;
    this.reason = reason;
    this.suggestion = suggestion;
  }
}
