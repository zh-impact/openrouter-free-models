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
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <a
          href={modelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-gray-900 dark:text-white pr-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          {model.name}
        </a>
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${modalityColors[modality] || modalityColors.text}`}>
          {modalityIcons[modality] || '📝'} {modality}
        </span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {model.description || 'No description available'}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Context:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {model.context_length.toLocaleString()} tokens
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Prompt:</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatPrice(model.pricing.prompt)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Completion:</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatPrice(model.pricing.completion)}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded flex-1 truncate">
            {model.id}
          </code>
          <button
            onClick={handleCopyId}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group relative"
            title={copied ? 'Copied!' : 'Copy model ID'}
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
