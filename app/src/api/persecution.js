// Religious Persecution — GDELT news tone on Christian persecution globally
// Baseline 58 calibrated from: Open Doors World Watch List 2025 —
// 380 million Christians face high/very high/extreme persecution; 4,998 killed for faith in 2024.
import { gdeltHybridScore } from './_gdeltHybrid'

const BASE = 58

export async function fetchPersecutionScore() {
  return gdeltHybridScore(
    '"Christian persecution" OR "persecuted Christians" OR "Christians killed" OR "church attack" OR "religious persecution" OR "Christian martyrs"',
    BASE,
  )
}
