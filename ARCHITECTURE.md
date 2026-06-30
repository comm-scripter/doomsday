# Doomsday Meter — Architecture

How the app works, how data flows, and how to change things.

---

## Request flow

```
Browser
  │
  ├── /api/gdelt?...      ──► Express server (port 3001)
  │                              │
  │                              ├── in-memory cache hit (< 6h old)?
  │                              │     └── return immediately
  │                              │
  │                              └── cache miss → rate-limited queue
  │                                    └── fetch api.gdeltproject.org → cache → return
  │
  ├── /api/who/*          ──► Express server → fetch who.int (no cache)
  ├── /api/gdacs/*        ──► Express server → fetch gdacs.org (no cache)
  ├── /api/reliefweb      ──► Express server → fetch reliefweb.int (no cache)
  │
  └── earthquake.usgs.gov ──► direct (USGS has open CORS headers)
      api.nasa.gov        ──► direct
      services.swpc.noaa.gov ──► direct
```

The server's two jobs: bypass CORS restrictions on external APIs, and cache GDELT responses to avoid rate limiting.

---

## The 10 categories

| Category | Weight | Data source | Route | Client interval |
|---|---|---|---|---|
| Wars & Conflict | 20% | GDELT | `/api/gdelt` (server-cached 6h) | 6h |
| Earthquakes | 12% | USGS | direct | 15 min |
| Famine | 12% | ReliefWeb | `/api/reliefweb` (proxy only) | 6h |
| Pestilence | 12% | WHO RSS | `/api/who/*` (proxy only) | 6h |
| Natural Disasters | 10% | GDACS RSS | `/api/gdacs/*` (proxy only) | 6h |
| Cosmic Signs | 8% | NOAA + NASA | direct | 15 min |
| Moral Decline | 8% | GDELT | `/api/gdelt` (server-cached 6h) | 6h |
| Persecution | 6% | GDELT | `/api/gdelt` (server-cached 6h) | 6h |
| Apostasy | 6% | GDELT | `/api/gdelt` (server-cached 6h) | 6h |
| Israel & Middle East | 6% | GDELT | `/api/gdelt` (server-cached 6h) | 6h |

Weights sum to 100%. Only categories with data are included in the weighted average — if a fetch is still in-flight or failed, that category is skipped.

---

## Scoring

### Wars (`src/api/gdelt.js`)
Fetches the last 24h of GDELT articles mentioning war/conflict keywords. Maps the average article tone (roughly −10 to +10) to a score:

```
score = 40 − (avgTone × 4)    clamped 0–100
```

More negative tone (more distressing headlines) → higher score.

### GDELT-hybrid categories (`src/api/_gdeltHybrid.js`)
Used by: Moral, Persecution, Apostasy, Israel. Each has a hand-calibrated `baseScore` anchored to real-world index data. GDELT's daily tone adjusts it by up to ±20 points:

```
modifier = clamp(−(avgTone × 2), −20, +20)
score = baseScore + modifier    clamped 0–100
```

The baseline is the long-run level; GDELT makes it responsive to breaking events without being entirely driven by a single day's headlines.

| Category | Baseline | Baseline rationale |
|---|---|---|
| Wars | 40 | GDELT default (not hybrid) |
| Famine | 55 | FEWS NET acute food insecurity levels, 2024 |
| Moral | 45 | WJP Rule of Law Index, UNODC homicide trends, TI CPI 2024 |
| Persecution | 58 | Open Doors World Watch List, USCIRF 2024 |
| Apostasy | 46 | Gallup / Pew religion surveys, US church attendance trends |
| Israel | 65 | Post-Oct 7 multi-front conflict, active proxy network |

### Earthquakes (`src/api/usgs.js`)
Compares recent seismic activity to historical baselines:

```
ratio30 = M6+ quakes in last 30 days  / 13.0 (baseline)
ratio90 = M7+ quakes in last 90 days  / 1.5  (baseline)
score   = (ratio30 × 0.6 + ratio90 × 0.4) × 50    clamped 0–100
```

### Cosmic Signs (`src/api/cosmic.js`)
Combines two direct feeds:
- NOAA SWPC — solar/geomagnetic storm data (Kp index)
- NASA NeoWs — near-Earth asteroid close approaches

```
score = solarScore × 0.7 + neoScore × 0.3
```

### Final score (`src/scoring.js`)
Weighted average across whichever categories have returned data:

```
score = Σ(categoryScore × weight) / Σ(weight of present categories)
```

---

## Gauge bands

| Score | Band | Color |
|---|---|---|
| 0–25 | Calm | Green |
| 26–40 | Elevated | Light green |
| 41–55 | Watch | Yellow |
| 56–70 | Warning | Orange |
| 71–85 | Critical | Red |
| 86–100 | Imminent | Dark red |

---

## Refresh behavior

### Automatic
`useLiveData` runs a tick every 60 seconds. Each tick calls `runFetcher` for all 10 categories, but each category skips the fetch if its own interval hasn't elapsed and it already has data. So in practice:
- Earthquakes and Cosmic: re-fetch every 15 minutes
- Disasters: every hour
- Everything else: every 6 hours

### Manual ("Refresh now" button)
Calls `forceRefresh`, which bypasses all interval checks and fires all 10 fetchers regardless of age. Error cooldowns (5-minute backoff after a failure) are also bypassed.

The GDELT server cache is NOT bypassed — if the server cached a GDELT response 20 minutes ago, a force refresh still gets that cached response. Only GDELT upstream fetches are rate-limited and cached server-side; nothing the client can do will skip that.

### On page load
GDELT-backed categories show their calibrated `baseline` score immediately so the UI is never blank. Live data overwrites them as each fetch completes.

---

## How to change things

**Adjust a category's baseline score**
Edit the `baseline` value in `src/data/categories.js`. This affects the initial display value and the anchor for GDELT-hybrid scoring.

**Adjust a category's weight**
Edit `weight` in `src/data/categories.js`. Weights don't need to sum to any specific value — the scorer normalises automatically — but keeping them summing to 1.0 makes them easier to reason about.

**Change GDELT's server-side cache TTL**
`GDELT_TTL` in `app/server/index.js` (line 17). Currently 6 hours.

**Change a category's client-side fetch interval**
`interval` in the `FETCHERS` array in `src/hooks/useLiveData.js`. Use the `H6`, `H1`, `M15` constants already defined there.

**Add a new category**
1. Add an entry to `CATEGORIES` in `src/data/categories.js`
2. Write a fetcher in `src/api/<id>.js` that returns `{ score, detail }`
3. Import it and add it to `FETCHERS` in `src/hooks/useLiveData.js`
4. Add the initial null state for it in `useLiveData`'s `useState` call

**Add server-side caching for a non-GDELT proxy**
The WHO/GDACS/ReliefWeb routes currently proxy with no caching. To add caching, follow the `gdeltCache` Map pattern in `app/server/index.js` — store `{ data, expiry }` keyed by URL and check before upstream fetch.
