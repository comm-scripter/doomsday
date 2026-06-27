import { useState, useEffect, useCallback } from 'react'
import { fetchEarthquakes }     from '../api/usgs'
import { fetchConflictScore }   from '../api/gdelt'
import { fetchCosmicScore }     from '../api/cosmic'
import { fetchFamineScore }     from '../api/famine'
import { fetchPestilenceScore } from '../api/who'
import { fetchDisasterScore }   from '../api/gdacs'
import { fetchMoralScore }      from '../api/moral'
import { fetchPersecutionScore } from '../api/persecution'
import { fetchApostasyScore }   from '../api/apostasy'
import { fetchIsraelScore }     from '../api/israel'
import { loadHistory, recordScore } from './useHistory'

const H6  = 6  * 60 * 60 * 1000
const H1  = 60 * 60 * 1000
const M15 = 15 * 60 * 1000

const FETCHERS = [
  { id: 'earthquakes', fn: fetchEarthquakes,     interval: M15 },
  { id: 'wars',        fn: fetchConflictScore,   interval: H6  },
  { id: 'cosmic',      fn: fetchCosmicScore,     interval: M15 },
  { id: 'famine',      fn: fetchFamineScore,     interval: H6  },
  { id: 'pestilence',  fn: fetchPestilenceScore, interval: H6  },
  { id: 'disasters',   fn: fetchDisasterScore,   interval: H1  },
  { id: 'moral',       fn: fetchMoralScore,      interval: H6  },
  { id: 'persecution', fn: fetchPersecutionScore, interval: H6 },
  { id: 'apostasy',    fn: fetchApostasyScore,   interval: H6  },
  { id: 'israel',      fn: fetchIsraelScore,     interval: H6  },
]

export function useLiveData() {
  const [scores, setScores] = useState({
    wars: null, earthquakes: null, famine: null, pestilence: null,
    disasters: null, cosmic: null, moral: null, persecution: null,
    apostasy: null, israel: null,
  })
  const [history, setHistory] = useState(() => loadHistory())
  const [lastUpdated, setLastUpdated] = useState({})
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  const refresh = useCallback(async (force = false) => {
    const now = Date.now()
    const updates = {}
    const errs = {}

    await Promise.all(
      FETCHERS.map(async ({ id, fn, interval }) => {
        const last = lastUpdated[id] || 0
        if (!force && now - last < interval && scores[id] !== null) return
        try {
          const result = await fn()
          updates[id] = result
          recordScore(id, result.score)
          setLastUpdated(prev => ({ ...prev, [id]: now }))
        } catch (e) {
          errs[id] = e.message
        }
      })
    )

    if (Object.keys(updates).length) {
      setScores(prev => ({ ...prev, ...updates }))
      setHistory(loadHistory())
    }
    if (Object.keys(errs).length) {
      setErrors(prev => ({ ...prev, ...errs }))
    }
    setLoading(false)
  }, [scores, lastUpdated])

  const forceRefresh = useCallback(() => refresh(true), [refresh])

  useEffect(() => {
    refresh()
    const timer = setInterval(() => refresh(), 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  return { scores, history, lastUpdated, loading, errors, refresh: forceRefresh }
}
