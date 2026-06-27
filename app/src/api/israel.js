// Israel & Middle East — GDELT news tone on Israel existential threats
// Baseline 65 calibrated from: ongoing multi-front conflict post-Oct 7 2023,
// active Iranian proxy network (Hamas/Hezbollah/Houthis), and unprecedented
// global diplomatic isolation (UN resolutions, ICJ proceedings).
import { gdeltHybridScore } from './_gdeltHybrid'

const BASE = 65

export async function fetchIsraelScore() {
  return gdeltHybridScore(
    '"Israel" AND (attack OR war OR Hamas OR Hezbollah OR Iran OR missiles OR rockets OR "military operation" OR conflict)',
    BASE,
  )
}
