export default function Header({ lastFetch }) {
  return (
    <header className="text-center pt-5 sm:pt-8 pb-2 px-4">
      <h1
        className="text-3xl sm:text-4xl font-bold text-slate-100 uppercase"
        style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.2em' }}
      >
        Doomsday Meter
      </h1>
      <p className="text-sm text-slate-500 mt-1 italic tracking-wide">
        "Nation will rise against nation... these are the beginning of birth pains."
      </p>
      <p className="text-xs text-slate-600 mt-0.5">Matthew 24:7–8</p>
      {lastFetch > 0 && (
        <p className="text-xs text-slate-700 mt-1.5 tabular-nums">
          Updated {formatFetchTime(lastFetch)}
        </p>
      )}
    </header>
  )
}

function formatFetchTime(ts) {
  const d = new Date(ts)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()

  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  if (sameDay) return `today at ${time}`

  const month = d.toLocaleString('default', { month: 'short' })
  return `${month} ${d.getDate()} at ${time}`
}
