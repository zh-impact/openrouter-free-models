import type { OpenRouterModel } from '@openrouter-free-models/shared';
import type { Environment, MatchStrategy, AliasMap } from './types';
import { BUILT_IN_ALIASES } from './types';

/**
 * Detect the current runtime environment
 */
export function detectEnvironment(): Environment {
  // Check for browser
  if (typeof window !== 'undefined') {
    return 'browser';
  }

  // Check for Cloudflare Workers
  if (typeof caches !== 'undefined' && typeof Request !== 'undefined') {
    return 'workers';
  }

  // Default to Node.js
  return 'node';
}

/**
 * Extract provider name from model ID
 * @example extractProvider('google/gemini-pro') // 'google'
 */
export function extractProvider(model: OpenRouterModel): string {
  // First try to get from model.id (e.g., "google/gemini-pro" -> "google")
  if (model.id && model.id.includes('/')) {
    return model.id.split('/')[0].toLowerCase();
  }

  // Fallback to model.name if available
  if (model.name) {
    const nameParts = model.name.toLowerCase().split(/\s+/);
    return nameParts[0];
  }

  return 'unknown';
}

/**
 * Check if a model is free (pricing.prompt is "0" or "0.0")
 */
export function isFreeModel(model: OpenRouterModel): boolean {
  const promptPrice = model.pricing?.prompt || '0';
  return promptPrice === '0' || promptPrice === '0.0' || parseFloat(promptPrice) === 0;
}

/**
 * Normalize string for comparison (lowercase and trim)
 */
export function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Match a string against a pattern using the specified strategy
 */
export function matchByStrategy(
  text: string,
  pattern: string,
  strategy: MatchStrategy
): boolean {
  const normalizedText = normalizeString(text);
  const normalizedPattern = normalizeString(pattern);

  switch (strategy) {
    case 'exact':
      return normalizedText === normalizedPattern;

    case 'includes':
      return normalizedText.includes(normalizedPattern);

    case 'startsWith':
      return normalizedText.startsWith(normalizedPattern);

    case 'regex':
      try {
        const regex = new RegExp(normalizedPattern, 'i');
        return regex.test(text);
      } catch {
        // Invalid regex, fall back to includes
        return normalizedText.includes(normalizedPattern);
      }

    default:
      return normalizedText.includes(normalizedPattern);
  }
}

/**
 * Apply aliases to a keyword
 * Returns all possible variations (original + aliases)
 */
export function expandAliases(
  keyword: string,
  customAliases?: AliasMap
): string[] {
  const allAliases = { ...BUILT_IN_ALIASES, ...customAliases };

  const variations = new Set<string>();
  variations.add(keyword.toLowerCase());

  // Check if keyword is an alias
  for (const [alias, provider] of Object.entries(allAliases)) {
    if (keyword.toLowerCase() === alias.toLowerCase()) {
      variations.add(provider.toLowerCase());
    }
    if (keyword.toLowerCase() === provider.toLowerCase()) {
      variations.add(alias.toLowerCase());
    }
  }

  return Array.from(variations);
}

/**
 * Sleep/delay utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create an abort controller with timeout
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        throw lastError;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Retry failed');
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Check if a cache entry is expired
 */
export function isExpired(timestamp: Date, ttl: number): boolean {
  const now = new Date();
  const age = now.getTime() - timestamp.getTime();
  return age > ttl;
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoff(attempt: number, baseDelay: number = 1000): number {
  return baseDelay * Math.pow(2, attempt);
}

/**
 * Sanitize error message for display
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Check if running in a test environment
 */
export function isTestEnvironment(): boolean {
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string | undefined {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || fallback;
  }

  // Browser or workers - check global scope
  if (typeof globalThis !== 'undefined') {
    return (globalThis as any)[key] || fallback;
  }

  return fallback;
}
