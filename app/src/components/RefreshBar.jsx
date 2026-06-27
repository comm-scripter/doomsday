export default function RefreshBar({ loading, onRefresh }) {
  return (
    <div className="flex items-center justify-between w-full max-w-2xl px-1 mt-4">
      <p className="text-xs text-slate-600">
        Live data · auto-refreshes every 15 min
      </p>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="text-xs px-3 py-1 rounded border border-slate-700 text-slate-400
                   hover:border-slate-500 hover:text-slate-200 transition-colors disabled:opacity-40"
      >
        {loading ? 'Refreshing...' : 'Refresh now'}
      </button>
    </div>
  )
}
