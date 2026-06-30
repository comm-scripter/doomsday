import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── GDELT rate-limit queue + cache ──────────────────────────────────────────
// GDELT enforces 1 request per 5 seconds. Cache responses for 6 hours so
// repeated page loads are instant; queue upstream fetches 5.5s apart so
// simultaneous category requests don't trigger 429s.

const GDELT_MIN_INTERVAL = 15000   // ms between upstream requests
const GDELT_PENALTY_429  = 120000  // wait 2 min after any 429 before next attempt
const GDELT_TTL          = 6 * 60 * 60 * 1000
const GDELT_ERROR_TTL    = 30 * 60 * 1000  // suppress a URL for 30 min after 429
const gdeltCache      = new Map()
const gdeltErrorCache = new Map()  // upstream URL → expiry: don't retry before this
const gdeltQueue      = []
const gdeltWaiters    = new Map()  // upstream URL → [{ resolve, reject }] — dedup in-flight
let gdeltNextAllowed = 0
let gdeltProcessing  = false

async function processGdeltQueue() {
  if (gdeltProcessing) return
  gdeltProcessing = true
  while (gdeltQueue.length > 0) {
    const { upstream } = gdeltQueue.shift()
    const wait = Math.max(0, gdeltNextAllowed - Date.now())
    console.log(`[GDELT] queue: ${gdeltQueue.length} remaining, wait ${Math.round(wait / 1000)}s`)
    if (wait > 0) await new Promise(r => setTimeout(r, wait))

    const settle = (fn) => {
      const waiters = gdeltWaiters.get(upstream) || []
      gdeltWaiters.delete(upstream)
      waiters.forEach(fn)
    }

    try {
      const r = await fetch(upstream, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; DoomsdayMeter/1.0)',
        },
        signal: AbortSignal.timeout(15000),
      })
      if (r.status === 429) {
        await r.text().catch(() => '')
        console.error(`[GDELT] 429 rate-limited — pausing ${GDELT_PENALTY_429 / 1000}s, suppressing URL for ${GDELT_ERROR_TTL / 60000}min`)
        gdeltNextAllowed = Date.now() + GDELT_PENALTY_429
        gdeltErrorCache.set(upstream, Date.now() + GDELT_ERROR_TTL)
        settle(w => w.reject({ status: 429, message: 'GDELT rate limited' }))
      } else if (!r.ok) {
        const text = await r.text().catch(() => '')
        console.error(`[GDELT] upstream ${r.status}: ${text}`)
        gdeltNextAllowed = Date.now() + GDELT_MIN_INTERVAL
        settle(w => w.reject({ status: r.status, message: 'GDELT upstream error' }))
      } else {
        const text = await r.text()
        let data
        try {
          data = JSON.parse(text)
        } catch {
          console.error('[GDELT] non-JSON response:', text.slice(0, 80))
          gdeltNextAllowed = Date.now() + GDELT_MIN_INTERVAL
          settle(w => w.reject({ status: 502, message: 'GDELT returned non-JSON response' }))
          continue
        }
        gdeltNextAllowed = Date.now() + GDELT_MIN_INTERVAL
        gdeltCache.set(upstream, { data, expiry: Date.now() + GDELT_TTL })
        settle(w => w.resolve({ data, fromCache: false }))
      }
    } catch (e) {
      gdeltNextAllowed = Date.now() + GDELT_MIN_INTERVAL
      console.error('[GDELT] fetch error:', e.message)
      settle(w => w.reject({ status: 502, message: e.message }))
    }
  }
  gdeltProcessing = false
}

function gdeltFetch(upstream) {
  const cached = gdeltCache.get(upstream)
  if (cached && cached.expiry > Date.now()) {
    console.log(`[GDELT] cache hit (${gdeltQueue.length} in queue)`)
    return Promise.resolve({ data: cached.data, fromCache: true })
  }
  const errorExpiry = gdeltErrorCache.get(upstream)
  if (errorExpiry && errorExpiry > Date.now()) {
    const secsLeft = Math.round((errorExpiry - Date.now()) / 1000)
    console.log(`[GDELT] suppressed — retry in ${secsLeft}s`)
    return Promise.reject({ status: 429, message: `GDELT suppressed for ${secsLeft}s after rate limit` })
  }
  return new Promise((resolve, reject) => {
    if (gdeltWaiters.has(upstream)) {
      // URL already queued — attach to existing request instead of queuing again
      gdeltWaiters.get(upstream).push({ resolve, reject })
      console.log(`[GDELT] dedup — attached to existing request (queue depth ${gdeltQueue.length})`)
      return
    }
    gdeltWaiters.set(upstream, [{ resolve, reject }])
    gdeltQueue.push({ upstream })
    console.log(`[GDELT] queued — queue depth now ${gdeltQueue.length}`)
    processGdeltQueue()
  })
}

