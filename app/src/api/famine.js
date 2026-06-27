// ReliefWeb API (UN OCHA) — free, proper CORS headers, no key required
// Docs: https://reliefweb.int/help/api

const BASELINE_90_DAYS = 25  // ~25 food-crisis reports per 90 days historically

export async function fetchFamineScore() {
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const params = new URLSearchParams({
    appname: 'doomsday-meter',
    'query[value]': 'famine OR "food crisis" OR "acute food insecurity" OR "food emergency"',
    'filter[field]': 'date.created',
    [`filter[value][from]`]: `${from}T00:00:00+00:00`,
    'fields[include][]': 'title',
    limit: 5,
    profile: 'list',
  })

  const res = await fetch(`https://api.reliefweb.int/v1/reports?${params}`)
  if (!res.ok) throw new Error('ReliefWeb fetch failed')

  const data = await res.json()
  const count = data.totalCount ?? 0
  const headlines = (data.data ?? []).map(d => d.fields?.title ?? '').filter(Boolean)

  const score = Math.min(100, Math.round((count / BASELINE_90_DAYS) * 50))

  return {
    score,
    detail: {
      reports90d: count,
      baseline: BASELINE_90_DAYS,
      headlines,
    },
  }
}
