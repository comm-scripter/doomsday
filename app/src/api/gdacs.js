// GDACS (Global Disaster Alert and Coordination System) — proxied via /api/gdacs
// RSS feed: https://www.gdacs.org/xml/rss.xml
// Red alert = 15 pts, Orange = 6 pts, Green = 1 pt (current active alerts only)

export async function fetchDisasterScore() {
  const res = await fetch('/api/gdacs/xml/rss.xml')
  if (!res.ok) throw new Error('GDACS fetch failed')

  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/xml')
  const items = Array.from(doc.querySelectorAll('item'))

  let red = 0, orange = 0, green = 0
  items.forEach(item => {
    // gdacs:alertlevel element (namespace-safe fallback)
    const levelEl =
      item.getElementsByTagNameNS('http://www.gdacs.org', 'alertlevel')[0] ??
      item.querySelector('alertlevel')
    const level = (levelEl?.textContent ?? '').trim().toLowerCase()
    if (level === 'red')    red++
    else if (level === 'orange') orange++
    else if (level === 'green')  green++
  })

  const rawScore = red * 15 + orange * 6 + green * 1
  const score = Math.min(100, rawScore)

  return {
    score,
    detail: { red, orange, green, total: items.length },
  }
}
