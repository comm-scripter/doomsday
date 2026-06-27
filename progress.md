# Doomsday Meter — Progress Log

## Session 1 — 2026-06-26

### Completed
- [x] Created planning document (`DOOMSDAY_METER_PLAN.md`) — all 10 categories, weights, scoring logic, API sources
- [x] Scaffolded React + Vite project (`app/`)
- [x] Installed Tailwind CSS v4 (`@tailwindcss/vite`)
- [x] Built SVG semicircular gauge (`DoomsdayGauge.jsx`) — 6 color bands, animated needle, tick marks
- [x] Built category breakdown panel (`CategoryPanel.jsx`) — score bars, detail text, time-ago stamps
- [x] Built scoring engine (`scoring.js`) — weighted average, pending categories use baseline defaults
- [x] Wired up 3 live MVP APIs:
  - USGS Earthquake (real-time, M6+ / M7+ counts vs. 50-year baseline)
  - GDELT (24h conflict article count + tone analysis)
  - NOAA Space Weather (Kp-index → G-scale storm scoring)
- [x] Auto-refresh hook (`useLiveData.js`) — per-category intervals (15m quakes, 15m solar, 6h wars)
- [x] Manual "Refresh now" button
- [x] Dark theme with radial gradient background
- [x] Footer disclaimer

### File Structure
```
D:\doomsday\
  app/
    src/
      api/
        usgs.js       ← USGS earthquake API
        gdelt.js      ← GDELT conflict/tone API
        noaa.js       ← NOAA space weather API
      components/
        DoomsdayGauge.jsx   ← SVG gauge, needle, bands
        CategoryPanel.jsx   ← per-category score cards
        Header.jsx          ← title + scripture quote
        RefreshBar.jsx      ← last updated + refresh button
      data/
        categories.js       ← all 10 categories + band definitions
      hooks/
        useLiveData.js      ← fetch + auto-refresh logic
      scoring.js            ← weighted average score
      App.jsx               ← root layout
      index.css             ← Tailwind import + base styles
```

### Run the app
```
cd D:\doomsday\app
npm run dev
```
Open http://localhost:5173

---

## Session 2 — 2026-06-26 (continued)

### Completed
- [x] CORS fix for GDELT (and pre-wired for WHO RSS)
  - Dev: Vite proxy in `vite.config.js` — `/api/gdelt` → `api.gdeltproject.org`
  - Prod: Express proxy server at `server/index.js` (port 3001) — also serves built `dist/`
  - Updated `gdelt.js` to use relative `/api/gdelt` URL (works in both contexts)
  - Added `/api/who/*` proxy route for the pestilence feed (next session)
  - `npm run dev` → Vite dev server with proxy built in
  - `npm run build && npm start` → Express serves built app + proxies on port 3001

### Completed (continued)
- [x] Famine — ReliefWeb API (UN OCHA): 90-day count of "famine / food crisis / acute food insecurity" reports vs. baseline
- [x] Pestilence — WHO Disease Outbreak News RSS: 60-day outbreak count + severity keyword bonus (ebola/plague/novel = +12 each)
- [x] Natural Disasters — GDACS RSS: active alert count weighted by level (Red=15, Orange=6, Green=1)
- [x] Cosmic (upgraded) — NASA NeoWs DEMO_KEY bolted onto NOAA Kp: 7-day NEO close approaches + PHA flag; localStorage cached daily to respect rate limits
- [x] New proxy routes: /api/gdacs added to Vite dev proxy and Express server
- [x] Removed famine/pestilence/disasters from PENDING_DEFAULTS — now on real data

### 7 of 10 categories now live
| Category | Source | Status |
|----------|--------|--------|
| Wars | GDELT | ✅ live |
| Earthquakes | USGS | ✅ live |
| Famine | ReliefWeb | ✅ live |
| Pestilence | WHO DON RSS | ✅ live |
| Natural Disasters | GDACS RSS | ✅ live |
| Cosmic Signs | NOAA + NASA NeoWs | ✅ live |
| Moral Decline | — | ⏳ pending |
| Persecution | — | ⏳ pending |
| Apostasy | — | ⏳ pending |
| Israel/ME | — | ⏳ pending |

### Session 3 — 2026-06-26 (continued)

