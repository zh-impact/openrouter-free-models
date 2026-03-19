import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ModelCache } from '../src/cache';
import type { CacheOptions } from '../src/types';

describe('ModelCache', () => {
  let cache: ModelCache<string>;

  beforeEach(() => {
    const options: CacheOptions = {
      enabled: true,
      ttl: 1000,
      maxSize: 3,
    };
    cache = new ModelCache(options);
  });

  describe('basic operations', () => {
    it('should store and retrieve values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should delete specific keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.delete('key1');
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.size).toBe(0);
    });
  });

  describe('TTL expiration', () => {
    it('should expire entries after TTL', async () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(cache.get('key1')).toBeNull();
    });

    it('should not expire entries before TTL', async () => {
      cache.set('key1', 'value1');
      await new Promise((resolve) => setTimeout(resolve, 500));
      expect(cache.get('key1')).toBe('value1');
    });
  });

  describe('LRU eviction', () => {
    it('should evict oldest entry when at max size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      // Cache is now at max size (3)

      // This should evict key1
      cache.set('key4', 'value4');

      expect(cache.size).toBe(3);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update access order on get', async () => {
      cache.set('key1', 'value1');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      cache.set('key2', 'value2');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      cache.set('key3', 'value3');

      // Access key1 to make it more recently used
      cache.get('key1');

      // Add key4, should evict key2 (least recently used)
      cache.set('key4', 'value4');

      expect(cache.get('key1')).toBe('value1'); // Still present (was accessed)
      expect(cache.get('key2')).toBeNull(); // Evicted (oldest, not accessed)
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });
  });

  describe('cache statistics', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'value1');

      cache.get('key1'); // hit
      cache.get('key2'); // miss
      cache.get('key1'); // hit
      cache.get('key3'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
    });

    it('should track cache size', () => {
      expect(cache.size).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);
    });

    it('should report last update timestamp', () => {
      const beforeSet = new Date();
      cache.set('key1', 'value1');
      const afterSet = new Date();

      const stats = cache.getStats();
      expect(stats.lastUpdate.getTime()).toBeGreaterThanOrEqual(beforeSet.getTime());
      expect(stats.lastUpdate.getTime()).toBeLessThanOrEqual(afterSet.getTime());
    });
  });

  describe('disabled cache', () => {
    it('should not store when disabled', () => {
      const disabledCache = new ModelCache({ enabled: false, ttl: 1000, maxSize: 10 });
      disabledCache.set('key1', 'value1');
      expect(disabledCache.get('key1')).toBeNull();
    });

    it('should report isEnabled correctly', () => {
      const disabledCache = new ModelCache({ enabled: false, ttl: 1000, maxSize: 10 });
      expect(disabledCache.isEnabled).toBe(false);
      expect(cache.isEnabled).toBe(true);
    });
  });

  describe('cleanExpired', () => {
    it('should remove all expired entries', async () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const removed = cache.cleanExpired();
      expect(removed).toBe(2);
      expect(cache.size).toBe(0);
    });

    it('should not remove unexpired entries', async () => {
      cache.set('key1', 'value1');
      await new Promise((resolve) => setTimeout(resolve, 500));

      const removed = cache.cleanExpired();
      expect(removed).toBe(0);
      expect(cache.size).toBe(1);
    });
  });

  describe('updateOptions', () => {
    it('should update cache options', () => {
      cache.updateOptions({ maxSize: 5 });

      // Should be able to store more entries
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');

      expect(cache.size).toBe(4);
    });
  });
});
