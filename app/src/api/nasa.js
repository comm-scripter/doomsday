// NASA NeoWs (Near Earth Object Web Service) — free, proper CORS headers
// DEMO_KEY: 30 req/hr, 50 req/day — cached in localStorage by date to stay within limits
// Docs: https://api.nasa.gov/

const API_KEY = 'DEMO_KEY'
const CLOSE_APPROACH_LD = 10   // lunar distances — threshold for "notable"
const PHA_LD = 5               // PHAs closer than this are significant

export async function fetchNeoScore() {
  const today = new Date().toISOString().slice(0, 10)
  const cacheKey = `nasa_neo_${today}`
  const cached = localStorage.getItem(cacheKey)
  if (cached) return JSON.parse(cached)

  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const url =
    `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${endDate}&api_key=${API_KEY}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('NASA NeoWs fetch failed')

  const data = await res.json()
  const allNeos = Object.values(data.near_earth_objects ?? {}).flat()

  let nearCount = 0
  let phaCount = 0

  allNeos.forEach(neo => {
    const isPHA = neo.is_potentially_hazardous_asteroid
    const approaches = neo.close_approach_data ?? []
    approaches.forEach(ca => {
      const ld = parseFloat(ca.miss_distance?.lunar ?? '999')
      if (ld < CLOSE_APPROACH_LD) nearCount++
      if (isPHA && ld < PHA_LD) phaCount++
    })
  })

  const score = Math.min(100, phaCount * 15 + nearCount * 2)

  const result = {
    score,
    detail: { neoTotal: allNeos.length, nearCount, phaCount },
  }

  localStorage.setItem(cacheKey, JSON.stringify(result))
  return result
}
