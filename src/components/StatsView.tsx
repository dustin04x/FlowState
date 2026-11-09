type Day = { label: string; date: string; minutes: number; sessions: number }
type Props = { completedSessions: number; totalMinutes: number; streak: number; dailySessions: number; dailyGoal: number; days: Day[] }

const timeLabel = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`

export function StatsView({ completedSessions, totalMinutes, streak, dailySessions, dailyGoal, days }: Props) {
  const today = days[days.length - 1]?.date
  return <section className="page stats-view">
    <div className="page-head"><h1>Statistics</h1><span className="page-hint">Esc</span></div>
    <div className="stats-body">
      <div className="stat-hero">
        <span className="stat-caption">Total focus</span>
        <strong className="stat-total">{timeLabel(totalMinutes)}</strong>
      </div>

      <dl className="stat-ledger">
        <div><dt>Sessions</dt><dd>{completedSessions}</dd></div>
        <div><dt>Day streak</dt><dd>{streak}</dd></div>
        <div><dt>Today</dt><dd>{dailySessions} / {dailyGoal}</dd></div>
      </dl>

      <div className="week">
        <div className="week-head"><span>Last 7 days</span><span>minutes</span></div>
        <ol className="week-grid">
          {days.map((day) => <li className="week-day" key={day.date} data-today={day.date === today} aria-label={`${day.label}: ${day.minutes} focus minutes`}>
            <span className="week-label">{day.label}</span>
            <span className="week-value">{day.minutes || '–'}</span>
          </li>)}
        </ol>
      </div>
    </div>
  </section>
}
