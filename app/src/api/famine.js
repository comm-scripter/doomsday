// Famine — GDELT news tone on food crisis / famine events
// Baseline 55 calibrated from: 345M people in acute food insecurity (2024),
// active famines in Sudan, Gaza, Yemen; FAO food prices still elevated post-Ukraine.
// Previously used ReliefWeb v2 (pending appname approval — can revisit later).
import { gdeltHybridScore } from './_gdeltHybrid'

const BASE = 55

export async function fetchFamineScore() {
  return gdeltHybridScore(
    'famine OR "food crisis" OR "food insecurity" OR starvation OR "acute hunger" OR "food emergency"',
    BASE,
  )
}
