import { useState, useEffect } from 'react';
import type { ModelChangeWithDetails } from '@openrouter-free-models/shared';

interface UseChangesResult {
  changes: ModelChangeWithDetails[];
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useChanges(_initialLimit = 50): UseChangesResult {
  const [changes, setChanges] = useState<ModelChangeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchChanges = async (currentOffset = 0) => {
    if (loading && currentOffset > 0) return;

    try {
      const response = await fetch(`/api/models/changes?limit=50&offset=${currentOffset}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (currentOffset === 0) {
        setChanges(data.changes || []);
      } else {
        setChanges((prev) => [...prev, ...(data.changes || [])]);
      }

      setHasMore((data.changes || []).length === 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch changes');
      console.error('Error fetching changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const newOffset = offset + 50;
    setOffset(newOffset);
    await fetchChanges(newOffset);
  };

  useEffect(() => {
    fetchChanges();
  }, []);

  return {
    changes,
    loading,
    error,
    loadMore,
    hasMore,
  };
}
