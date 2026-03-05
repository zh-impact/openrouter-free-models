import { useState } from 'react';
import { ModelCard } from './ModelCard';
import type { OpenRouterModel } from '@openrouter-free-models/shared';
import { OPENROUTER_MODEL_URL } from '@openrouter-free-models/shared';

type ViewMode = 'grid' | 'list';

interface ModelListProps {
  models: OpenRouterModel[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
}

export function ModelList({ models, loading, error, viewMode }: ModelListProps) {
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

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {models.map((model) => (
          <ModelListItem key={model.id} model={model} />
        ))}
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

interface ModelListItemProps {
  model: OpenRouterModel;
}

function ModelListItem({ model }: ModelListItemProps) {
  const [copied, setCopied] = useState(false);

  const modality = model.architecture?.modality || 'text';
  const modalityColors: Record<string, string> = {
    text: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'text+image': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'text+video': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    image: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  const modalityIcons: Record<string, string> = {
    text: '📝',
    'text+image': '🖼️',
    'text+video': '🎬',
    image: '🖼️',
  };

  const formatPrice = (price: string) => {
    if (price === '0' || price === '0.0' || price === '0.00') {
      return 'Free';
    }
    return `$${price}`;
  };

  const modelUrl = OPENROUTER_MODEL_URL(model.id);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(model.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <a
            href={modelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {model.name}
          </a>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${modalityColors[modality] || modalityColors.text}`}>
              {modalityIcons[modality] || '📝'} {modality}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
          {model.description || 'No description available'}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {model.context_length.toLocaleString()} tokens
          </span>
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatPrice(model.pricing.prompt)} / {formatPrice(model.pricing.completion)}
          </span>
        </div>

        <div className="flex items-center gap-2 self-start">
          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded truncate max-w-[200px] sm:max-w-[300px]">
            {model.id}
          </code>
          <button
            onClick={handleCopyId}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title={copied ? 'Copied!' : 'Copy model ID'}
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
