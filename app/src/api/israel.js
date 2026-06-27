// Israel & Middle East — GDELT news tone on Israel existential threats
// Baseline 65 calibrated from: ongoing multi-front conflict post-Oct 7 2023,
// active Iranian proxy network (Hamas/Hezbollah/Houthis), and unprecedented
// global diplomatic isolation (UN resolutions, ICJ proceedings).
import { gdeltHybridScore } from './_gdeltHybrid'

const BASE = 65

export async function fetchIsraelScore() {
  return gdeltHybridScore(
    '"Israel attack" OR "Israel war" OR "Hamas attack" OR "Hezbollah attack" OR "Iran Israel" OR "Israel missiles" OR "Israel military" OR "Gaza war"',
    BASE,
  )
}
