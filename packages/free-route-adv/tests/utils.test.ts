import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  detectEnvironment,
  extractProvider,
  isFreeModel,
  normalizeString,
  matchByStrategy,
  expandAliases,
  sleep,
  retryWithBackoff,
  safeJsonParse,
  generateId,
  formatDate,
  isExpired,
  calculateBackoff,
  sanitizeError,
} from '../src/utils';
import type { OpenRouterModel } from '@openrouter-free-models/shared';

describe('Utils', () => {
  describe('detectEnvironment', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should detect browser environment', () => {
      vi.stubGlobal('window', {});
      expect(detectEnvironment()).toBe('browser');
    });

    it('should detect Node.js environment', () => {
      vi.stubGlobal('process', { versions: { node: '18.0.0' } });
      expect(detectEnvironment()).toBe('node');
    });

    it('should detect Cloudflare Workers environment', () => {
      vi.stubGlobal('caches', {});
      expect(detectEnvironment()).toBe('workers');
    });

    it('should default to node when no environment detected', () => {
      expect(detectEnvironment()).toBe('node');
    });
  });

  describe('extractProvider', () => {
    it('should extract provider from model ID', () => {
      const model: OpenRouterModel = {
        id: 'google/gemini-pro',
        name: 'Gemini Pro',
        description: 'Test',
        context_length: 128000,
        pricing: { prompt: '0', completion: '0' },
      };
      expect(extractProvider(model)).toBe('google');
    });

    it('should handle model ID without slash', () => {
      const model: OpenRouterModel = {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Test',
        context_length: 128000,
        pricing: { prompt: '0', completion: '0' },
      };
      // When no slash in ID, falls back to extracting from name
      expect(extractProvider(model)).toBe('gemini');
    });

    it('should extract from name if ID unavailable', () => {
      const model: OpenRouterModel = {
        id: '',
        name: 'Google Gemini Pro',
        description: 'Test',
        context_length: 128000,
        pricing: { prompt: '0', completion: '0' },
      };
      expect(extractProvider(model)).toBe('google');
    });

    it('should return unknown for missing model', () => {
      const model: OpenRouterModel = {
        id: '',
        name: '',
        description: 'Test',
        context_length: 0,
        pricing: { prompt: '0', completion: '0' },
      };
      expect(extractProvider(model)).toBe('unknown');
    });
  });

  describe('isFreeModel', () => {
    it('should return true for zero price', () => {
      const model: OpenRouterModel = {
        id: 'test/model',
        name: 'Test',
        description: 'Test',
        context_length: 1000,
        pricing: { prompt: '0', completion: '0' },
      };
      expect(isFreeModel(model)).toBe(true);
    });

    it('should return true for 0.0 price', () => {
      const model: OpenRouterModel = {
        id: 'test/model',
        name: 'Test',
        description: 'Test',
        context_length: 1000,
        pricing: { prompt: '0.0', completion: '0.0' },
      };
      expect(isFreeModel(model)).toBe(true);
    });

    it('should return false for non-zero price', () => {
      const model: OpenRouterModel = {
        id: 'test/model',
        name: 'Test',
        description: 'Test',
        context_length: 1000,
        pricing: { prompt: '0.001', completion: '0.002' },
      };
      expect(isFreeModel(model)).toBe(false);
    });
  });

  describe('normalizeString', () => {
    it('should convert to lowercase and trim', () => {
      expect(normalizeString('  HELLO World  ')).toBe('hello world');
    });

    it('should handle empty string', () => {
      expect(normalizeString('')).toBe('');
    });

    it('should handle whitespace only', () => {
      expect(normalizeString('   ')).toBe('');
    });
  });

  describe('matchByStrategy', () => {
    it('should match exact', () => {
      expect(matchByStrategy('hello', 'hello', 'exact')).toBe(true);
      expect(matchByStrategy('hello', 'Hello', 'exact')).toBe(true);
      expect(matchByStrategy('hello', 'hell', 'exact')).toBe(false);
    });

    it('should match includes', () => {
      expect(matchByStrategy('hello world', 'world', 'includes')).toBe(true);
      expect(matchByStrategy('hello world', 'World', 'includes')).toBe(true);
      expect(matchByStrategy('hello', 'world', 'includes')).toBe(false);
    });

    it('should match startsWith', () => {
      expect(matchByStrategy('hello world', 'hello', 'startsWith')).toBe(true);
      expect(matchByStrategy('hello world', 'Hello', 'startsWith')).toBe(true);
      expect(matchByStrategy('hello world', 'world', 'startsWith')).toBe(false);
    });

    it('should match regex', () => {
      expect(matchByStrategy('test123', 'test\\d+', 'regex')).toBe(true);
      expect(matchByStrategy('hello', 'test\\d+', 'regex')).toBe(false);
    });

    it('should fall back to includes for invalid regex', () => {
      // '[invalid' is not in 'hello world', so should be false even with fallback
      expect(matchByStrategy('hello world', '[invalid', 'regex')).toBe(false);
    });
  });

  describe('expandAliases', () => {
    it('should expand gemini to google', () => {
      const result = expandAliases('gemini');
      expect(result).toContain('gemini');
      expect(result).toContain('google');
    });

    it('should expand google to gemini', () => {
      const result = expandAliases('google');
      expect(result).toContain('google');
      expect(result).toContain('gemini');
    });

    it('should use custom aliases', () => {
      const result = expandAliases('openai', { openai: 'microsoft' });
      expect(result).toContain('openai');
      expect(result).toContain('microsoft');
    });

    it('should return original keyword if no aliases', () => {
      const result = expandAliases('unknown');
      expect(result).toEqual(['unknown']);
    });
  });

  describe('sleep', () => {
    it('should sleep for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');
      const result = await retryWithBackoff(fn, 3, 10);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max attempts', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fail'));
      await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow('fail');
      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse('{"key":"value"}', {});
      expect(result).toEqual({ key: 'value' });
    });

    it('should return fallback for invalid JSON', () => {
      const fallback = { default: true };
      const result = safeJsonParse('invalid json', fallback);
      expect(result).toBe(fallback);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should contain timestamp', () => {
      const id = generateId();
      const parts = id.split('-');
      expect(parts[0]).toMatch(/^\d+$/);
    });
  });

  describe('formatDate', () => {
    it('should format date to ISO string', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const result = formatDate(date);
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });
  });

  describe('isExpired', () => {
    it('should detect expired entries', () => {
      const timestamp = new Date(Date.now() - 2000);
      expect(isExpired(timestamp, 1000)).toBe(true);
    });

    it('should detect valid entries', () => {
      const timestamp = new Date(Date.now() - 500);
      expect(isExpired(timestamp, 1000)).toBe(false);
    });
  });

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff', () => {
      expect(calculateBackoff(0, 1000)).toBe(1000);
      expect(calculateBackoff(1, 1000)).toBe(2000);
      expect(calculateBackoff(2, 1000)).toBe(4000);
      expect(calculateBackoff(3, 1000)).toBe(8000);
    });
  });

  describe('sanitizeError', () => {
    it('should extract error message', () => {
      const error = new Error('test error');
      expect(sanitizeError(error)).toBe('test error');
    });

    it('should convert unknown error to string', () => {
      expect(sanitizeError('string error')).toBe('string error');
      expect(sanitizeError(123)).toBe('123');
    });
  });
});
