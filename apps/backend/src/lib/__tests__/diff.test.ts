import { describe, it, expect } from 'vitest';
import { DiffService } from '../diff';
import type { ModelRecord } from '@openrouter-free-models/shared';

describe('DiffService', () => {
  const service = new DiffService();

  const mockDbRecords: ModelRecord[] = [
    {
      id: 'model1:free',
      name: 'Model 1',
      description: 'Old description',
      context_length: 4096,
      pricing_prompt: '0',
      pricing_completion: '0',
      architecture: '{"modality":"text"}',
      first_seen_at: '2024-01-01T00:00:00Z',
      last_seen_at: '2024-01-01T00:00:00Z',
      is_active: true,
    },
    {
      id: 'model2:free',
      name: 'Model 2',
      description: 'Description',
      context_length: 8192,
      pricing_prompt: '0',
      pricing_completion: '0',
      architecture: '{"modality":"text"}',
      first_seen_at: '2024-01-01T00:00:00Z',
      last_seen_at: '2024-01-01T00:00:00Z',
      is_active: true,
    },
  ];

  const mockApiModels = [
    {
      id: 'model1:free',
      name: 'Model 1',
      description: 'New description',
      context_length: 4096,
      pricing: { prompt: '0', completion: '0' },
      architecture: { modality: 'text' },
    },
    {
      id: 'model3:free',
      name: 'Model 3',
      description: 'New model',
      context_length: 16384,
      pricing: { prompt: '0', completion: '0' },
      architecture: { modality: 'text+image' },
    },
  ];

  it('should detect added models', () => {
    const diff = service.detectChanges(mockDbRecords, mockApiModels);

    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].id).toBe('model3:free');
  });

  it('should detect removed models', () => {
    const diff = service.detectChanges(mockDbRecords, mockApiModels);

    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].id).toBe('model2:free');
  });

  it('should detect modified models', () => {
    const diff = service.detectChanges(mockDbRecords, mockApiModels);

    expect(diff.modified).toHaveLength(1);
    expect(diff.modified[0].old.id).toBe('model1:free');
    expect(diff.modified[0].new.id).toBe('model1:free');
    expect(diff.modified[0].old.description).toBe('Old description');
    expect(diff.modified[0].new.description).toBe('New description');
  });

  it('should handle empty lists', () => {
    const diff = service.detectChanges([], []);

    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });

  it('should handle all new models', () => {
    const diff = service.detectChanges([], mockApiModels);

    expect(diff.added).toHaveLength(2);
    expect(diff.removed).toHaveLength(0);
    expect(diff.modified).toHaveLength(0);
  });

  it('should handle all removed models', () => {
    const diff = service.detectChanges(mockDbRecords, []);

    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(2);
    expect(diff.modified).toHaveLength(0);
  });
});
