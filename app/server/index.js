import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── CORS proxy routes ────────────────────────────────────────────────────────

// GDELT DOC 2.0 — proxied because it doesn't send CORS headers
app.get('/api/gdelt', async (req, res) => {
  const params = new URLSearchParams(req.query).toString()
  const upstream = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`
  try {
    const r = await fetch(upstream, { headers: { 'Accept': 'application/json' } })
    if (!r.ok) return res.status(r.status).json({ error: 'GDELT upstream error' })
    const data = await r.json()
    res.json(data)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

// WHO Disease Outbreak News RSS — lacks CORS headers
app.get('/api/who/*', async (req, res) => {
  const upstreamPath = req.path.replace('/api/who', '')
  const upstream = `https://www.who.int${upstreamPath}`
  try {
    const r = await fetch(upstream)
    const text = await r.text()
    res.set('Content-Type', r.headers.get('content-type') || 'text/xml')
    res.send(text)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

// GDACS disaster alerts RSS — lacks CORS headers
app.get('/api/gdacs/*', async (req, res) => {
  const upstreamPath = req.path.replace('/api/gdacs', '')
  const upstream = `https://www.gdacs.org${upstreamPath}`
  try {
    const r = await fetch(upstream)
    const text = await r.text()
    res.set('Content-Type', r.headers.get('content-type') || 'text/xml')
    res.send(text)
  } catch (e) {
    res.status(502).json({ error: e.message })
  }
})

// ── Static frontend (production only) ───────────────────────────────────────

const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')))

app.listen(PORT, () => {
  console.log(`Doomsday proxy server running on http://localhost:${PORT}`)
})
