import { useState, useMemo } from 'react';
import { ModelList } from '../components/ModelList';
import { RefreshButton } from '../components/RefreshButton';
import { SearchBar } from '../components/SearchBar';
import { ViewToggle } from '../components/ViewToggle';
import { useModels } from '../hooks/useModels';

type ViewMode = 'grid' | 'list';

export function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { models, loading, error, lastUpdated, refresh } = useModels();

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch =
        searchQuery === '' ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.id.toLowerCase().includes(searchQuery.toLowerCase());

      const modality = model.architecture?.modality || 'text';
      const matchesModality = modalityFilter === 'all' || modality === modalityFilter || modality.startsWith(modalityFilter);

      return matchesSearch && matchesModality;
    });
  }, [models, searchQuery, modalityFilter]);

  const modalities = useMemo(() => {
    const modalitySet = new Set<string>();
    models.forEach((model) => {
      const modality = model.architecture?.modality || 'text';
      modalitySet.add(modality);
    });
    return Array.from(modalitySet).sort();
  }, [models]);

  const handleRefresh = async () => {
    await refresh();
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-50"></div>
        <div className="relative container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-accent-100 dark:bg-accent-900/30 text-accent-800 dark:text-accent-200 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span>Live Monitoring</span>
            </div>

            <h1 className="text-display font-bold text-gray-900 dark:text-white mb-4">
              OpenRouter Free Models
            </h1>

            <p className="text-body-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Monitor and explore all free AI models available on OpenRouter in real-time.
              Track changes, discover new models, and stay updated with the latest additions.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{filteredModels.length} models available</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'hourly'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Real-time sync</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-8">
        <div className="container-custom">
          {/* Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 max-w-2xl">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={modalityFilter}
                  onChange={(e) => setModalityFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Modalities</option>
                  {modalities.map((modality) => (
                    <option key={modality} value={modality}>
                      {modality}
                    </option>
                  ))}
                </select>
                <ViewToggle viewMode={viewMode} onChange={setViewMode} />
                <RefreshButton
                  onRefresh={handleRefresh}
                  refreshing={loading}
                  lastUpdated={lastUpdated}
                />
              </div>
            </div>
          </div>

          {/* Model List */}
          <ModelList models={filteredModels} loading={loading} error={error} viewMode={viewMode} />
        </div>
      </section>
    </>
  );
}
