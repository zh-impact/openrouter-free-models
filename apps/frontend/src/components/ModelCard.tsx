import { useState } from 'react';
import type { OpenRouterModel } from '@openrouter-free-models/shared';
import { OPENROUTER_MODEL_URL } from '@openrouter-free-models/shared';

interface ModelCardProps {
  model: OpenRouterModel;
}

export function ModelCard({ model }: ModelCardProps) {
  const [copied, setCopied] = useState(false);

  const modality = model.architecture?.modality || 'text';
  const modalityColors: Record<string, string> = {
    text: 'bg-accent-100 text-accent-800 dark:bg-accent-900/30 dark:text-accent-200',
    'text+image': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
    'text+video': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200',
    image: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
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
    <div className="card p-5 hover:shadow-md transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <a
          href={modelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-heading font-semibold text-gray-900 dark:text-white pr-3 hover:text-accent dark:hover:text-accent-400 transition-colors line-clamp-1"
        >
          {model.name}
        </a>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${modalityColors[modality] || modalityColors.text}`}>
          <span className="mr-1">{modalityIcons[modality] || '📝'}</span>
          {modality}
        </span>
      </div>

      {/* Description */}
      <p className="text-body text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
        {model.description || 'No description available'}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="text-caption text-gray-600 dark:text-gray-400 mb-1">Context</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {(model.context_length / 1000).toFixed(0)}k
          </div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="text-caption text-gray-600 dark:text-gray-400 mb-1">Prompt</div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            {formatPrice(model.pricing.prompt)}
          </div>
        </div>
        <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <div className="text-caption text-gray-600 dark:text-gray-400 mb-1">Completion</div>
          <div className="text-sm font-semibold text-green-600 dark:text-green-400">
            {formatPrice(model.pricing.completion)}
          </div>
        </div>
      </div>

      {/* Model ID */}
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2.5 py-1.5 rounded-md flex-1 truncate font-mono">
            {model.id}
          </code>
          <button
            onClick={handleCopyId}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 group/btn relative"
            title={copied ? 'Copied!' : 'Copy model ID'}
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-500 group-hover/btn:text-gray-700 dark:group-hover/btn:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
