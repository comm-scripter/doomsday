// Combines NOAA solar/Kp data with NASA Near-Earth Object data
import { fetchSolarScore } from './noaa'
import { fetchNeoScore } from './nasa'

export async function fetchCosmicScore() {
  const [solar, neo] = await Promise.allSettled([fetchSolarScore(), fetchNeoScore()])

  const solarResult = solar.status === 'fulfilled' ? solar.value : { score: 20, detail: {} }
  const neoResult   = neo.status   === 'fulfilled' ? neo.value   : { score: 0,  detail: {} }

  // 70% solar storm activity, 30% near-Earth objects
  const score = Math.min(100, Math.round(solarResult.score * 0.7 + neoResult.score * 0.3))

  return {
    score,
    detail: {
      ...solarResult.detail,
      ...neoResult.detail,
    },
  }
}
