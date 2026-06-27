const STORAGE_KEY = 'doomsday_history'
const MAX_POINTS = 30

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function recordScore(categoryId, score) {
  const history = loadHistory()
  if (!history[categoryId]) history[categoryId] = []
  history[categoryId] = [...history[categoryId], { ts: Date.now(), score }].slice(-MAX_POINTS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}
