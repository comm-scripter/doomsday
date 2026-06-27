import { useEffect, useRef, useState } from 'react'
import { getBand, BANDS } from '../data/categories'

const CX = 200
const CY = 200
const R  = 155
const STROKE = 28

// Inner label band — sits just inside the colored arc
const INNER_R      = 126
const INNER_STROKE = 16

const NEEDLE_R = R - STROKE / 2 - 10  // tip distance from center
const COVER_R  = 50                    // semicircle cover over hub

function scoreToAngle(score) {
  return -180 + (score / 100) * 180
}

function polarToXY(angleDeg, radius = R) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) }
}

function arcPath(startAngle, endAngle, r = R) {
  const start = polarToXY(startAngle, r)
  const end   = polarToXY(endAngle, r)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
}

// Continuous band segment boundaries — no gaps between adjacent bands
function bandAngles(i) {
  const startScore = i === 0 ? 0 : BANDS[i - 1].max
  const endScore   = BANDS[i].max
  return { startAngle: scoreToAngle(startScore), endAngle: scoreToAngle(endScore) }
}

function Ticks() {
  const ticks = []
  for (let i = 0; i <= 100; i += 10) {
    const angle = scoreToAngle(i)
    const inner = polarToXY(angle, R - STROKE / 2 - 6)
    const outer = polarToXY(angle, R + STROKE / 2 + 6)
    const label = polarToXY(angle, R + STROKE / 2 + 18)
    ticks.push(
      <g key={i}>
        <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
          stroke="#475569" strokeWidth={i % 50 === 0 ? 2 : 1} />
        {i % 50 === 0 && (
          <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle"
            fill="#94a3b8" fontSize="11">
            {i}
          </text>
        )}
      </g>
    )
  }
  return <>{ticks}</>
}

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

export default function DoomsdayGauge({ score = 0, loading = false }) {
  const clampedScore = Math.min(100, Math.max(0, score))
  const targetAngle  = scoreToAngle(clampedScore)

  const [rotation,     setRotation]     = useState(-180)
  const [displayScore, setDisplayScore] = useState(0)
  const displayScoreRef = useRef(0)
  const scoreRafRef     = useRef(null)
  const firstRender     = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      requestAnimationFrame(() => requestAnimationFrame(() => setRotation(targetAngle)))
    } else {
      setRotation(targetAngle)
    }
  }, [targetAngle])

  useEffect(() => {
    if (scoreRafRef.current) cancelAnimationFrame(scoreRafRef.current)
    const startScore = displayScoreRef.current
    const endScore   = clampedScore
    if (startScore === endScore) return
    const duration  = 1200
    const startTime = performance.now()
    function tick(now) {
      const t        = Math.min((now - startTime) / duration, 1)
      const val      = Math.round(startScore + (endScore - startScore) * easeOutBack(t))
      displayScoreRef.current = val
      setDisplayScore(val)
      if (t < 1) scoreRafRef.current = requestAnimationFrame(tick)
    }
    scoreRafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(scoreRafRef.current)
  }, [clampedScore])

  const displayBand = getBand(displayScore)

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="60 60 280 155"
        className="w-full sm:max-w-lg select-none"
        aria-label={`Doomsday meter: ${clampedScore} out of 100 — ${displayBand.label}`}
      >
        <defs>
          {BANDS.map((b, i) => {
            const { startAngle, endAngle } = bandAngles(i)
            return (
              <path key={i} id={`larc-${i}`}
                d={arcPath(startAngle, endAngle, INNER_R)} />
            )
          })}
          <filter id="cover-glow" filterUnits="userSpaceOnUse"
            x={CX - COVER_R - 50} y={CY - COVER_R - 60}
            width={COVER_R * 2 + 100} height={COVER_R + 80}>
            <feGaussianBlur stdDeviation="11" result="blur" />
          </filter>
        </defs>

        {/* Dark track behind outer arcs */}
        <path d={arcPath(-180, 0)} fill="none" stroke="#1e293b"
          strokeWidth={STROKE + 4} strokeLinecap="butt" />

        {/* Outer colored band */}
        {BANDS.map((b, i) => {
          const { startAngle, endAngle } = bandAngles(i)
          return (
            <path key={b.label}
              d={arcPath(startAngle, endAngle)}
              fill="none" stroke={b.color}
              strokeWidth={STROKE} strokeLinecap="butt" opacity={0.85}
            />
          )
        })}

        {/* Edge rings */}
        <path d={arcPath(-180, 0, R - STROKE / 2)} fill="none" stroke="#0a0a0f" strokeWidth={2} strokeLinecap="butt" />
        <path d={arcPath(-180, 0, R + STROKE / 2)} fill="none" stroke="#0a0a0f" strokeWidth={2} strokeLinecap="butt" />

        {/* Inner label band — thin arc segments with text */}
        {BANDS.map((b, i) => {
          const { startAngle, endAngle } = bandAngles(i)
          const isActive = displayScore >= b.min && displayScore <= b.max
          return (
            <g key={b.label}>
              <path
                d={arcPath(startAngle, endAngle, INNER_R)}
                fill="none" stroke={b.color}
                strokeWidth={INNER_STROKE} strokeLinecap="butt"
                opacity={isActive ? 0.65 : 0.1}
                style={{ transition: 'opacity 0.5s ease' }}
              />
              <text
                fontSize="7.5"
                fontFamily="Georgia, serif"
                letterSpacing="0.6"
                fill={b.color}
                opacity={isActive ? 1 : 0.3}
                style={{ transition: 'opacity 0.5s ease' }}
              >
                <textPath href={`#larc-${i}`} startOffset="50%" textAnchor="middle" dy="-3">
                  {b.label.toUpperCase()}
                </textPath>
              </text>
            </g>
          )
        })}

        <Ticks />

        {/* Glow emanating upward from cover arc edge only — open arc, no fill, no Z */}
        <path
          d={`M ${CX - COVER_R},${CY + 5} A ${COVER_R} ${COVER_R} 0 0 1 ${CX + COVER_R},${CY + 5}`}
          fill="none"
          stroke={displayBand.color}
          strokeWidth={8}
          opacity={0.55}
          filter="url(#cover-glow)"
          style={{ transition: 'stroke 0.5s ease' }}
        />

        {/* Needle — rendered before cover so cover hides the base */}
        <polygon
          points={`${CX + NEEDLE_R},${CY} ${CX},${CY - 10} ${CX},${CY + 10}`}
          fill={displayBand.color}
          opacity={0.95}
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            transform: `rotate(${rotation}deg)`,
            transition: loading
              ? 'none'
              : 'transform 1.4s cubic-bezier(0.34, 1.56, 0.64, 1), fill 0.4s ease',
          }}
        />

        {/* Semicircle cover over hub */}
        <path
          d={`M ${CX - COVER_R},${CY + 5} A ${COVER_R} ${COVER_R} 0 0 1 ${CX + COVER_R},${CY + 5} Z`}
          fill="#0f172a"
          opacity={0.95}
        />

        {/* Score — on top of cover */}
        <text x={CX} y={CY - 18} textAnchor="middle" dominantBaseline="middle"
          fill={displayBand.color} fontSize="32" fontWeight="bold" fontFamily="Georgia, serif"
          style={{ transition: 'fill 0.4s ease' }}>
          {loading ? '…' : displayScore}
        </text>
      </svg>
    </div>
  )
}
