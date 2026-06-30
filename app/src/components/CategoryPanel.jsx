import { useState } from 'react'
import { CATEGORIES, getBand } from '../data/categories'
import { SCRIPTURE_PANELS } from '../data/scripture'
import Sparkline from './Sparkline'

const ROW1 = CATEGORIES.slice(0, 5)   // Wars, Quakes, Famine, Plague, Disasters
const ROW2 = CATEGORIES.slice(5)       // Cosmic, Moral, Martyrs, Apostasy, Israel

// ── Individual tab button ────────────────────────────────────────────────────
function Tab({ cat, raw, isActive, onClick }) {
  const score = raw?.score ?? null
  const band  = score !== null ? getBand(score) : null
  const color = band?.color ?? '#475569'

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl p-2 sm:p-3 border
                 cursor-pointer transition-all duration-200 select-none"
      style={{
        borderColor: isActive ? color : '#1e293b',
        background:  isActive ? `${color}18` : 'rgba(15,23,42,0.7)',
        boxShadow:   isActive ? `0 0 20px ${color}30, inset 0 1px 0 ${color}20` : 'none',
      }}
      aria-pressed={isActive}
    >
      <span className="text-xl sm:text-2xl leading-none">{cat.icon}</span>

      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300
                       text-center leading-tight tracking-wide mt-0.5">
        {cat.tabLabel}
      </span>

      <span
        className="text-sm sm:text-base font-bold tabular-nums leading-none mt-0.5"
        style={{ color: score !== null ? color : '#475569' }}
      >
        {score !== null ? score : '…'}
      </span>

      {/* Mini score bar */}
      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden mt-1">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${score ?? 0}%`, background: color }}
        />
      </div>
    </button>
  )
}