#### Completed
- [x] Sparklines — `Sparkline.jsx`: SVG polyline per category, gradient fill, live endpoint dot, trend arrow (↑↓→) based on last 5 readings
- [x] History persistence — `useHistory.js`: stores last 30 score readings per category in localStorage; survives page refresh; keyed by date
- [x] History recording wired into `useLiveData.js` — calls `recordScore` on every successful API fetch; re-reads localStorage and returns `history` alongside `scores`
- [x] Scripture panels — `scripture.js`: full verse text + 2–3 sentence contextual explanation for all 10 categories
- [x] Scripture accordion — each category card has a "▶ What does this mean?" toggle; animates open/closed via CSS max-height transition
- [x] `CategoryPanel` refactored into `CategoryCard` sub-component so each card holds its own open/closed state independently

### Session 4 — 2026-06-26 (continued)

#### Completed
- [x] Header timestamp — shows "Updated today at 3:42 PM" (same day) or "Updated Jun 25 at 3:42 PM" (prior day); computed as max of all per-category lastUpdated timestamps; hidden until first fetch completes
- [x] Mobile gauge — removed `max-w-lg` width cap on small screens (`sm:max-w-lg`); gauge fills full container width on mobile for a taller render
- [x] Mobile padding — main container changed to `px-2 sm:px-4`; reduces wasted side space on small screens
- [x] Mobile header — top padding reduced to `pt-5 sm:pt-8` on mobile
- [x] Footer updated to credit all 7 live data sources

### Session 5 — 2026-06-26 (continued)

#### Completed — 10/10 categories now live
- [x] Shared helper `_gdeltHybrid.js`: GDELT 24h news-tone query anchored to a calibrated annual baseline ±20 modifier; prevents wild single-day swings while still responding to real events
- [x] **Moral Decline** (`moral.js`): base 45 (WJP Rule of Law Index 2024 declining in 57% of countries; UNODC trends) + GDELT crime/corruption/lawlessness tone
- [x] **Persecution** (`persecution.js`): base 58 (Open Doors WWL 2025: 380M Christians face high+ persecution; 4,998 killed in 2024) + GDELT Christian persecution news tone
- [x] **Apostasy** (`apostasy.js`): base 46 (Pew 2024: US Christian affiliation fell 75%→63% in a decade; partially offset by Joshua Project gospel coverage reaching 97% of world) + GDELT church-decline/secularism tone
- [x] **Israel & Middle East** (`israel.js`): base 65 (post-Oct 7 multi-front conflict, Iranian proxy network, ICJ/UN isolation) + GDELT Israel conflict news tone
- [x] `scoring.js` — removed all static PENDING_DEFAULTS; all 10 categories now compute from live data; excluded from weighted average only while initial fetch is in-flight
- [x] `categories.js` — all 10 categories marked `apiStatus: 'live'`
- [x] `CategoryPanel.jsx` — added detail formatter for the 4 hybrid categories: "87 articles · tone −2.4 · base 58 +5"

### All 10 categories live
| Category | Source | Baseline |
|----------|--------|----------|
| Wars | GDELT (pure tone) | — |
| Earthquakes | USGS | 50yr avg |
| Famine | ReliefWeb | 25 reports/90d |
| Pestilence | WHO DON RSS | 10 outbreaks/60d |
| Natural Disasters | GDACS RSS | Red/Orange/Green pts |
| Cosmic Signs | NOAA Kp + NASA NeoWs | — |
| Moral Decline | GDELT + WJP/UNODC | 45 |
| Persecution | GDELT + Open Doors | 58 |
| Apostasy | GDELT + Pew/Joshua | 46 |
| Israel/ME | GDELT + ACLED | 65 |

### Session 6 — 2026-06-26 (continued)

#### Completed — Tab grid UI redesign
- [x] Rewrote `CategoryPanel.jsx` — replaced accordion list with 2-row × 5-column clickable tab grid
- [x] **Tab design**: emoji icon + short label (`tabLabel`) + colored score number + mini score progress bar; inactive tabs are dark, active tabs glow with the category's band color
- [x] **Detail card (DetailPanel)**: slides in below the row of the clicked tab via `panel-in` keyframe animation
  - Header: icon + category name + scripture ref + weight % + time-ago
  - Large colored score + band label (top-right)
  - Sparkline (when ≥2 history points available)
  - "Live data" summary box with formatted detail text for all 10 categories
  - Scripture verse (italic, color-left-border) + explanation
