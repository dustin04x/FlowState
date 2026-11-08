import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { dailyGoalProgress, FOCUS_PRESETS, type FocusPreset, type SessionKind, type TimerStatus } from '../engine/timer'

type Props = {
  kind: SessionKind
  status: TimerStatus
  focusDuration: number
  minutes: string
  seconds: string
  progress: number
  dailySessions: number
  sessionGoal: number
  totalFocusMinutes: number
  message: string
  completionCue: boolean
  onSelectKind: (kind: SessionKind) => void
  onPreset: (minutes: FocusPreset) => void
  onToggle: () => void
  onReset: () => void
  onSkip: () => void
}
const tabs: { kind: SessionKind; label: string }[] = [
  { kind: 'focus', label: 'Focus' }, { kind: 'shortBreak', label: 'Short' }, { kind: 'longBreak', label: 'Long' },
]
const durationLabel = (minutes: number) => `${Math.floor(minutes / 60)}H ${String(minutes % 60).padStart(2, '0')}M`

export function TimerView({ kind, status, focusDuration, minutes, seconds, progress, dailySessions, sessionGoal, totalFocusMinutes, message, completionCue, onSelectKind, onPreset, onToggle, onReset, onSkip }: Props) {
  const goal = dailyGoalProgress(dailySessions, sessionGoal)
  return <section className="timer-body">
    <div className="session-tabs" role="tablist" aria-label="Session type">
      {tabs.map((tab) => <button key={tab.kind} className={`session-tab ${kind === tab.kind ? 'active' : ''}`} role="tab" aria-selected={kind === tab.kind} aria-disabled={status === 'running'} onClick={() => onSelectKind(tab.kind)}>{tab.label}</button>)}
      <span className="session-count">S/{String(dailySessions + 1).padStart(2, '0')}</span>
    </div>

    {kind === 'focus' && <div className="focus-presets" aria-label="Focus duration presets">
      <span>Focus</span>
      {FOCUS_PRESETS.map((preset) => <button key={preset} className={focusDuration === preset ? 'selected' : ''} aria-pressed={focusDuration === preset} disabled={status === 'running'} onClick={() => onPreset(preset)}>{preset}</button>)}
      <span>min</span>
    </div>}

    <div className={`timer-stack ${status === 'running' ? 'timer-running' : ''} ${status === 'paused' ? 'timer-paused' : ''} ${completionCue ? 'timer-done' : ''}`}>
      <div className="time-display" aria-label={completionCue ? 'Session complete' : `${minutes} minutes ${seconds} seconds`}>
        {completionCue ? <span className="done-label">Done</span> : <><span>{minutes}</span><span className="time-colon">:</span><span className="seconds-value">{seconds}</span></>}
      </div>
      <div className="progress-track" role="img" aria-label={`Session ${Math.round(progress * 100)} percent complete`}><i style={{ width: `${completionCue ? 100 : progress * 100}%` }} /></div>
      <p className="session-message" aria-live="polite">{message}</p>
    </div>

    <div className="timer-controls">
      <button className="control-button quiet-button" onClick={onReset} aria-label="Reset timer (R)" title="Reset · R"><RotateCcw size={14} /></button>
      <button className="control-button primary-control" onClick={onToggle} title="Start or pause · Space">
        {status === 'running' ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        <span>{status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}</span>
      </button>
      <button className="control-button quiet-button" onClick={onSkip} aria-label="Skip session (S)" title="Skip · S"><SkipForward size={14} /></button>
    </div>

    <footer className="timer-footer">
      <div className="today-progress"><span className="footer-label">Today</span><strong>{goal.completed} / {goal.goal}</strong><div className="goal-track" role="img" aria-label={`${goal.completed} of ${goal.goal} focus sessions toward today's goal`}><i style={{ width: `${goal.fraction * 100}%` }} /></div></div>
      <div className="focus-total"><span className="footer-label">FOCUS</span><strong>{durationLabel(totalFocusMinutes)}</strong></div>
    </footer>
  </section>
}