// ── CORS proxy routes ────────────────────────────────────────────────────────

// GDELT DOC 2.0 — rate-limited, queued, cached server-side
app.get('/api/gdelt', async (req, res) => {
  const params = new URLSearchParams(req.query).toString()
  const upstream = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`
  try {
    const { data } = await gdeltFetch(upstream)
    res.json(data)
  } catch (e) {
    res.status(e.status || 502).json({ error: e.message })
  }
})

// ReliefWeb (UN OCHA) v2 — POST JSON body, proxied to avoid CORS
app.post('/api/reliefweb', async (req, res) => {
  const appname = process.env.RELIEFWEB_APPNAME || 'doomsday-meter'
  const upstream = `https://api.reliefweb.int/v2/reports?appname=${appname}`
  try {
    const r = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; DoomsdayMeter/1.0)',
      },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) {
      const text = await r.text().catch(() => '')
      console.error(`[ReliefWeb] upstream ${r.status}: ${text}`)
      return res.status(r.status).json({ error: 'ReliefWeb upstream error', status: r.status })
    }
    const data = await r.json()
    res.json(data)
  } catch (e) {
    console.error('[ReliefWeb] fetch error:', e.message)
    res.status(502).json({ error: e.message })
  }
})

// WHO Disease Outbreak News RSS — lacks CORS headers
app.get('/api/who/*path', async (req, res) => {
  const upstreamPath = req.path.replace('/api/who', '')
  const upstream = `https://www.who.int${upstreamPath}`
  try {
    const r = await fetch(upstream, { signal: AbortSignal.timeout(15000) })
    const text = await r.text()
    res.set('Content-Type', r.headers.get('content-type') || 'text/xml')
    res.send(text)
  } catch (e) {
    console.error('[WHO] fetch error:', e.message)
    res.status(502).json({ error: e.message })
  }
})

// GDACS disaster alerts RSS — lacks CORS headers
app.get('/api/gdacs/*path', async (req, res) => {
  const upstreamPath = req.path.replace('/api/gdacs', '')
  const upstream = `https://www.gdacs.org${upstreamPath}`
  try {
    const r = await fetch(upstream, { signal: AbortSignal.timeout(15000) })
    const text = await r.text()
    res.set('Content-Type', r.headers.get('content-type') || 'text/xml')
    res.send(text)
  } catch (e) {
    console.error('[GDACS] fetch error:', e.message)
    res.status(502).json({ error: e.message })
  }
})

// ── Fetch log ────────────────────────────────────────────────────────────────
// Client POSTs each fetch result here. Entries accumulate in memory and are
// flushed to fetch-log.json every 6 hours, overwriting the previous period.

const LOG_PATH = path.join(__dirname, '../fetch-log.json')
let logEntries    = []
let logPeriodStart = new Date().toISOString()

function flushLog() {
  const now = new Date().toISOString()
  const payload = {
    period: { from: logPeriodStart, to: now },
    entries: logEntries,
  }
  try {
    fs.writeFileSync(LOG_PATH, JSON.stringify(payload, null, 2))
    console.log(`[log] flushed ${logEntries.length} entries → fetch-log.json`)
  } catch (e) {
    console.error('[log] write failed:', e.message)
  }
  logEntries     = []
  logPeriodStart = now
}

setInterval(flushLog, 6 * 60 * 60 * 1000)

app.post('/api/log', (req, res) => {
  const { id, status, score, error, elapsed } = req.body || {}
  if (!id || !status) return res.status(400).end()
  const entry = { ts: new Date().toISOString(), id, status, elapsed }
  if (score  != null) entry.score = score
  if (error) entry.error = error
  logEntries.push(entry)
  res.status(204).end()
})

app.get('/api/log', (req, res) => {
  res.json({ period: { from: logPeriodStart, to: new Date().toISOString() }, entries: logEntries })
})

// ── Static frontend (production only) ───────────────────────────────────────

const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*path', (_, res) => res.sendFile(path.join(distPath, 'index.html')))

app.listen(PORT, () => {
  console.log(`Doomsday proxy server running on http://localhost:${PORT}`)
})