- [x] **Click behavior**: clicking the active tab closes its panel; clicking a different tab switches to it; only one panel open at a time (cross-row)
- [x] **No overflow:hidden** — conditional rendering avoids the stacking/bleed bug from Session 3
- [x] **Animation**: `style={{ animation: 'panel-in 0.22s ease-out' }}` using existing `@keyframes panel-in` in `index.css`
- [x] `formatDetail()` helper covers all 10 category IDs with human-readable live data summaries
- [x] `timeAgo()` helper shows "just now / Xm ago / Xh ago" in the panel header

---

## Session 7 — 2026-06-27

### Completed — Debug failing API fetches in production

#### Root causes found and fixed:
- **GDELT (Wars, Moral)**: EC2 was firing 5 concurrent GDELT requests on page load, triggering 429 rate-limit ("1 request per 5 seconds"). Fixed with server-side queue (5.5s spacing) + 6-hour in-memory cache in `server/index.js`. All GDELT categories now queue on cold load (~30s total) then serve instantly from cache.
- **ReliefWeb (Famine)**: Two issues — (1) famine was fetching directly from browser, CORS rejected by ReliefWeb when origin is `http://IP:3001`. (2) ReliefWeb v1 API decommissioned; v2 requires a registered appname.
- **All proxies**: Added `User-Agent` header and `AbortSignal.timeout(15000)` to all upstream fetches; added `console.error` logging so errors appear in `pm2 logs`.

#### ReliefWeb appname registration (pending)
- ReliefWeb v2 (`https://api.reliefweb.int/v2/reports`) requires a registered appname
- Registered appname submitted 2026-06-27: **`kkreiter-doomsdaymeter-x7k2`**
- Registration page: https://apidoc.reliefweb.int/parameters#appname
- Approval expected within ~2 days
- **To activate once approved:**
  1. Set env var on EC2: `RELIEFWEB_APPNAME=kkreiter-doomsdaymeter-x7k2`
  2. Restore `famine.js` to use ReliefWeb POST API (see below)
  3. `pm2 restart doomsday`

#### Famine — temporary GDELT fallback
- While waiting for ReliefWeb approval, `famine.js` switched to GDELT hybrid scoring (same pattern as Moral/Persecution/Apostasy/Israel)
- Baseline: 55 (calibrated to 345M in acute food insecurity 2024, active famines in Sudan/Gaza/Yemen)
- **To restore ReliefWeb later**, replace `famine.js` with:
```js
import { gdeltHybridScore } from './_gdeltHybrid' // remove this
// famine.js — ReliefWeb v2 POST, routed through Express proxy
const BASELINE_90_DAYS = 25
export async function fetchFamineScore() {
  const from = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const res = await fetch('/api/reliefweb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: { value: 'famine OR "food crisis" OR "acute food insecurity" OR "food emergency"' },
      filter: { field: 'date.created', value: { from: `${from}T00:00:00+00:00` } },
      fields: { include: ['title'] },
      limit: 5,
    }),
  })
  if (!res.ok) throw new Error('ReliefWeb fetch failed')
  const data = await res.json()
  const count = data.totalCount ?? 0
  const headlines = (data.data ?? []).map(d => d.fields?.title ?? '').filter(Boolean)
  return { score: Math.min(100, Math.round((count / BASELINE_90_DAYS) * 50)), detail: { reports90d: count, baseline: BASELINE_90_DAYS, headlines } }
}
```

- [x] Fixed stuck-on-loading — `useLiveData.js` now updates each category individually as it resolves (instead of batching after all 10 complete); app renders on first successful fetch; added per-category console logging with timestamps and score/detail

---

## Session 8 — 2026-06-27 (continued)

### Completed — API reliability + gauge UI overhaul

#### GDELT fixes
- **Query syntax**: All GDELT queries were missing required `()` around OR terms — caused every query to return a non-JSON error, which then burned rate-limit budget. Fixed by wrapping all queries in `(${query})` in `_gdeltHybrid.js` and rewriting `gdelt.js` to use `URLSearchParams`.
- **AND queries rewritten**: `persecution.js` and `israel.js` used `AND` syntax incompatible with GDELT's parentheses rules. Rewrote as pure OR phrase queries.
- **Rate limit handling**: Upgraded server queue — `gdeltNextAllowed` timestamp replaces simple interval; 429 response triggers 35s penalty before next request; non-JSON 200 responses caught and rejected cleanly. Interval bumped to 10s.
- **Client retry cooldown**: Failed categories now wait 5 minutes before retrying (tracked in `retryAfterRef`), preventing exponential queue buildup on repeated failures.
- **In-flight deduplication**: `inFlightRef` Set prevents the same category from queuing twice if the 60s refresh timer fires before the previous fetch resolves.
- **Refresh tick logging**: Each 60s tick logs which categories are 🔄fetching / ⏳in-flight / ❌cooldown(Xs) / ⏱Xs-until-refresh.

