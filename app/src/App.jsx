import './index.css'
import { useLiveData } from './hooks/useLiveData'
import { computeScore } from './scoring'
import Header from './components/Header'
import DoomsdayGauge from './components/DoomsdayGauge'
import CategoryPanel from './components/CategoryPanel'
import RefreshBar from './components/RefreshBar'

export default function App() {
  const { scores, history, lastUpdated, loading, errors, refresh } = useLiveData()
  const totalScore = computeScore(scores)

  const fetchTimes = Object.values(lastUpdated).filter(Boolean)
  const lastFetch = fetchTimes.length ? Math.max(...fetchTimes) : 0

  return (
    <div
      className="min-h-screen flex flex-col items-center pb-16"
      style={{ background: 'radial-gradient(ellipse at top, #0f172a 0%, #0a0a0f 70%)' }}
    >
      <Header lastFetch={lastFetch} />

      <main className="flex flex-col items-center w-full px-2 sm:px-4 max-w-2xl">
        <div className="w-full mt-4 sm:mt-6">
          <DoomsdayGauge score={totalScore} loading={loading} />
        </div>

        <RefreshBar loading={loading} onRefresh={refresh} />

        <CategoryPanel
          scores={scores}
          history={history}
          errors={errors}
          lastUpdated={lastUpdated}
        />

        <footer className="mt-10 text-xs text-slate-700 text-center max-w-md px-2">
          Educational / faith-based tool. Data sourced from USGS, GDELT, NOAA, WHO, GDACS,
          NASA, and ReliefWeb. This meter tracks observable data against biblical prophetic
          indicators — it is not a prediction platform.
        </footer>
      </main>
    </div>
  )
}