// ── Expanded detail card ─────────────────────────────────────────────────────
function DetailPanel({ catId, scores, history, errors, lastUpdated }) {
  const cat     = CATEGORIES.find(c => c.id === catId)
  const raw     = scores[catId]
  const score   = raw?.score ?? null
  const band    = score !== null ? getBand(score) : null
  const color   = band?.color ?? '#64748b'
  const points  = history[catId] || []
  const updated = lastUpdated[catId]
  const error   = errors[catId]
  const panel   = SCRIPTURE_PANELS[catId]

  return (
    <div
      className="rounded-xl border p-5 sm:p-6"
      style={{
        borderColor: `${color}50`,
        background: 'rgba(8,12,24,0.95)',
        animation: 'panel-in 0.22s ease-out',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cat.icon}</span>
          <div>
            <h3 className="text-lg font-bold text-slate-100 leading-tight">
              {cat.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {cat.scripture}
              <span className="mx-1.5 text-slate-700">·</span>
              {(cat.weight * 100).toFixed(0)}% of total score
              {updated && (
                <>
                  <span className="mx-1.5 text-slate-700">·</span>
                  {timeAgo(updated)}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-3xl font-bold tabular-nums leading-none" style={{ color }}>
            {score ?? '…'}
          </p>
          <p className="text-xs font-semibold tracking-widest uppercase mt-1" style={{ color }}>
            {band?.label ?? ''}
          </p>
        </div>
      </div>

      {/* Sparkline */}
      {points.length >= 2 && (
        <div className="mb-4">
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Trend</p>
          <Sparkline points={points} color={color} />
        </div>
      )}

      {/* Live data detail */}
      {score !== null && raw?.detail && !error && (
        <div className="mb-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Live data</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {formatDetail(catId, raw.detail)}
          </p>
        </div>
      )}
      {error && (
        <p className="text-sm text-red-400 mb-4">Data unavailable: {error}</p>
      )}

      {/* Scripture */}
      {panel && (
        <div className="border-t border-slate-800 pt-4">
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-3">
            What does this mean?
          </p>
          <blockquote
            className="text-sm italic text-slate-300 leading-relaxed border-l-2 pl-4 mb-3"
            style={{ borderColor: color }}
          >
            {panel.verse}
          </blockquote>
          <p className="text-xs font-semibold text-slate-500 mb-3">— {panel.ref}</p>
          <p className="text-sm text-slate-400 leading-relaxed">{panel.explanation}</p>
        </div>
      )}
    </div>
  )
}

// ── Tab row ──────────────────────────────────────────────────────────────────
function TabRow({ cats, activeId, onTabClick, scores, history, errors, lastUpdated }) {
  const rowHasActive = cats.some(c => c.id === activeId)

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {cats.map(cat => (
          <Tab
            key={cat.id}
            cat={cat}
            raw={scores[cat.id]}
            isActive={activeId === cat.id}
            onClick={() => onTabClick(cat.id)}
          />
        ))}
      </div>

      {rowHasActive && (
        <DetailPanel
          catId={activeId}
          scores={scores}
          history={history}
          errors={errors}
          lastUpdated={lastUpdated}
        />
      )}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function CategoryPanel({ scores, history, errors, lastUpdated }) {
  const [activeId, setActiveId] = useState(null)

  const toggle = (id) => setActiveId(prev => prev === id ? null : id)

  return (
    <div className="w-full max-w-2xl mt-6 flex flex-col gap-3">
      <p className="text-xs text-slate-600 uppercase tracking-widest px-0.5">
        Prophetic Indicators — tap to expand
      </p>

      <TabRow
        cats={ROW1}
        activeId={activeId}
        onTabClick={toggle}
        scores={scores}
        history={history}
        errors={errors}
        lastUpdated={lastUpdated}
      />
      <TabRow
        cats={ROW2}
        activeId={activeId}
        onTabClick={toggle}
        scores={scores}
        history={history}
        errors={errors}
        lastUpdated={lastUpdated}
      />
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDetail(id, detail) {
  if (detail.fallback) {
    return `Live news feed unavailable · showing calibrated annual baseline (${detail.base})`
  }
  if (id === 'earthquakes') {
    return `${detail.m6_last30} magnitude 6.0+ earthquakes in the past 30 days (baseline: ${detail.baseline_m6}/month) · ${detail.m7_last90} magnitude 7.0+ in the past 90 days`
  }
  if (id === 'wars') {
    return `${detail.articleCount} conflict-related articles in the past 24 hours · average news tone ${detail.averageTone} (more negative = more conflict)`
  }
  if (id === 'cosmic') {
    const parts = []
    if (detail.maxKp != null)    parts.push(`Solar storm index: Kp ${detail.maxKp} — ${detail.gScale ?? 'no storm'}`)
    if (detail.neoTotal != null) parts.push(`${detail.neoTotal} near-Earth objects this week, ${detail.phaCount} potentially hazardous`)
    return parts.join(' · ')
  }
  if (id === 'famine') {
    if (detail.articleCount != null) {
      const sign = detail.modifier >= 0 ? '+' : ''
      return `${detail.articleCount} famine/food-crisis articles in past 24 h · news tone ${detail.avgTone} · baseline ${detail.base}, adjusted ${sign}${detail.modifier} today`
    }
    return `${detail.reports90d} food-crisis reports in the past 90 days · historical baseline ~${detail.baseline} per 90 days`
  }
  if (id === 'pestilence') {
    const diseases = detail.diseases?.slice(0, 2).join(', ')
    return [
      `${detail.outbreaks60d} WHO outbreak alerts in the past 60 days`,
      diseases && `Active: ${diseases}`,
    ].filter(Boolean).join(' · ')
  }
  if (id === 'disasters') {
    return `Active GDACS alerts — ${detail.red} red (catastrophic) · ${detail.orange} orange (significant) · ${detail.green} green (elevated)`
  }
  if (['moral', 'persecution', 'apostasy', 'israel'].includes(id)) {
    const sign = detail.modifier >= 0 ? '+' : ''
    return `${detail.articleCount} relevant articles in past 24 h · news tone ${detail.avgTone} · annual baseline ${detail.base}, adjusted ${sign}${detail.modifier} today`
  }
  return ''
}

function timeAgo(ts) {
  const secs = Math.floor((Date.now() - ts) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}
