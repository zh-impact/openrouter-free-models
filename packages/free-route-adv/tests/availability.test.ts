import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AvailabilityChecker } from '../src/availability';
import { createMockModel } from './test-utils';

describe('AvailabilityChecker', () => {
  let checker: AvailabilityChecker;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    checker = new AvailabilityChecker('https://api.example.com');
  });

  describe('verifyModelAvailability', () => {
    it('should return available for successful request', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const result = await checker.verifyModelAvailability('google/gemini-pro');

      expect(result.available).toBe(true);
      expect(result.modelId).toBe('google/gemini-pro');
      expect(result.lastChecked).toBeInstanceOf(Date);
    });

    it('should return privacy_settings_required for 404', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await checker.verifyModelAvailability('google/gemini-pro');

      expect(result.available).toBe(false);
      expect(result.reason).toBe('privacy_settings_required');
      expect(result.suggestion).toContain('privacy settings');
    });

    it('should return privacy_settings_required for 400 with privacy error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: 'This model requires privacy settings to be enabled',
          },
        }),
      });

      const result = await checker.verifyModelAvailability('google/gemini-pro');

      expect(result.available).toBe(false);
      expect(result.reason).toBe('privacy_settings_required');
      expect(result.suggestion).toContain('privacy settings');
    });

    it('should return unknown for other errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await checker.verifyModelAvailability('google/gemini-pro');

      expect(result.available).toBe(false);
      expect(result.reason).toBe('unknown');
      expect(result.suggestion).toContain('500');
    });

    it('should return unknown for timeout', async () => {
      mockFetch.mockRejectedValue(new Error('Request timeout'));

      const result = await checker.verifyModelAvailability('google/gemini-pro');

      expect(result.available).toBe(false);
      expect(result.reason).toBe('unknown');
      expect(result.suggestion).toContain('timeout');
    });

    it('should cache results when enabled', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const cachingChecker = new AvailabilityChecker(
        'https://api.example.com',
        undefined,
        { cacheResults: true }
      );

      // First call
      await cachingChecker.verifyModelAvailability('google/gemini-pro');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await cachingChecker.verifyModelAvailability('google/gemini-pro');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Different model should trigger new request
      await cachingChecker.verifyModelAvailability('anthropic/claude');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('verifyModelsAvailability', () => {
    it('should verify multiple models', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const results = await checker.verifyModelsAvailability([
        'google/gemini-pro',
        'anthropic/claude',
      ]);

      expect(results).toHaveProperty('google/gemini-pro');
      expect(results).toHaveProperty('anthropic/claude');
      expect(results['google/gemini-pro'].available).toBe(true);
      expect(results['anthropic/claude'].available).toBe(true);
    });

    it('should handle partial failures', async () => {
      let callCount = 0;
      mockFetch.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ choices: [] }),
          };
        } else {
          throw new Error('Network error');
        }
      });

      const results = await checker.verifyModelsAvailability([
        'google/gemini-pro',
        'anthropic/claude',
      ]);

      expect(results['google/gemini-pro'].available).toBe(true);
      expect(results['anthropic/claude'].available).toBe(false);
      expect(results['anthropic/claude'].reason).toBe('unknown');
    });

    it('should make requests in parallel', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const startTime = Date.now();
      await checker.verifyModelsAvailability(['model-1', 'model-2', 'model-3']);
      const elapsed = Date.now() - startTime;

      // Should complete in roughly the time of one request, not sequential
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('getModelsRequiringPrivacySettings', () => {
    it('should return privacy requirements for models', () => {
      const models = [
        createMockModel({ id: 'google/gemini-pro', name: 'Gemini Pro' }),
        createMockModel({ id: 'anthropic/claude', name: 'Claude' }),
      ];

      const requirements = checker.getModelsRequiringPrivacySettings(models);

      expect(requirements).toHaveLength(2);
      expect(requirements[0].modelId).toBe('google/gemini-pro');
      expect(requirements[0].requiresPrivacySettings).toBe(true);
      expect(requirements[0].settingsUrl).toContain('openrouter.ai');
    });
  });

  describe('getAlternatives', () => {
    it('should find alternatives from same provider', () => {
      const allModels = [
        createMockModel({ id: 'google/gemini-pro', name: 'Gemini Pro', architecture: { modality: 'text' } }),
        createMockModel({ id: 'google/gemini-flash', name: 'Gemini Flash', architecture: { modality: 'text' } }),
        createMockModel({ id: 'anthropic/claude', name: 'Claude', architecture: { modality: 'text' } }),
      ];

      const alternatives = checker.getAlternatives('google/gemini-pro', allModels);

      expect(alternatives.originalId).toBe('google/gemini-pro');
      expect(alternatives.alternatives).toHaveLength(1);
      expect(alternatives.alternatives[0].id).toBe('google/gemini-flash');
      expect(alternatives.reason).toContain('google');
    });

    it('should return empty alternatives for non-existent model', () => {
      const allModels = [
        createMockModel({ id: 'google/gemini-pro', name: 'Gemini Pro' }),
      ];

      const alternatives = checker.getAlternatives('nonexistent/model', allModels);

      expect(alternatives.originalId).toBe('nonexistent/model');
      expect(alternatives.alternatives).toHaveLength(0);
      expect(alternatives.reason).toContain('not found');
    });

    it('should match by modality', () => {
      const allModels = [
        createMockModel({ id: 'google/gemini-pro', name: 'Gemini Pro', architecture: { modality: 'text' } }),
        createMockModel({ id: 'google/gemma-vision', name: 'Gemma Vision', architecture: { modality: 'text+image' } }),
        createMockModel({ id: 'google/gemini-flash', name: 'Gemini Flash', architecture: { modality: 'text' } }),
      ];

      const alternatives = checker.getAlternatives('google/gemini-pro', allModels);

      expect(alternatives.alternatives).toHaveLength(1);
      expect(alternatives.alternatives[0].id).toBe('google/gemini-flash');
      expect(alternatives.alternatives[0].architecture?.modality).toBe('text');
    });
  });

  describe('cache management', () => {
    it('should clear cache', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const cachingChecker = new AvailabilityChecker(
        'https://api.example.com',
        undefined,
        { cacheResults: true }
      );

      await cachingChecker.verifyModelAvailability('google/gemini-pro');
      expect(cachingChecker.getCacheSize()).toBe(1);

      cachingChecker.clearCache();
      expect(cachingChecker.getCacheSize()).toBe(0);
    });

    it('should report cache size', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const cachingChecker = new AvailabilityChecker(
        'https://api.example.com',
        undefined,
        { cacheResults: true }
      );

      expect(cachingChecker.getCacheSize()).toBe(0);

      await cachingChecker.verifyModelAvailability('google/gemini-pro');
      expect(cachingChecker.getCacheSize()).toBe(1);

      await cachingChecker.verifyModelAvailability('anthropic/claude');
      expect(cachingChecker.getCacheSize()).toBe(2);
    });
  });

  describe('configuration', () => {
    it('should handle timeout configuration', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      // Create checker with short timeout
      const quickChecker = new AvailabilityChecker(
        'https://api.example.com',
        undefined,
        { timeout: 100 }
      );

      const result = await quickChecker.verifyModelAvailability('google/gemini-pro');
      // With mock fetch returning immediately, timeout won't be triggered
      expect(result.available).toBe(true);
    });

    it('should include API key in requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [] }),
      });

      const authChecker = new AvailabilityChecker(
        'https://api.example.com',
        'test-api-key'
      );

      await authChecker.verifyModelAvailability('google/gemini-pro');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('chat/completions'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });
  });
});
