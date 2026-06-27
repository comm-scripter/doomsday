import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchEarthquakes }      from '../api/usgs'
import { fetchConflictScore }    from '../api/gdelt'
import { fetchCosmicScore }      from '../api/cosmic'
import { fetchFamineScore }      from '../api/famine'
import { fetchPestilenceScore }  from '../api/who'
import { fetchDisasterScore }    from '../api/gdacs'
import { fetchMoralScore }       from '../api/moral'
import { fetchPersecutionScore } from '../api/persecution'
import { fetchApostasyScore }    from '../api/apostasy'
import { fetchIsraelScore }      from '../api/israel'
import { loadHistory, recordScore } from './useHistory'

const H6  = 6  * 60 * 60 * 1000
const H1  = 60 * 60 * 1000
const M15 = 15 * 60 * 1000

const FETCHERS = [
  { id: 'earthquakes', fn: fetchEarthquakes,      interval: M15 },
  { id: 'wars',        fn: fetchConflictScore,    interval: H6  },
  { id: 'cosmic',      fn: fetchCosmicScore,      interval: M15 },
  { id: 'famine',      fn: fetchFamineScore,      interval: H6  },
  { id: 'pestilence',  fn: fetchPestilenceScore,  interval: H6  },
  { id: 'disasters',   fn: fetchDisasterScore,    interval: H1  },
  { id: 'moral',       fn: fetchMoralScore,       interval: H6  },
  { id: 'persecution', fn: fetchPersecutionScore, interval: H6  },
  { id: 'apostasy',    fn: fetchApostasyScore,    interval: H6  },
  { id: 'israel',      fn: fetchIsraelScore,      interval: H6  },
]

export function useLiveData() {
  const [scores, setScores] = useState({
    wars: null, earthquakes: null, famine: null, pestilence: null,
    disasters: null, cosmic: null, moral: null, persecution: null,
    apostasy: null, israel: null,
  })
  const [history, setHistory]       = useState(() => loadHistory())
  const [lastUpdated, setLastUpdated] = useState({})
  const [loading, setLoading]       = useState(true)
  const [errors, setErrors]         = useState({})
  const lastUpdatedRef              = useRef({})
  const scoresRef                   = useRef({})
  const inFlightRef                 = useRef(new Set())
  const retryAfterRef               = useRef({})  // id → timestamp: don't retry before this

  const runFetcher = useCallback(async ({ id, fn, interval }, force = false) => {
    const now  = Date.now()
    const last = lastUpdatedRef.current[id] || 0
    if (!force && now - last < interval && scoresRef.current[id] != null) return
    if (inFlightRef.current.has(id)) return
    if (!force && now < (retryAfterRef.current[id] || 0)) return

    inFlightRef.current.add(id)
    const ts = new Date().toLocaleTimeString()
    console.log(`[${ts}] [${id}] fetching…`)
    const t0 = Date.now()

    try {
      const result = await fn()
      const elapsed = Date.now() - t0
      console.log(`[${new Date().toLocaleTimeString()}] [${id}] ✓ score=${result.score} (${elapsed}ms)`, result.detail)

      scoresRef.current[id] = result
      lastUpdatedRef.current[id] = Date.now()

      setScores(prev => ({ ...prev, [id]: result }))
      setLastUpdated(prev => ({ ...prev, [id]: Date.now() }))
      setLoading(false)
      setErrors(prev => { const n = { ...prev }; delete n[id]; return n })
      recordScore(id, result.score)
      setHistory(loadHistory())
    } catch (e) {
      const cooldown = 5 * 60 * 1000  // 5 min retry cooldown after any failure
      retryAfterRef.current[id] = Date.now() + cooldown
      console.error(`[${new Date().toLocaleTimeString()}] [${id}] ✗ ${e.message} — retry in 5m`)
      setErrors(prev => ({ ...prev, [id]: e.message }))
    } finally {
      inFlightRef.current.delete(id)
    }
  }, [])

  const refresh = useCallback((force = false) => {
    const now = Date.now()
    const ts  = new Date().toLocaleTimeString()
    const summary = FETCHERS.map(({ id, interval }) => {
      if (inFlightRef.current.has(id))                                  return `${id}:⏳in-flight`
      if (!force && now < (retryAfterRef.current[id] || 0)) {
        const remaining = Math.round((retryAfterRef.current[id] - now) / 1000)
        return `${id}:❌cooldown(${remaining}s)`
      }
      if (!force && scoresRef.current[id] != null && now - (lastUpdatedRef.current[id] || 0) < interval) {
        const remaining = Math.round((interval - (now - (lastUpdatedRef.current[id] || 0))) / 1000)
        return `${id}:⏱${remaining}s`
      }
      return `${id}:🔄`
    })
    const fetching = summary.filter(s => s.endsWith('🔄')).length
    console.log(`[${ts}] refresh tick — ${fetching} to fetch, ${summary.length - fetching} skipped`)
    console.log('  ' + summary.join('  '))

    const promises = FETCHERS.map(f => runFetcher(f, force))
    Promise.all(promises).then(() => setLoading(false))
  }, [runFetcher])

  const forceRefresh = useCallback(() => refresh(true), [refresh])

  useEffect(() => {
    refresh()
    const timer = setInterval(() => refresh(), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  return { scores, history, lastUpdated, loading, errors, refresh: forceRefresh }
}
