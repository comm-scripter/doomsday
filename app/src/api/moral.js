// Moral Decline — GDELT news tone on crime/corruption/lawlessness
// Baseline 45 calibrated from: WJP Rule of Law Index 2024 (declining in 57% of countries),
// UNODC homicide trends, and Transparency International CPI 2024.
import { gdeltHybridScore } from './_gdeltHybrid'

const BASE = 45

export async function fetchMoralScore() {
  return gdeltHybridScore(
    'crime OR corruption OR lawlessness OR "moral decline" OR violence OR "social disorder"',
    BASE,
  )
}
