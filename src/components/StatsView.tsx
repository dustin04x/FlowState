type Day = { label: string; date: string; minutes: number; sessions: number }
import { dailyGoalProgress } from '../engine/timer'
type Props = { completedSessions: number; totalMinutes: number; streak: number; dailySessions: number; dailyGoal: number; days: Day[] }
const timeLabel = (minutes: number) => `${Math.floor(minutes / 60)}H ${String(minutes % 60).padStart(2, '0')}M`
export function StatsView({ completedSessions, totalMinutes, streak, dailySessions, dailyGoal, days }: Props) {
  const peak = Math.max(1, ...days.map((day) => day.minutes))
  const todayProgress = dailyGoalProgress(dailySessions, dailyGoal)
  return <section className="secondary-body stats-view">
    <div className="secondary-heading"><span>STATISTICS</span><span className="heading-note">A quiet record of focused time</span></div>
    <div className="stat-numbers">
      <div><strong>{completedSessions}</strong><span>SESSIONS</span></div>
      <div><strong>{totalMinutes}</strong><span>FOCUS MIN</span></div>
      <div><strong>{streak}</strong><span>DAY STREAK</span></div>
    </div>
    <div className="activity-heading"><span>LAST 7 DAYS</span><span>TODAY · {todayProgress.completed}/{todayProgress.goal} GOAL</span></div>
    <div className="activity-chart" role="img" aria-label="Daily focus minutes over the last seven days">
      {days.map((day) => <div className="activity-day" key={day.date} aria-label={`${day.date}: ${day.minutes} focus minutes`}>
        <span className="activity-value">{day.minutes || ''}</span>
        <div className="activity-track"><i className={day.date === days[6]?.date ? 'today-bar' : ''} style={{ height: day.minutes ? `${Math.max(6, day.minutes / peak * 100)}%` : '2px' }} /></div>
        <span className="activity-label">{day.label}</span>
      </div>)}
    </div>
    <div className="today-summary"><span className="today-mark" />TODAY <strong>{todayProgress.completed}/{todayProgress.goal}</strong> FOCUS SESSIONS</div>
    <footer className="secondary-footer"><span>TOTAL FOCUS · {timeLabel(totalMinutes)}</span><span>ESC TO RETURN</span></footer>
  </section>
}
