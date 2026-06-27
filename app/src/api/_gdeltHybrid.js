// Shared helper for GDELT-based hybrid scoring.
// Returns a score anchored to a calibrated annual baseline, adjusted ±20
// by the daily news tone from GDELT so the needle responds to real events
// without being entirely at the mercy of a single day's headlines.

export async function gdeltHybridScore(query, baseScore) {
  const params = new URLSearchParams({
    query: `(${query})`,  // GDELT requires OR'd terms wrapped in ()
    mode: 'artlist',
    maxrecords: 100,
    format: 'json',
    timespan: '24h',
  })

  try {
    const res = await fetch(`/api/gdelt?${params}`)
    if (!res.ok) throw new Error('GDELT fetch failed')

    const data = await res.json()
    const articles = data.articles ?? []

    if (articles.length === 0) {
      return {
        score: baseScore,
        detail: { articleCount: 0, avgTone: 0, base: baseScore, modifier: 0 },
      }
    }

    const avgTone =
      articles.reduce((sum, a) => sum + (parseFloat(a.tone) || 0), 0) / articles.length

    // Negative tone (conflict/distress coverage) → positive modifier → higher score
    const modifier = Math.round(Math.max(-20, Math.min(20, -(avgTone * 2))))
    const score = Math.min(100, Math.max(0, baseScore + modifier))

    return {
      score,
      detail: {
        articleCount: articles.length,
        avgTone: Math.round(avgTone * 100) / 100,
        base: baseScore,
        modifier,
      },
    }
  } catch {
    return {
      score: baseScore,
      detail: { fallback: true, base: baseScore },
    }
  }
}
