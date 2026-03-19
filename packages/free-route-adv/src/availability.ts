import type { OpenRouterModel } from '@openrouter-free-models/shared';
import type { ModelAvailabilityResult, AvailabilityCheckOptions, PrivacyRequirement, AlternativeModels } from './types';
import { createTimeoutController, sanitizeError } from './utils';

/**
 * Model availability checker
 * Verifies if models are actually usable (not just in the list)
 */
export class AvailabilityChecker {
  private apiBase: string;
  private apiKey?: string;
  private options: AvailabilityCheckOptions;
  private cache: Map<string, ModelAvailabilityResult>;

  constructor(
    apiBase: string,
    apiKey?: string,
    options: AvailabilityCheckOptions = {}
  ) {
    this.apiBase = apiBase;
    this.apiKey = apiKey;
    this.options = {
      timeout: options.timeout ?? 10000, // 10 seconds default
      retryOnError: options.retryOnError ?? false,
      cacheResults: options.cacheResults ?? true,
    };
    this.cache = new Map();
  }

  /**
   * Verify a single model's availability
   * Makes a lightweight request to check if model is accessible
   */
  async verifyModelAvailability(modelId: string): Promise<ModelAvailabilityResult> {
    // Check cache first
    if (this.options.cacheResults && this.cache.has(modelId)) {
      const cached = this.cache.get(modelId)!;
      // Cache is valid for 1 hour
      const age = Date.now() - cached.lastChecked.getTime();
      if (age < 3600000) {
        return cached;
      }
    }

    const result = await this.checkAvailability(modelId);

    // Cache the result
    if (this.options.cacheResults) {
      this.cache.set(modelId, result);
    }

    return result;
  }

  /**
   * Verify multiple models' availability
   * Returns a map of modelId -> availability result
   */
  async verifyModelsAvailability(modelIds: string[]): Promise<Record<string, ModelAvailabilityResult>> {
    const results: Record<string, ModelAvailabilityResult> = {};

    // Check all models in parallel for better performance
    const promises = modelIds.map(async (modelId) => {
      try {
        const result = await this.verifyModelAvailability(modelId);
        return { modelId, result };
      } catch (error) {
        // If verification fails, mark as unknown
        return {
          modelId,
          result: {
            available: false,
            modelId,
            reason: 'unknown' as const,
            suggestion: 'Could not verify availability',
            lastChecked: new Date(),
          },
        };
      }
    });

    const settled = await Promise.all(promises);

    for (const { modelId, result } of settled) {
      results[modelId] = result;
    }

    return results;
  }

  /**
   * Check availability of a specific model
   */
  private async checkAvailability(modelId: string): Promise<ModelAvailabilityResult> {
    try {
      const response = await this.makeVerificationRequest(modelId);
      return this.parseVerificationResponse(response, modelId);
    } catch (error) {
      return this.handleVerificationError(error, modelId);
    }
  }

  /**
   * Make a verification request
   * Uses a lightweight endpoint to check if model is accessible
   */
  private async makeVerificationRequest(modelId: string): Promise<Response> {
    const controller = createTimeoutController(this.options.timeout!);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    // Try to make a minimal chat completion request to verify model exists
    const response = await fetch(`${this.apiBase}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
      }),
      signal: controller.signal,
    });

    return response;
  }

  /**
   * Parse verification response
   */
  private async parseVerificationResponse(response: Response, modelId: string): Promise<ModelAvailabilityResult> {
    // Model is available if request succeeds
    if (response.ok) {
      return {
        available: true,
        modelId,
        lastChecked: new Date(),
      };
    }

    // Check for specific error types
    if (response.status === 404) {
      // Could be privacy settings or deprecated model
      return {
        available: false,
        modelId,
        reason: 'privacy_settings_required',
        suggestion: 'This model requires privacy settings to be enabled in your OpenRouter account. Visit https://openrouter.ai/settings/privacy to configure.',
        lastChecked: new Date(),
      };
    }

    if (response.status === 400) {
      try {
        const json = await response.json();
        const error = json;
        if (error.error?.message?.includes('privacy')) {
          return {
            available: false,
            modelId,
            reason: 'privacy_settings_required',
            suggestion: 'This model requires privacy settings to be enabled in your OpenRouter account.',
            lastChecked: new Date(),
          };
        }
      } catch {
        // Ignore JSON parse errors
      }
    }

    // Other errors - mark as unknown
    return {
      available: false,
      modelId,
      reason: 'unknown',
      suggestion: `Model returned status ${response.status}: ${response.statusText}`,
      lastChecked: new Date(),
    };
  }

  /**
   * Handle verification errors
   */
  private handleVerificationError(error: unknown, modelId: string): ModelAvailabilityResult {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          available: false,
          modelId,
          reason: 'unknown',
          suggestion: 'Availability check timed out. The model may be slow to respond.',
          lastChecked: new Date(),
        };
      }
    }

    return {
      available: false,
      modelId,
      reason: 'unknown',
      suggestion: sanitizeError(error),
      lastChecked: new Date(),
    };
  }

  /**
   * Get models that require privacy settings
   */
  getModelsRequiringPrivacySettings(models: OpenRouterModel[]): PrivacyRequirement[] {
    return models.map((model) => ({
      modelId: model.id,
      requiresPrivacySettings: true, // Assume all may need it
      settingsUrl: 'https://openrouter.ai/settings/privacy',
      description: `Enable ${model.name} in your OpenRouter privacy settings to use this model.`,
    }));
  }

  /**
   * Get alternative models for a given model
   */
  getAlternatives(modelId: string, allModels: OpenRouterModel[]): AlternativeModels {
    const originalModel = allModels.find((m) => m.id === modelId);

    if (!originalModel) {
      return {
        originalId: modelId,
        alternatives: [],
        reason: 'Original model not found',
      };
    }

    // Extract provider from model ID
    const provider = modelId.split('/')[0];

    // Find alternatives from same provider
    const alternatives = allModels.filter((m) => {
      if (m.id === modelId) return false;

      const mProvider = m.id.split('/')[0];

      // Same provider, similar modality
      return (
        mProvider === provider &&
        m.architecture?.modality === originalModel.architecture?.modality
      );
    });

    return {
      originalId: modelId,
      alternatives,
      reason: `Similar models from ${provider} with matching modality`,
    };
  }

  /**
   * Clear availability cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}
