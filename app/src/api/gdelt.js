// GDELT Project — free, no API key, global event/conflict database
// Docs: https://blog.gdeltproject.org/gdelt-2-0-our-global-world-in-realtime/
// Using the GKG (Global Knowledge Graph) summary API for conflict tone

export async function fetchConflictScore() {
  // Routed through /api/gdelt proxy (Vite dev) or Express server (production)
  // to avoid GDELT's missing CORS headers
  const url =
    '/api/gdelt?query=war%20OR%20conflict%20OR%20military%20attack&mode=artlist&maxrecords=250&format=json&timespan=24h'

  const res = await fetch(url)
  if (!res.ok) throw new Error('GDELT fetch failed')

  const data = await res.json()
  const articles = data.articles || []

  if (articles.length === 0) {
    return { score: 30, detail: { articleCount: 0, note: 'No data returned' } }
  }

  // Average tone ranges roughly -10 (very negative) to +10 (very positive)
  // More negative = more conflict coverage
  const avgTone =
    articles.reduce((sum, a) => sum + (parseFloat(a.tone) || 0), 0) / articles.length

  // Map tone: -10 → 80, 0 → 40, +5 → 15 (conflict is negative tone)
  // score = 40 - (avgTone * 4), clamped 0–100
  const score = Math.min(100, Math.max(0, Math.round(40 - avgTone * 4)))

  return {
    score,
    detail: {
      articleCount: articles.length,
      averageTone: Math.round(avgTone * 100) / 100,
    },
  }
}
