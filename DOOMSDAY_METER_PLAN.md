# Doomsday Meter — Planning Document

## Overview

A real-time "doomsday meter" driven by live data sources, calibrated against biblical end-times indicators
drawn primarily from Matthew 24, Luke 21, Revelation, Daniel, and supporting Pauline epistles.

The meter outputs a single 0–100 score displayed as a gauge with three bands:
- **GREEN** (0–40): Signs present but within historical norms
- **YELLOW** (40–70): Elevated frequency, severity, or convergence of multiple indicators
- **RED** (70–100): Unprecedented or rapidly accelerating convergence across categories

---

## Biblical Source Mapping

| Scripture | Category | Key Signs |
|-----------|----------|-----------|
| Matthew 24:6–7 | Wars | Nation against nation, kingdom against kingdom |
| Matthew 24:7 | Natural Disasters | Earthquakes in various places, famines |
| Matthew 24:5,11,24 | Deception | False christs, false prophets, great signs and wonders |
| Matthew 24:9 | Persecution | Christians delivered up, killed, hated by all nations |
| Matthew 24:12 | Moral Decline | Lawlessness increased, love of many grows cold |
| Matthew 24:14 | Gospel Spread | Gospel preached to all nations before the end |
| Matthew 24:15 | Temple | Abomination of desolation in the holy place |
| Matthew 24:29 | Cosmic Signs | Sun darkened, moon blood red, stars fall, heavens shaken |
| Luke 21:11 | Pestilence | Great plagues and pestilences |
| Luke 21:25 | Cosmic/Sea | Signs in sun/moon/stars, seas roaring |
| Luke 21:26 | Fear | Men's hearts failing from fear, powers of heavens shaken |
| Daniel 12:4 | Knowledge | Many run to and fro, knowledge increased greatly |
| Ezekiel 37 | Israel | Dry bones — Israel reborn as a nation (fulfilled 1948) |
| Revelation 6:1–8 | Four Horsemen | Conquest, war, famine, death/pestilence |
| Revelation 6:12 | Earthquake | Great earthquake, sun black, moon red |
| Revelation 8:7–12 | Environmental | Hail, fire, sea turned, waters bitter, darkened sky |
| Revelation 13:16–17 | Economy | No one can buy or sell without the mark |
| Revelation 16:18 | Earthquake | Greatest earthquake since man was on earth |
| 2 Timothy 3:1–5 | Moral Decline | Perilous times: lovers of self, money, pleasure, ungodly |
| 2 Thessalonians 2:3 | Apostasy | Great falling away (apostasy) before the man of sin revealed |
| 1 Timothy 4:1 | Apostasy | Departure from the faith, doctrines of demons |

---

## Indicator Categories & Scoring

Each category has a **weight** (how heavily it influences the total score) and a **sub-score** (0–100)
derived from live data. The final meter score is the weighted average.

---

### 1. WARS & GEOPOLITICAL CONFLICT (Weight: 20%)

**Biblical basis:** Matthew 24:6–7 — "wars and rumors of wars... nation shall rise against nation"

**Scoring sub-indicators:**
- Number of active armed conflicts globally (ACLED data)
- Nuclear threat level (Bulletin of Atomic Scientists Doomsday Clock — current minutes to midnight)
- Number of active UN peacekeeping missions
- Geopolitical tension index (US-China, Russia-NATO, Middle East)
- Presence of conflict within or bordering Israel

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| <10 active conflicts, no nuclear escalation | 0–30 |
| 10–20 conflicts, moderate nuclear tension | 31–60 |
| 20+ conflicts, nuclear standoff, Israel directly threatened | 61–100 |

