// NOAA Space Weather Prediction Center — free, no API key
// Docs: https://services.swpc.noaa.gov/

export async function fetchSolarScore() {
  const [kpRes, alertRes] = await Promise.all([
    fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'),
    fetch('https://services.swpc.noaa.gov/products/alerts.json'),
  ])

  if (!kpRes.ok) throw new Error('NOAA Kp fetch failed')

  const kpData = await kpRes.json()
  // Last row is most recent [timestamp, Kp, observed, noaa_scale]
  const recent = kpData.slice(-12) // last 12 readings (3h each = 36h)
  const maxKp = Math.max(...recent.map(r => parseFloat(r[1]) || 0))

  // G-scale storms: G1=Kp5, G2=Kp6, G3=Kp7, G4=Kp8, G5=Kp9
  // Score: Kp 0-4 → 0-20, Kp 5 → 40, Kp 6 → 55, Kp 7 → 70, Kp 8 → 85, Kp 9 → 100
  const kpScore = Math.min(100, Math.round((maxKp / 9) ** 1.5 * 100))

  let alertBonus = 0
  if (alertRes.ok) {
    const alerts = await alertRes.json()
    const activeAlerts = Array.isArray(alerts) ? alerts.filter(a => a.issue_datetime) : []
    // Each active space weather alert adds a small bonus
    alertBonus = Math.min(20, activeAlerts.length * 3)
  }

  const score = Math.min(100, kpScore + alertBonus)

  return {
    score,
    detail: {
      maxKp: Math.round(maxKp * 10) / 10,
      gScale: kpToGScale(maxKp),
      alertBonus,
    },
  }
}

function kpToGScale(kp) {
  if (kp >= 9) return 'G5'
  if (kp >= 8) return 'G4'
  if (kp >= 7) return 'G3'
  if (kp >= 6) return 'G2'
  if (kp >= 5) return 'G1'
  return 'None'
}
