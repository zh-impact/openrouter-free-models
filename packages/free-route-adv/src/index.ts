/**
 * @openrouter-free-models/free-route-adv
 *
 * Advanced filtering and routing for OpenRouter free models with multi-condition support, caching, and availability verification.
 *
 * @example
 * ```typescript
 * import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';
 *
 * const client = new FreeRouteClient();
 * const models = await client.filter({
 *   providers: ['google'],
 *   modality: 'text',
 *   minContextLength: 32000
 * });
 * ```
 */

// Main client
export { FreeRouteClient } from './client';

// Filter classes
export { ModelFilter, FilterChain } from './filter';

// Cache
export { ModelCache } from './cache';

// Availability checker
export { AvailabilityChecker } from './availability';

// Types
export type {
  OpenRouterModel,
  FilterOptions,
  MatchStrategy,
  CacheOptions,
  CacheStats,
  ClientOptions,
  EmptyResultOptions,
  AvailabilityCheckOptions,
  ModelAvailabilityResult,
  PrivacyRequirement,
  AlternativeModels,
  Environment,
  AliasMap,
} from './types';

// Errors
export {
  FreeRouteClientError,
  FetchError,
  RateLimitError,
  AuthenticationError,
  ValidationError,
  NoModelsFoundError,
  ModelAvailabilityError,
} from './types';

// Constants
export { BUILT_IN_ALIASES } from './types';

// Utilities
export {
  detectEnvironment,
  extractProvider,
  isFreeModel,
  normalizeString,
  matchByStrategy,
  expandAliases,
  sleep,
  createTimeoutController,
  retryWithBackoff,
  safeJsonParse,
  generateId,
  formatDate,
  isExpired,
  calculateBackoff,
  sanitizeError,
  isTestEnvironment,
  getEnv,
} from './utils';