**Free Data Sources:**
- [ACLED API](https://apidocs.acleddata.com/) — Armed conflict event data (free API key)
- [GDELT Project](https://www.gdeltproject.org/api.html) — Global event database, tone/conflict analysis (completely free)
- Bulletin of Atomic Scientists — Doomsday Clock (scrape/RSS)
- ReliefWeb API — `https://api.reliefweb.int/v1/reports` (free, no key)

---

### 2. EARTHQUAKES (Weight: 12%)

**Biblical basis:** Matthew 24:7, Luke 21:11, Revelation 6:12, 16:18 — "earthquakes in various places"

**Scoring sub-indicators:**
- Number of magnitude 6.0+ earthquakes (rolling 30 days)
- Number of magnitude 7.0+ earthquakes (rolling 90 days)
- Deaths from earthquake events (rolling 365 days)
- Unusual earthquake clustering in prophetically significant regions (Middle East, Ring of Fire)

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| M6.0+ count near historical average (~13/month) | 0–30 |
| M6.0+ count 1.5x historical average | 31–60 |
| M7.0+ spike, major urban casualties, or significant Israel-region quakes | 61–100 |

**Free Data Sources:**
- USGS Earthquake Catalog API — `https://earthquake.usgs.gov/fdsnws/event/1/` (completely free, no key)
- EMSC (European Mediterranean Seismological Centre) API — free

---

### 3. FAMINE & FOOD INSECURITY (Weight: 12%)

**Biblical basis:** Matthew 24:7, Revelation 6:5–6 — "famines... a quart of wheat for a denarius"

**Scoring sub-indicators:**
- IPC Phase 3–5 (crisis/emergency/famine) population count globally
- FAO Food Price Index (monthly)
- Number of countries in food crisis (FEWS NET)
- Global grain reserve levels as % of consumption
- Hunger hotspots (OCHA active alerts)

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| <100M in IPC Phase 3+, stable food prices | 0–30 |
| 100–300M in IPC Phase 3+, elevated prices | 31–60 |
| >300M in IPC Phase 3+, active famine declared, price spikes | 61–100 |

**Free Data Sources:**
- FAO Food Price Index — `https://www.fao.org/faostat/en/` (free download/API)
- FEWS NET — `https://fews.net/api/` (free)
- OCHA ReliefWeb — `https://api.reliefweb.int/v1/` (free, no key)
- World Food Programme VAM — free APIs

---

### 4. PESTILENCE & DISEASE (Weight: 12%)

**Biblical basis:** Luke 21:11, Revelation 6:8 — "pestilences... death was given power over a fourth of the earth"

**Scoring sub-indicators:**
- Active WHO Disease Outbreak News events
- Number of countries with active outbreaks of novel or high-severity pathogens
- WHO PHEIC (Public Health Emergency of International Concern) declarations (0 or 1)
- Antimicrobial resistance mortality trend
- Novel zoonotic spillover events

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| Normal endemic background, no PHEIC | 0–30 |
| Multiple elevated outbreaks, regional spread | 31–60 |
| Active PHEIC, novel pandemic pathogen, rapid global spread | 61–100 |

**Free Data Sources:**
- WHO Disease Outbreak News (RSS feed) — `https://www.who.int/rss-feeds/news-english.xml`
- WHO Global Outbreak Alert (web scrape or API)
- ProMED-mail — outbreak monitoring RSS
- CDC Global Health Security — reports
- HealthMap API — `https://healthmap.org/` (free tier)

---

### 5. NATURAL DISASTERS (Weight: 10%)

**Biblical basis:** Luke 21:11,25 — "fearful events and great signs from heaven... roaring of the sea"

**Scoring sub-indicators:**
- Number of GDACS Red Alert events (rolling 90 days)
- Deaths from natural disasters (rolling 12 months)
- Number of Category 4–5 tropical cyclones (rolling season)
- Major volcanic eruptions (VEI 4+, rolling 12 months)
- Extreme flooding events displacing >100k people

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| Near-average disaster frequency | 0–30 |
| 1.5x average, elevated Red Alerts | 31–60 |
| Record-breaking counts, mass casualties, major volcanic event | 61–100 |

**Free Data Sources:**
- GDACS (Global Disaster Alert and Coordination System) — `https://www.gdacs.org/gdacsapi/` (free)
- EM-DAT (CRED) — disaster database (free registration)
- NOAA Storm Events Database — free
- Volcano Observatory Notices (USGS/Smithsonian) — `https://volcano.si.edu/` (free)

---

### 6. COSMIC & SOLAR SIGNS (Weight: 8%)

**Biblical basis:** Matthew 24:29, Luke 21:25, Revelation 6:12 — "sun darkened, moon blood red, stars fall"

**Scoring sub-indicators:**
- Solar storm intensity (G-scale, Kp-index)
- Active sunspot count vs. solar cycle peak
- Unusual astronomical events (blood moons, solar eclipses visible from Israel)
- Near-Earth asteroid close approaches (< 1 LD)
- Aurora visible at unusually low latitudes (indicator of major CME)

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| Normal solar cycle, no close approaches | 0–30 |
| G3+ solar storm, notable eclipses, moderate close approaches | 31–60 |
| G5 Carrington-class storm, blood moon tetrad, significant NEO | 61–100 |

**Free Data Sources:**
- NOAA Space Weather Center API — `https://services.swpc.noaa.gov/` (completely free)
- NASA API (NeoWs) — `https://api.nasa.gov/` (free key, near-Earth objects)
- NASA DONKI — Solar/CME events
- JPL Small-Body Database — asteroid close approaches

---

### 7. MORAL DECLINE & LAWLESSNESS (Weight: 8%)

**Biblical basis:** Matthew 24:12, 2 Timothy 3:1–5 — "lawlessness increased... perilous times... lovers of self"

**Scoring sub-indicators:**
- Global homicide rate trend (UNODC)
- Human trafficking reports (UNODC/IOM)
- Corruption Perceptions Index (Transparency International, annual)
- Hate crime incident trends
- Social cohesion/trust index decline

**Note:** This is the most subjective category. Use trend direction (increasing/stable/decreasing)
rather than absolute numbers to drive scoring.

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| Stable or improving trends | 0–30 |
| Measurable multi-year worsening trend | 31–60 |
| Rapid deterioration across multiple metrics simultaneously | 61–100 |

**Free Data Sources:**
- UNODC Data — `https://www.unodc.org/unodc/en/data-and-analysis/` (free download)
- World Justice Project — Rule of Law Index (free download)
- UN Human Development Reports — free

---

### 8. RELIGIOUS PERSECUTION (Weight: 6%)

**Biblical basis:** Matthew 24:9 — "you will be handed over to be persecuted and put to death... hated by all nations because of me"

**Scoring sub-indicators:**
- Open Doors World Watch List — number of countries with extreme persecution
- Christian deaths for faith per year (Open Doors estimate)
- Countries with anti-blasphemy/apostasy laws
- Churches attacked/destroyed per year

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| <50 countries with high+ persecution | 0–30 |
| 50–60 countries, thousands martyred | 31–60 |
| >60 countries, tens of thousands martyred, major Western nations included | 61–100 |

**Free Data Sources:**
- Open Doors International — `https://www.opendoorsusa.org/` (annual reports, free)
- Aid to the Church in Need — reports (free)
- USCIRF (US Commission on International Religious Freedom) — annual report (free)
- Pew Research Center — global religious restrictions (free)

---

### 9. APOSTASY & GOSPEL SPREAD (Weight: 6%)

**Biblical basis:** 2 Thessalonians 2:3 ("great falling away"), Matthew 24:14 ("gospel preached to all nations")

**Two opposing forces — both accelerate prophetic fulfillment:**

**Apostasy sub-indicators:**
- % of formerly Christian nations with declining church attendance
- Number of denominations formally abandoning core biblical doctrines
- Self-identified "nones" (no religion) growth rate

**Gospel Spread sub-indicators:**
- Number of people groups with no Bible translation (Joshua Project)
- % of world with access to the gospel (radio, internet, missionary)
- Global church growth in unreached regions

**Scoring logic:**
- High apostasy in established churches + high gospel coverage = higher score (convergence)
- Score rises when both trends accelerate simultaneously

**Free Data Sources:**
- Joshua Project API — `https://joshuaproject.net/api/` (free key)
- Pew Research — religious landscape surveys (free reports)
- World Christian Database summaries (free summaries)

---

### 10. ISRAEL & MIDDLE EAST (Weight: 6%)

**Biblical basis:** Ezekiel 37 (fulfilled: 1948 rebirth), Matthew 24:15,32–34 (fig tree), Zechariah 12

**Scoring sub-indicators:**
- Active military conflict involving Israel
- Threat level from Iran/proxies toward Israel
- Progress toward Third Temple construction (Sanhedrin/Temple Institute)
- Abraham Accords expansion or collapse
- International isolation of Israel (UN votes against)

**Scoring logic:**
| Condition | Score |
|-----------|-------|
| Stable borders, peace agreements holding | 0–30 |
| Active cross-border conflict, Iranian escalation | 31–60 |
| Existential threat to Israel, regional war, Temple site activity | 61–100 |

**Free Data Sources:**
- ACLED — Israel/Middle East filter
- UN General Assembly vote records
- Jerusalem Post / Times of Israel RSS feeds
- Temple Institute news (RSS)

---

## Scoring Architecture

```
Final Score = (
  Wars×0.20 +
  Earthquakes×0.12 +
  Famine×0.12 +
  Pestilence×0.12 +
  NaturalDisasters×0.10 +
  CosmicSigns×0.08 +
  MoralDecline×0.08 +
  Persecution×0.06 +
  Apostasy×0.06 +
  Israel×0.06
)
```

**Weights total: 100%**
**Score range: 0–100**

---

## Meter Bands

| Band | Score Range | Color | Meaning |
|------|-------------|-------|---------|
| CALM | 0–25 | Deep Green | Historical baseline — signs present at normal levels |
| ELEVATED | 26–40 | Light Green | Slightly above normal — one or two indicators rising |
| WATCH | 41–55 | Yellow | Multiple indicators elevated, convergence beginning |
| WARNING | 56–70 | Orange | Significant multi-category convergence, accelerating trends |
| CRITICAL | 71–85 | Red | Unprecedented convergence, rapid escalation |
| IMMINENT | 86–100 | Deep Red | Extreme multi-category crisis, historic anomalies |

---

## Normalization Strategy

Each sub-indicator must be normalized against a **historical baseline** (ideally 50-year average where available).
Use z-scores or percentile ranking to convert raw values to 0–100.

Example for earthquakes:
```
baseline_m6_per_month = 13.0  (USGS 1900–2000 average)
current_m6_per_month  = 17.5
raw_ratio = current / baseline = 1.35
score = min(100, raw_ratio * 50)  → 67.5
```

This prevents the meter from being permanently pegged at any fixed level and makes it
respond to change over historical norms — which aligns with the biblical emphasis on
"increase" and "birth pains" (Matthew 24:8) growing more frequent and intense over time.

---

## Data Refresh Cadence

| Category | Recommended Refresh |
|----------|-------------------|
| Earthquakes | Every 15 minutes (USGS real-time feed) |
| Wars/Conflicts | Every 6 hours (ACLED/GDELT) |
| Disease Outbreaks | Every 6 hours (WHO RSS) |
| Natural Disasters | Every 1 hour (GDACS) |
| Solar/Space | Every 15 minutes (NOAA) |
| Near-Earth Objects | Daily (NASA) |
| Famine/Food | Weekly (FAO/FEWS) |
| Persecution | Monthly (Open Doors annual + news feed) |
| Moral/Social | Monthly (UNODC/Pew updates) |
| Israel/Geopolitics | Every 6 hours (news RSS) |
| Apostasy/Gospel | Quarterly (Joshua Project) |

---

## Recommended Tech Stack

| Layer | Recommendation | Reason |
|-------|---------------|--------|
| Backend | Python (FastAPI) or Node.js | Easy HTTP/RSS/JSON client libraries |
| Scheduler | APScheduler (Python) or node-cron | Handles per-category refresh cadence |
| Storage | SQLite or PostgreSQL | Persist historical scores for trend lines |
| Frontend | React + D3.js or Chart.js | Animated gauge/needle component |
| Gauge Component | react-gauge-chart or custom SVG | Smooth needle animation |
| Hosting | Vercel/Netlify (frontend) + Railway/Fly.io (backend) | Free tiers available |

---

## Phase 1 MVP (Recommended Starting Point)

Start with the three highest-signal, most reliable free APIs:

1. **USGS Earthquake** — real-time, no key, extremely reliable
2. **GDELT** — free, real-time global event/conflict data
3. **NOAA Space Weather** — real-time, no key, machine-readable JSON

Build the gauge UI and scoring engine first with these three, then layer in remaining categories.

---

## Legal & Ethical Notes

- All APIs listed are free for non-commercial and educational use; check each API's ToS before
  commercial deployment.
- News/RSS scraping: respect robots.txt and rate limits.
- Frame the meter as an educational/faith-based tool that tracks observable data —
  not a prediction platform. Include appropriate disclaimers.
- The Doomsday Clock (Bulletin of Atomic Scientists) is an independent, widely-cited metric
  that can serve as a useful cross-reference for the Wars/Nuclear category.
