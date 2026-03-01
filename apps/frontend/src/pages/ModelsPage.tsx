import { useState, useMemo } from 'react';
import { ModelList } from '../components/ModelList';
import { RefreshButton } from '../components/RefreshButton';
import { SearchBar } from '../components/SearchBar';
import { useModels } from '../hooks/useModels';

export function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalityFilter, setModalityFilter] = useState<string>('all');
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Free Models</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'} available
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          refreshing={loading}
          lastUpdated={lastUpdated}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div>
          <select
            value={modalityFilter}
            onChange={(e) => setModalityFilter(e.target.value)}
            className="input w-full"
          >
            <option value="all">All Modalities</option>
            {modalities.map((modality) => (
              <option key={modality} value={modality}>
                {modality}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ModelList models={filteredModels} loading={loading} error={error} />
    </div>
  );
}
