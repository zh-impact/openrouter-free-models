import { ModelCard } from './ModelCard';
import type { OpenRouterModel } from '@openrouter-free-models/shared';

interface ModelListProps {
  models: OpenRouterModel[];
  loading: boolean;
  error: string | null;
}

export function ModelList({ models, loading, error }: ModelListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2">Error loading models</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-gray-600 dark:text-gray-400 mb-2">No free models found</div>
        <p className="text-sm text-gray-500 dark:text-gray-500">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {models.map((model) => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}
