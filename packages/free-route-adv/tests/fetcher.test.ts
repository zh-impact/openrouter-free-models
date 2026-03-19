import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ModelFetcher } from '../src/fetcher';
import { FetchError, RateLimitError, AuthenticationError } from '../src/types';
import { createMockModel, createMockModels } from './test-utils';

describe('ModelFetcher', () => {
  let fetcher: ModelFetcher;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock global fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  const createMockModelsResponse = (models: any[]) => ({
    data: models,
  });

  describe('fetchModels', () => {
    it('should fetch models from API', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      fetcher = new ModelFetcher({ apiBase: '/api/models', cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await fetcher.fetchModels();

      expect(result).toEqual(mockModels);
      expect(mockFetch).toHaveBeenCalledWith('/api/models', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }));
    });

    it('should filter free models', async () => {
      const mixedModels = [
        createMockModel({ id: 'free/model', pricing: { prompt: '0', completion: '0' } }),
        createMockModel({ id: 'paid/model', pricing: { prompt: '0.001', completion: '0.002' } }),
        createMockModel({ id: 'free/model2', pricing: { prompt: '0', completion: '0' } }),
      ];
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mixedModels),
      });

      fetcher = new ModelFetcher({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await fetcher.fetchModels();

      expect(result).toHaveLength(2);
      expect(result.every(m => m.pricing.prompt === '0')).toBe(true);
    });

    it('should use cached models', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      fetcher = new ModelFetcher({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      // First call
      await fetcher.fetchModels();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await fetcher.fetchModels();
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should add authorization header when API key provided', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      fetcher = new ModelFetcher({
        apiBase: 'https://api.example.com/models',
        apiKey: 'test-key',
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      });

      await fetcher.fetchModels();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
          }),
        })
      );
    });
  });

  describe('error handling', () => {
    it('should throw AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      fetcher = new ModelFetcher({ cache: { enabled: false, ttl: 0, maxSize: 0 } });

      await expect(fetcher.fetchModels()).rejects.toThrow(AuthenticationError);
    });

    it('should throw RateLimitError on 429', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: (name: string) => name === 'Retry-After' ? '60' : null,
        },
      });

      fetcher = new ModelFetcher({ cache: { enabled: false, ttl: 0, maxSize: 0 } });

      try {
        await fetcher.fetchModels();
        expect.fail('Should have thrown RateLimitError');
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).retryAfter).toBe(60);
      }
    });

    it('should throw FetchError on network error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      fetcher = new ModelFetcher({ cache: { enabled: false, ttl: 0, maxSize: 0 } });

      await expect(fetcher.fetchModels()).rejects.toThrow(FetchError);
    });

    it('should throw FetchError on timeout', async () => {
      mockFetch.mockRejectedValue(new Error('Request timeout'));

      fetcher = new ModelFetcher({
        cache: { enabled: false, ttl: 0, maxSize: 0 },
        timeout: 1000,
      });

      await expect(fetcher.fetchModels()).rejects.toThrow(FetchError);
    });

    it('should retry on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => createMockModelsResponse(createMockModels(5)),
        });

      fetcher = new ModelFetcher({
        cache: { enabled: false, ttl: 0, maxSize: 0 },
        retryAttempts: 3,
      });

      const result = await fetcher.fetchModels();
      expect(result).toHaveLength(5);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('forceRefresh', () => {
    it('should bypass cache', async () => {
      const mockModels1 = createMockModels(5);
      const mockModels2 = createMockModels(3);
      let callCount = 0;

      mockFetch.mockImplementation(async () => {
        callCount++;
        return {
          ok: true,
          status: 200,
          json: async () => createMockModelsResponse(callCount === 1 ? mockModels1 : mockModels2),
        };
      });

      fetcher = new ModelFetcher({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      // First call
      const result1 = await fetcher.fetchModels();
      expect(result1).toHaveLength(5);

      // Second call (uses cache)
      const result2 = await fetcher.fetchModels();
      expect(result2).toHaveLength(5);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Force refresh
      const result3 = await fetcher.forceRefresh();
      expect(result3).toHaveLength(3);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('cache control', () => {
    it('should clear cache', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      fetcher = new ModelFetcher({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      await fetcher.fetchModels();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      fetcher.clearCache();
      await fetcher.fetchModels();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should return cache stats', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      fetcher = new ModelFetcher({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      const statsBefore = fetcher.getCacheStats();
      expect(statsBefore.size).toBe(0);

      await fetcher.fetchModels();

      const statsAfter = fetcher.getCacheStats();
      expect(statsAfter.size).toBe(1);
    });

    it('should report cache enabled status', () => {
      const fetcher1 = new ModelFetcher({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });
      expect(fetcher1.isCacheEnabled).toBe(true);

      const fetcher2 = new ModelFetcher({ cache: { enabled: false, ttl: 5000, maxSize: 10 } });
      expect(fetcher2.isCacheEnabled).toBe(false);
    });
  });
});
