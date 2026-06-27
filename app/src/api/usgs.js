// USGS Earthquake Hazards Program — free, no API key required
// Docs: https://earthquake.usgs.gov/fdsnws/event/1/

const BASELINE_M6_PER_30_DAYS = 13.0
const BASELINE_M7_PER_90_DAYS = 1.5

export async function fetchEarthquakes() {
  const now = new Date()

  const start30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const start90 = new Date(now - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const end = now.toISOString().split('T')[0]

  const [res30, res90] = await Promise.all([
    fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/count?format=geojson&starttime=${start30}&endtime=${end}&minmagnitude=6.0`
    ),
    fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/count?format=geojson&starttime=${start90}&endtime=${end}&minmagnitude=7.0`
    ),
  ])

  if (!res30.ok || !res90.ok) throw new Error('USGS fetch failed')

  const data30 = await res30.json()
  const data90 = await res90.json()

  const count30 = data30.count
  const count90 = data90.count

  // Normalized ratio vs historical baseline, capped at 100
  const ratio30 = count30 / BASELINE_M6_PER_30_DAYS
  const ratio90 = count90 / BASELINE_M7_PER_90_DAYS

  // Weighted: 60% M6+ frequency, 40% M7+ frequency
  const rawScore = ratio30 * 0.6 * 50 + ratio90 * 0.4 * 50
  const score = Math.min(100, Math.round(rawScore))

  return {
    score,
    detail: {
      m6_last30: count30,
      m7_last90: count90,
      baseline_m6: BASELINE_M6_PER_30_DAYS,
      baseline_m7: BASELINE_M7_PER_90_DAYS,
    },
  }
}
