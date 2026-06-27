import { useEffect, useRef } from 'react'
import { getBand, BANDS } from '../data/categories'

// SVG gauge — semicircle, radius 160, center at (200, 200)
const CX = 200
const CY = 200
const R = 155
const STROKE = 28

// Map score 0–100 to angle: 0 = -180deg (left), 100 = 0deg (right)
function scoreToAngle(score) {
  return -180 + (score / 100) * 180
}

function polarToXY(angleDeg, radius = R) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  }
}

function arcPath(startAngle, endAngle, r = R) {
  const start = polarToXY(startAngle, r)
  const end = polarToXY(endAngle, r)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

// Tick marks at 0, 10, 20 ... 100
function Ticks() {
  const ticks = []
  for (let i = 0; i <= 100; i += 10) {
    const angle = scoreToAngle(i)
    const inner = polarToXY(angle, R - STROKE / 2 - 6)
    const outer = polarToXY(angle, R + STROKE / 2 + 6)
    const label = polarToXY(angle, R + STROKE / 2 + 18)
    ticks.push(
      <g key={i}>
        <line
          x1={inner.x} y1={inner.y}
          x2={outer.x} y2={outer.y}
          stroke="#475569" strokeWidth={i % 50 === 0 ? 2 : 1}
        />
        {i % 50 === 0 && (
          <text
            x={label.x} y={label.y}
            textAnchor="middle" dominantBaseline="middle"
            fill="#94a3b8" fontSize="11"
          >
            {i}
          </text>
        )}
      </g>
    )
  }
  return <>{ticks}</>
}

export default function DoomsdayGauge({ score = 0, loading = false }) {
  const needleRef = useRef(null)
  const prevScoreRef = useRef(0)

  const clampedScore = Math.min(100, Math.max(0, score))
  const band = getBand(clampedScore)
  const needleAngle = scoreToAngle(clampedScore)

  // Animate needle via CSS transition on transform
  useEffect(() => {
    prevScoreRef.current = clampedScore
  }, [clampedScore])

  // Band arc segments
  const bandArcs = BANDS.map(b => {
    const startAngle = scoreToAngle(b.min)
    const endAngle = scoreToAngle(b.max)
    return (
      <path
        key={b.label}
        d={arcPath(startAngle, endAngle)}
        fill="none"
        stroke={b.color}
        strokeWidth={STROKE}
        strokeLinecap="butt"
        opacity={0.85}
      />
    )
  })

  // Needle
  const needleTip = polarToXY(needleAngle, R - STROKE / 2 - 10)
  const needleBase1 = polarToXY(needleAngle - 90, 10)
  const needleBase2 = polarToXY(needleAngle + 90, 10)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="60 60 280 155"
        className="w-full sm:max-w-lg select-none"
        aria-label={`Doomsday meter: ${clampedScore} out of 100 — ${band.label}`}
      >
        {/* Dark track behind arcs */}
        <path
          d={arcPath(-180, 0)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={STROKE + 4}
          strokeLinecap="butt"
        />

        {/* Band arcs */}
        {bandArcs}

        {/* Inner shadow ring */}
        <path
          d={arcPath(-180, 0, R - STROKE / 2)}
          fill="none"
          stroke="#0a0a0f"
          strokeWidth={2}
          strokeLinecap="butt"
        />
        <path
          d={arcPath(-180, 0, R + STROKE / 2)}
          fill="none"
          stroke="#0a0a0f"
          strokeWidth={2}
          strokeLinecap="butt"
        />

        <Ticks />

        {/* Needle */}
        <g
          ref={needleRef}
          style={{ transition: 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={band.color}
            opacity={0.95}
          />
        </g>

        {/* Center hub */}
        <circle cx={CX} cy={CY} r={10} fill="#1e293b" stroke={band.color} strokeWidth={2} />

        {/* Score label */}
        <text
          x={CX} y={CY - 30}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={band.color}
          fontSize="36"
          fontWeight="bold"
          fontFamily="Georgia, serif"
        >
          {loading ? '...' : clampedScore}
        </text>

        {/* Band label */}
        <text
          x={CX} y={CY - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={band.color}
          fontSize="13"
          letterSpacing="2"
          fontFamily="Georgia, serif"
        >
          {loading ? 'LOADING' : band.label.toUpperCase()}
        </text>
      </svg>

      {/* Band legend */}
      <div className="flex gap-2 mt-1 flex-wrap justify-center">
        {BANDS.map(b => (
          <span
            key={b.label}
            className="text-xs px-2 py-0.5 rounded-full font-semibold tracking-wide border"
            style={{
              color: b.color,
              borderColor: b.color,
              background: clampedScore >= b.min && clampedScore <= b.max
                ? b.bg
                : 'transparent',
              opacity: clampedScore >= b.min && clampedScore <= b.max ? 1 : 0.4,
            }}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  )
}
