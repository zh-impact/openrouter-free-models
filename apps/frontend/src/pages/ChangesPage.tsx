import { ChangeTimeline } from '../components/ChangeTimeline'
import { useChanges } from '../hooks/useChanges'

export function ChangesPage() {
  const { changes, loading, error, loadMore, hasMore } = useChanges()

  return (
    <div className="space-y-6">
      <div className="p-14 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change History</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track when free models are added, removed, or modified
        </p>
      </div>

      <ChangeTimeline changes={changes} loading={loading} error={error} />

      {hasMore && !loading && changes.length > 0 && (
        <div className="flex justify-center">
          <button onClick={loadMore} className="btn btn-secondary">
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
