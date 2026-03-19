import type { ModelChangeWithDetails } from '@openrouter-free-models/shared';

interface ChangeTimelineProps {
  changes: ModelChangeWithDetails[];
  loading: boolean;
  error: string | null;
}

export function ChangeTimeline({ changes, loading, error }: ChangeTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <div className="text-red-600 dark:text-red-400 mb-2">Error loading changes</div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="text-gray-600 dark:text-gray-400 mb-2">No changes recorded</div>
        <p className="text-sm text-gray-500 dark:text-gray-500">Changes will appear here after updates</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return (
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'removed':
        return (
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'modified':
        return (
          <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getChangeLabel = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'Added';
      case 'removed':
        return 'Removed';
      case 'modified':
        return 'Modified';
      default:
        return changeType;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'added':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'removed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'modified':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-4">
      {changes.map((change, index) => (
        <div key={change.id} className="flex items-start space-x-4">
          <div className="flex flex-col items-center">
            {getChangeIcon(change.change_type)}
            {index < changes.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-2" />}
          </div>
          <div className="flex-1 card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{change.model_name || change.model_id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChangeColor(change.change_type)}`}>
                  {getChangeLabel(change.change_type)}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(change.detected_at)}</span>
            </div>
            <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
              {change.model_id}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
}
