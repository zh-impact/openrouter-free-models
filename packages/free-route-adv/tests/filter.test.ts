import { describe, it, expect } from 'vitest';
import { ModelFilter, FilterChain } from '../src/filter';
import type { OpenRouterModel } from '@openrouter-free-models/shared';
import { createMockModel, createMockModels } from './test-utils';

describe('ModelFilter', () => {
  const models: OpenRouterModel[] = createMockModels(10);

  describe('byProviders', () => {
    it('should filter by single provider', () => {
      const filter = new ModelFilter(models);
      const result = filter.byProviders(['google']);
      expect(result.every((m) => m.id.startsWith('google/'))).toBe(true);
    });

    it('should filter by multiple providers', () => {
      const filter = new ModelFilter(models);
      const result = filter.byProviders(['google', 'anthropic']);
      expect(result.every((m) => m.id.startsWith('google/') || m.id.startsWith('anthropic/'))).toBe(true);
    });

    it('should handle empty provider list', () => {
      const filter = new ModelFilter(models);
      const result = filter.byProviders([]);
      expect(result).toEqual(models);
    });

    it('should use aliases', () => {
      const filter = new ModelFilter(models, { gemini: 'google' });
      const result = filter.byProviders(['gemini']);
      expect(result.every((m) => m.id.startsWith('google/'))).toBe(true);
    });
  });

  describe('byModality', () => {
    it('should filter by text modality', () => {
      const filter = new ModelFilter(models);
      const result = filter.byModality('text');
      expect(result.every((m) => m.architecture?.modality === 'text')).toBe(true);
    });

    it('should filter by text+image modality', () => {
      const filter = new ModelFilter(models);
      const result = filter.byModality('text+image');
      expect(result.every((m) => m.architecture?.modality === 'text+image')).toBe(true);
    });

    it('should handle empty modality', () => {
      const filter = new ModelFilter(models);
      const result = filter.byModality('');
      expect(result).toEqual(models);
    });
  });

  describe('byContextLength', () => {
    it('should filter by minimum context length', () => {
      const filter = new ModelFilter(models);
      const result = filter.byContextLength(35000);
      expect(result.every((m) => (m.context_length || 0) >= 35000)).toBe(true);
    });

    it('should filter by maximum context length', () => {
      const filter = new ModelFilter(models);
      const result = filter.byContextLength(undefined, 35000);
      expect(result.every((m) => (m.context_length || 0) <= 35000)).toBe(true);
    });

    it('should filter by range', () => {
      const filter = new ModelFilter(models);
      const result = filter.byContextLength(33000, 36000);
      expect(result.every((m) => {
        const len = m.context_length || 0;
        return len >= 33000 && len <= 36000;
      })).toBe(true);
    });

    it('should handle no bounds', () => {
      const filter = new ModelFilter(models);
      const result = filter.byContextLength();
      expect(result).toEqual(models);
    });
  });

  describe('byKeyword', () => {
    it('should match by exact strategy', () => {
      const filter = new ModelFilter(models);
      const result = filter.byKeyword('google/model-0', 'exact');
      expect(result.some((m) => m.id === 'google/model-0')).toBe(true);
    });

    it('should match by includes strategy', () => {
      const filter = new ModelFilter(models);
      const result = filter.byKeyword('model', 'includes');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should match by startsWith strategy', () => {
      const filter = new ModelFilter(models);
      const result = filter.byKeyword('google/', 'startsWith');
      expect(result.every((m) => m.id.startsWith('google/'))).toBe(true);
    });

    it('should search in name and description', () => {
      const filter = new ModelFilter(models);
      const result = filter.byKeyword('GOOGLE', 'includes');
      expect(result.some((m) => m.name.includes('GOOGLE') || m.description.includes('google'))).toBe(true);
    });

    it('should be case insensitive', () => {
      const filter = new ModelFilter(models);
      const result1 = filter.byKeyword('GOOGLE', 'includes');
      const result2 = filter.byKeyword('google', 'includes');
      expect(result1.length).toBe(result2.length);
    });
  });

  describe('apply', () => {
    it('should apply multiple filters', () => {
      const filter = new ModelFilter(models);
      const result = filter.apply({
        providers: ['google'],
        modality: 'text',
        minContextLength: 32000,
      });
      expect(result.every((m) => {
        return (
          m.id.startsWith('google/') &&
          m.architecture?.modality === 'text' &&
          (m.context_length || 0) >= 32000
        );
      })).toBe(true);
    });

    it('should return all models when no filters', () => {
      const filter = new ModelFilter(models);
      const result = filter.apply({});
      expect(result).toEqual(models);
    });

    it('should return empty array when no matches', () => {
      const filter = new ModelFilter(models);
      const result = filter.apply({
        providers: ['nonexistent'],
      });
      expect(result).toEqual([]);
    });
  });
});

describe('FilterChain', () => {
  const models: OpenRouterModel[] = createMockModels(10);

  it('should chain provider and modality filters', async () => {
    const chain = new FilterChain(models);
    const result = await chain.filterByProviders(['google']).filterByModality('text').exec();
    expect(result.every((m) => m.id.startsWith('google/') && m.architecture?.modality === 'text')).toBe(true);
  });

  it('should chain context length filters', async () => {
    const chain = new FilterChain(models);
    const result = await chain.filterByMinContextLength(33000).filterByMaxContextLength(36000).exec();
    expect(result.every((m) => {
      const len = m.context_length || 0;
      return len >= 33000 && len <= 36000;
    })).toBe(true);
  });

  it('should chain keyword filters', async () => {
    const chain = new FilterChain(models);
    const result = await chain.filterByKeyword('model', 'includes').exec();
    expect(result.length).toBeGreaterThan(0);
  });

  it('should reset filters', async () => {
    const chain = new FilterChain(models);
    await chain.filterByProviders(['google']);
    chain.reset();
    const result = await chain.exec();
    expect(result).toEqual(models);
  });

  it('should get current filters', () => {
    const chain = new FilterChain(models);
    chain.filterByProviders(['google']);
    const filters = chain.getFilters();
    expect(filters.providers).toEqual(['google']);
  });

  it('should handle complex chains', async () => {
    const chain = new FilterChain(models);
    const result = await chain
      .filterByProviders(['google', 'anthropic'])
      .filterByModality('text')
      .filterByMinContextLength(32000)
      .filterByKeyword('model', 'includes')
      .exec();

    expect(result.every((m) => {
      const isProvider = m.id.startsWith('google/') || m.id.startsWith('anthropic/');
      return (
        isProvider &&
        m.architecture?.modality === 'text' &&
        (m.context_length || 0) >= 32000
      );
    })).toBe(true);
  });
});
