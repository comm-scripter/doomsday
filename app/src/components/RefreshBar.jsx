import { useEffect, useRef } from 'react'

export default function RefreshBar({ loading, onRefresh }) {
  const barRef    = useRef(null)
  const activeRef = useRef(false)
  const startRef  = useRef(0)
  const timerRef  = useRef(null)

  useEffect(() => {
    if (barRef.current) barRef.current.style.width = '0%'
  }, [])

  const handleRefresh = () => {
    clearTimeout(timerRef.current)
    activeRef.current = true
    startRef.current = Date.now()
    const bar = barRef.current
    if (bar) {
      bar.style.transition = 'none'
      bar.style.width = '0%'
      void bar.getBoundingClientRect() // force reflow so transition fires from 0
      bar.style.transition = 'width 8s cubic-bezier(0.1, 0, 0.2, 1)'
      bar.style.width = '75%'
    }
    onRefresh()
  }

  useEffect(() => {
    if (!loading && activeRef.current) {
      activeRef.current = false
      const bar = barRef.current
      const delay = Math.max(0, 500 - (Date.now() - startRef.current))
      timerRef.current = setTimeout(() => {
        if (bar) {
          bar.style.transition = 'width 0.3s ease'
          bar.style.width = '100%'
        }
        timerRef.current = setTimeout(() => {
          if (bar) {
            bar.style.transition = 'none'
            bar.style.width = '0%'
          }
        }, 400)
      }, delay)
    }
    return () => clearTimeout(timerRef.current)
  }, [loading])

  return (
    <div className="flex items-center justify-between w-full max-w-2xl px-1 mt-4">
      <p className="text-xs text-slate-600">
        Live data · auto-refreshes every 15 min
      </p>
      <button
        onClick={handleRefresh}
        disabled={loading}
        style={{ touchAction: 'manipulation', position: 'relative', overflow: 'hidden' }}
        className="text-xs px-3 py-2 rounded border border-slate-700 text-slate-400
                   hover:border-slate-500 hover:text-slate-200 transition-colors disabled:opacity-75"
      >
        <span
          ref={barRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, background: 'rgba(148, 163, 184, 0.3)' }}
        />
        <span style={{ position: 'relative' }}>
          {loading ? 'Refreshing...' : 'Refresh now'}
        </span>
      </button>
    </div>
  )
}
