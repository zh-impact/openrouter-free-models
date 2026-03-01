import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterService } from '../openrouter';

describe('OpenRouterService', () => {
  let service: OpenRouterService;

  beforeEach(() => {
    service = new OpenRouterService('test-api-key');
    global.fetch = vi.fn();
  });

  it('should fetch all models successfully', async () => {
    const mockModels = [
      {
        id: 'openai/gpt-3.5-turbo:free',
        name: 'GPT-3.5 Turbo (Free)',
        description: 'A fast, efficient model',
        context_length: 4096,
        pricing: { prompt: '0', completion: '0' },
      },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockModels }),
    } as Response);

    const models = await service.fetchAllModels();

    expect(models).toEqual(mockModels);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-api-key',
        }),
      })
    );
  });

  it('should filter free models', async () => {
    const mockModels = [
      { id: 'openai/gpt-3.5-turbo:free', name: 'Free Model' },
      { id: 'openai/gpt-4', name: 'Paid Model' },
      { id: 'anthropic/claude-2:free', name: 'Another Free Model' },
    ];

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockModels }),
    } as Response);

    const freeModels = await service.fetchFreeModels();

    expect(freeModels).toHaveLength(2);
    expect(freeModels[0].id).toBe('openai/gpt-3.5-turbo:free');
    expect(freeModels[1].id).toBe('anthropic/claude-2:free');
  });

  it('should handle fetch errors', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    await expect(service.fetchAllModels()).rejects.toThrow();
  });

  it('should retry on failure', async () => {
    vi.mocked(global.fetch)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response);

    const models = await service.fetchWithRetry(3, 10);

    expect(models).toEqual([]);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
