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

### Remaining / Future Work
- [ ] **NEXT SESSION — Debug failing API fetches on production server:**
  - Wars: "GDELT fetch failed"
  - Famine: "ReliefWeb fetch failed"
  - Moral: "GDELT fetch failed"
  - Likely cause: Express proxy on AWS can't reach upstream APIs (network/firewall/timeout issue) — need to test with `curl` on the server and check error logs
- [ ] Allow manual override of the 4 annual baselines via a settings panel (so they can be updated each January without a code change)
- [ ] Consider adding a "share" / screenshot button
- [ ] Consider a "history" view showing the total meter score over time
