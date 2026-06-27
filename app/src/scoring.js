import { CATEGORIES } from './data/categories'

// All 10 categories are now on live APIs — no static defaults needed.
// If a fetch is still in-flight on first load, that category is simply
// excluded from the weighted average until its result arrives.
export function computeScore(scores) {
  let total = 0
  let totalWeight = 0

  for (const cat of CATEGORIES) {
    const value = scores[cat.id]?.score ?? null
    if (value === null) continue
    total += value * cat.weight
    totalWeight += cat.weight
  }

  if (totalWeight === 0) return 0
  return Math.round(total / totalWeight)
}
