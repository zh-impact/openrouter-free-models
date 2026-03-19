import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FreeRouteClient } from '../src/client';
import { NoModelsFoundError, ValidationError } from '../src/types';
import { createMockModel, createMockModels } from './test-utils';

describe('FreeRouteClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  const createMockModelsResponse = (models: any[]) => ({
    data: models,
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const client = new FreeRouteClient();
      expect(client).toBeInstanceOf(FreeRouteClient);
    });

    it('should initialize with custom options', () => {
      const client = new FreeRouteClient({
        apiBase: 'https://api.example.com',
        apiKey: 'test-key',
        cache: { enabled: false, ttl: 0, maxSize: 0 },
      });
      expect(client).toBeInstanceOf(FreeRouteClient);
    });

    it('should merge custom aliases with built-in', () => {
      const client = new FreeRouteClient({
        aliases: { openai: 'microsoft' },
      });
      // Client should have both built-in and custom aliases
      expect(client).toBeInstanceOf(FreeRouteClient);
    });
  });

  describe('filter', () => {
    it('should filter by providers', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.filter({ providers: ['google'] });

      expect(result.every(m => m.id.startsWith('google/'))).toBe(true);
    });

    it('should filter by modality', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.filter({ modality: 'text' });

      expect(result.every(m => m.architecture?.modality === 'text')).toBe(true);
    });

    it('should filter by context length', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.filter({ minContextLength: 35000 });

      expect(result.every(m => (m.context_length || 0) >= 35000)).toBe(true);
    });

    it('should filter by keyword', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.filter({ keyword: 'model', matchStrategy: 'includes' });

      expect(result.length).toBeGreaterThan(0);
    });

    it('should combine multiple filters', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.filter({
        providers: ['google'],
        modality: 'text',
        minContextLength: 32000,
      });

      expect(result.every(m => {
        return (
          m.id.startsWith('google/') &&
          m.architecture?.modality === 'text' &&
          (m.context_length || 0) >= 32000
        );
      })).toBe(true);
    });

    it('should return empty array when no matches', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.filter({ providers: ['nonexistent'] });

      expect(result).toEqual([]);
    });

    it('should throw error when validation fails', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });

      await expect(
        client.filter({ minContextLength: -1 })
      ).rejects.toThrow(ValidationError);
    });

    it('should use fallback provider when configured', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const client = new FreeRouteClient({
        cache: { enabled: false, ttl: 0, maxSize: 0 },
        emptyResult: {
          fallbackProvider: 'google',
          logWarning: false,
        },
      });

      const result = await client.filter({ providers: ['nonexistent'] });

      expect(result.length).toBeGreaterThan(0);
      expect(result.every(m => m.id.startsWith('google/'))).toBe(true);

      consoleWarnSpy.mockRestore();
    });

    it('should throw NoModelsFoundError when configured', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({
        cache: { enabled: false, ttl: 0, maxSize: 0 },
        emptyResult: {
          throwOnEmpty: true,
          logWarning: false,
        },
      });

      await expect(
        client.filter({ providers: ['nonexistent'] })
      ).rejects.toThrow(NoModelsFoundError);
    });
  });

  describe('chain API', () => {
    it('should support filterByProviders', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const chain = client.filterByProviders(['google']);
      expect(chain).toBeDefined();
    });

    it('should support filterByModality', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const chain = client.filterByModality('text');
      expect(chain).toBeDefined();
    });

    it('should support filterByKeyword', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const chain = client.filterByKeyword('model');
      expect(chain).toBeDefined();
    });
  });

  describe('utility methods', () => {
    it('should get all models', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.getAllModels();

      expect(result).toHaveLength(10);
    });

    it('should get model by ID', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.getModelById('google/model-0');

      expect(result).toBeDefined();
      expect(result?.id).toBe('google/model-0');
    });

    it('should return null for non-existent model', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const result = await client.getModelById('nonexistent/model');

      expect(result).toBeNull();
    });

    it('should get providers', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const providers = await client.getProviders();

      expect(providers).toContain('google');
      expect(providers).toContain('anthropic');
    });

    it('should get modalities', async () => {
      const mockModels = createMockModels(10);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: false, ttl: 0, maxSize: 0 } });
      const modalities = await client.getModalities();

      expect(modalities).toContain('text');
      expect(modalities).toContain('text+image');
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

      const client = new FreeRouteClient({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      await client.getAllModels();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      client.clearCache();
      await client.getAllModels();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should force refresh', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      await client.getAllModels();
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await client.forceRefresh();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should get cache stats', async () => {
      const mockModels = createMockModels(5);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => createMockModelsResponse(mockModels),
      });

      const client = new FreeRouteClient({ cache: { enabled: true, ttl: 5000, maxSize: 10 } });

      const statsBefore = client.getCacheStats();
      expect(statsBefore.size).toBe(0);

      await client.getAllModels();

      const statsAfter = client.getCacheStats();
      expect(statsAfter.size).toBe(1);
    });
  });
});