#### Gauge UI — `DoomsdayGauge.jsx`
- **Smooth needle animation**: Needle is now drawn statically at 0° and rotated via CSS `transform: rotate()` with `transform-origin` at hub center. CSS transition `1.4s cubic-bezier(0.34, 1.56, 0.64, 1)` gives springy sweep. Two `requestAnimationFrame` frames on first render let the browser paint the -180° start position before animating to the real score.
- **Score counter**: JS `requestAnimationFrame` loop counts the score number up from 0 using easeOutBack easing, in sync with the needle sweep.
- **Inner label band**: Removed pill badges; replaced with a thin inner arc ring (radius 126, stroke 16) divided into 6 continuous band segments. Each segment labeled with curved `<textPath>` text. Active segment glows (opacity 0.65 arc + full text); inactive segments nearly invisible (0.1/0.3). Transitions on `opacity 0.5s ease`.
- **Semicircle cover**: Dark (`#0f172a`) upper half-circle (radius 50) centered at hub, flat edge at `CY+5` (bottom of pivot). Rendered after needle so it hides the needle base. Score number floats on top.
- **Cover glow**: Blurred copy of cover shape (same path, band color, `feGaussianBlur stdDeviation=11`, opacity 0.32) rendered before the needle — creates colored ambient glow radiating upward from the cover edge onto the gauge face. Color transitions with band via `fill 0.5s ease`.

### Remaining / Future Work
- [ ] **Activate ReliefWeb** once appname `kkreiter-doomsdaymeter-x7k2` is approved (set `RELIEFWEB_APPNAME` env var on EC2 and restore `famine.js`)
- [ ] Allow manual override of the 6 annual baselines via a settings panel (so they can be updated each January without a code change)
- [ ] Consider adding a "share" / screenshot button
- [ ] Consider a "history" view showing the total meter score over time

---

## Session 9 — 2026-06-27 (continued)

### Completed — Production deployment + GDELT resilience

#### Deployed to EC2
- [x] Sessions 7+8 deployed: `git pull && cd app && npm run build && pm2 restart doomsday`
- [x] Corrected `SERVER.md` deploy instructions — now distinguishes frontend changes (require `npm run build`) from server-only changes (just `pm2 restart`); added hard-refresh note for browser cache

#### GDELT queue snowball fix (server)
- **Root cause**: multiple concurrent page loads each queued 5–6 GDELT requests for the same URLs; since 429s prevented any cache entries, every visitor multiplied the queue endlessly
- **Fix**: added `gdeltWaiters` Map in `server/index.js` — if a URL is already queued, subsequent requests attach to the existing waiter list instead of adding a new queue entry; at most one upstream fetch per unique URL at any time

#### GDELT negative cache + longer backoff (server)
- After a 429, the URL is now suppressed for 30 minutes (`gdeltErrorCache`) — future requests for that URL return an immediate error without queuing, letting the EC2 IP recover
- Increased inter-request interval from 10s → 15s; increased 429 penalty from 35s → 2 minutes

#### Baseline fallback scores (client)
- `_gdeltHybrid.js` and `gdelt.js` now catch all fetch errors and return `{ score: BASE, detail: { fallback: true, base: BASE } }` instead of throwing — GDELT categories never propagate errors to `useLiveData.js`
- `CategoryPanel.jsx` `formatDetail()` detects `detail.fallback` and shows "Live news feed unavailable · showing calibrated annual baseline (N)"

#### Instant baseline display on page load (client)
- Added `baseline` field to the 6 GDELT-backed categories in `categories.js` (wars=40, famine=55, moral=45, persecution=58, apostasy=46, israel=65)
- `useLiveData.js` initializes `scores` state and `scoresRef` with baseline values at startup — all 10 cards show a score the instant the page loads; live data silently overwrites baselines as GDELT responds
