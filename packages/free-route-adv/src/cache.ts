import type { CacheOptions, CacheStats } from './types';
import { isExpired } from './utils';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  value: T;
  timestamp: Date;
  accessCount: number;
  lastAccess: Date;
}

/**
 * LRU (Least Recently Used) Cache implementation
 */
export class ModelCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private options: Required<CacheOptions>;
  private hits: number;
  private misses: number;

  constructor(options: CacheOptions) {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this.options = {
      enabled: options.enabled ?? true,
      ttl: options.ttl ?? 300000, // 5 minutes default
      maxSize: options.maxSize ?? 100,
    };
  }

  /**
   * Get a value from cache
   * Returns null if not found or expired
   */
  get(key: string): T | null {
    if (!this.options.enabled) {
      return null;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (isExpired(entry.timestamp, this.options.ttl)) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update access metadata for LRU
    entry.accessCount++;
    entry.lastAccess = new Date();
    this.hits++;

    return entry.value;
  }

  /**
   * Set a value in cache
   * Evicts oldest entry if at maxSize
   */
  set(key: string, value: T): void {
    if (!this.options.enabled) {
      return;
    }

    // Evict oldest entry if at max size
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: new Date(),
      accessCount: 0,
      lastAccess: new Date(),
    });
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    if (!this.options.enabled) {
      return false;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    if (isExpired(entry.timestamp, this.options.ttl)) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      lastUpdate: this.getLatestTimestamp(),
      hits: this.hits,
      misses: this.misses,
    };
  }

  /**
   * Get the most recent timestamp from cache entries
   */
  private getLatestTimestamp(): Date {
    let latest = new Date(0);

    for (const entry of this.cache.values()) {
      if (entry.timestamp > latest) {
        latest = entry.timestamp;
      }
    }

    return latest;
  }

  /**
   * Evict the oldest (least recently used) entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestAccess: Date | null = null;

    for (const [key, entry] of this.cache.entries()) {
      if (oldestAccess === null || entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Remove all expired entries
   */
  cleanExpired(): number {
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (isExpired(entry.timestamp, this.options.ttl)) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Check if cache is enabled
   */
  get isEnabled(): boolean {
    return this.options.enabled;
  }

  /**
   * Update cache options
   */
  updateOptions(options: Partial<CacheOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }
}
