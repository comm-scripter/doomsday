const W = 80
const H = 24

function trendArrow(points) {
  if (points.length < 4) return null
  const recent = points[points.length - 1].score
  const older  = points[Math.max(0, points.length - 5)].score
  const delta  = recent - older
  if (delta > 3)  return { symbol: '↑', color: '#ef4444' }
  if (delta < -3) return { symbol: '↓', color: '#4ade80' }
  return { symbol: '→', color: '#94a3b8' }
}

export default function Sparkline({ points, color, mini = false }) {
  if (!points || points.length < 2) return null

  const xs = points.map((_, i) => (i / (points.length - 1)) * W)
  const ys = points.map(p => H - (p.score / 100) * H)
  const linePoints = xs.map((x, i) => `${x},${ys[i]}`).join(' ')

  if (mini) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-3" preserveAspectRatio="none">
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    )
  }

  const trend = trendArrow(points)
  const fillPath =
    `M ${xs[0]},${H} ` +
    xs.map((x, i) => `L ${x},${ys[i]}`).join(' ') +
    ` L ${xs[xs.length - 1]},${H} Z`

  return (
    <div className="flex items-center gap-1.5">
      <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 h-5" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#fill-${color.replace('#', '')})`} />
        <polyline
          points={linePoints}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2" fill={color} />
      </svg>
      {trend && (
        <span className="text-xs font-bold shrink-0" style={{ color: trend.color }}>
          {trend.symbol}
        </span>
      )}
    </div>
  )
}
