import { useState, useEffect } from 'react';
import type { OpenRouterModel } from '@openrouter-free-models/shared';

interface UseModelsResult {
  models: OpenRouterModel[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
}

export function useModels(useCache = false): UseModelsResult {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = useCache ? '/api/models/cached' : '/api/models';
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setModels(data.models || []);
      setLastUpdated(data.last_updated || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshModels = async () => {
    try {
      const response = await fetch('/api/models/refresh', { method: 'POST' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        await fetchModels();
      } else {
        throw new Error(data.message || 'Failed to refresh models');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh models');
      console.error('Error refreshing models:', err);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [useCache]);

  return {
    models,
    loading,
    error,
    lastUpdated,
    refresh: refreshModels,
  };
}
