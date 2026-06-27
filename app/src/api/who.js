// WHO Disease Outbreak News RSS — proxied via /api/who to bypass missing CORS headers
// Feed: https://www.who.int/feeds/entity/csr/don/en/rss.xml

// Higher-severity diseases get extra weight when found in headlines
const HIGH_SEVERITY = ['ebola', 'marburg', 'plague', 'novel', 'unknown', 'pandemic', 'mpox']
const MED_SEVERITY  = ['cholera', 'dengue', 'yellow fever', 'diphtheria', 'polio', 'anthrax']

const BASELINE_60_DAYS = 10  // ~10 DON reports per 60 days historically

export async function fetchPestilenceScore() {
  const res = await fetch('/api/who/feeds/entity/csr/don/en/rss.xml')
  if (!res.ok) throw new Error('WHO RSS fetch failed')

  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  const items = Array.from(doc.querySelectorAll('item'))

  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000
  const recent = items.filter(item => {
    const pubDate = item.querySelector('pubDate')?.textContent
    return pubDate ? new Date(pubDate).getTime() > cutoff : false
  })

  let severityBonus = 0
  const diseases = []
  recent.forEach(item => {
    const title = (item.querySelector('title')?.textContent ?? '').toLowerCase()
    diseases.push(item.querySelector('title')?.textContent ?? '')
    if (HIGH_SEVERITY.some(kw => title.includes(kw))) severityBonus += 12
    else if (MED_SEVERITY.some(kw => title.includes(kw))) severityBonus += 5
  })

  const baseScore = Math.round((recent.length / BASELINE_60_DAYS) * 40)
  const score = Math.min(100, baseScore + Math.min(40, severityBonus))

  return {
    score,
    detail: {
      outbreaks60d: recent.length,
      baseline: BASELINE_60_DAYS,
      severityBonus,
      diseases: diseases.slice(0, 3),
    },
  }
}
