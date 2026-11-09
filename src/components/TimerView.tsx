import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { FOCUS_PRESETS, type FocusPreset, type SessionKind, type TimerStatus } from '../engine/timer'
import { TimerDisplay } from './TimerDisplay'

type Props = {
  kind: SessionKind
  status: TimerStatus
  focusDuration: number
  sessionLength: number
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
  { kind: 'focus', label: 'Focus' },
  { kind: 'shortBreak', label: 'Short break' },
  { kind: 'longBreak', label: 'Long break' },
]
const durationLabel = (minutes: number) => `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`

export function TimerView({ kind, status, focusDuration, sessionLength, minutes, seconds, progress, dailySessions, sessionGoal, totalFocusMinutes, message, completionCue, onSelectKind, onPreset, onToggle, onReset, onSkip }: Props) {
  const actionLabel = status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'
  return <section className="timer-view">
    <div className="session-nav">
      <div className="session-tabs" role="tablist" aria-label="Session type">
        {tabs.map((tab) => (
          <button
            key={tab.kind}
            type="button"
            className="session-tab"
            role="tab"
            aria-selected={kind === tab.kind}
            aria-disabled={status === 'running'}
            onClick={() => onSelectKind(tab.kind)}
          >{tab.label}</button>
        ))}
      </div>
      {kind === 'focus' ? (
        <div className="presets" role="group" aria-label="Focus duration presets">
          {FOCUS_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="preset"
              aria-pressed={focusDuration === preset}
              disabled={status === 'running'}
              onClick={() => onPreset(preset)}
            >{preset}</button>
          ))}
          <span className="preset-unit">min</span>
        </div>
      ) : <span className="session-length">{sessionLength} min</span>}
    </div>

    <div className="timer-stage">
      {completionCue ? (
        <div className="time-display" aria-label="Session complete"><span className="done-label">Done</span></div>
      ) : (
        <div className="time-display" aria-label={`${minutes} minutes ${seconds} seconds`}><TimerDisplay minutes={minutes} seconds={seconds} /></div>
      )}
      <div className="progress-line" role="img" aria-label={`Session ${Math.round(progress * 100)} percent complete`}>
        <i style={{ transform: `scaleX(${completionCue ? 1 : progress})` }} />
      </div>
      <p className="session-message" aria-live="polite">{message}</p>
    </div>

    <div className="transport">
      <button type="button" className="transport-button" onClick={onReset} aria-label="Reset timer (R)" title="Reset · R"><RotateCcw size={16} strokeWidth={1.5} /></button>
      <button type="button" className="transport-primary" onClick={onToggle} aria-label={actionLabel} title="Start or pause · Space">
        {status === 'running' ? <Pause size={17} strokeWidth={1.5} fill="currentColor" /> : <Play size={17} strokeWidth={1.5} fill="currentColor" />}
        <span className="sr-only">{actionLabel}</span>
      </button>
      <button type="button" className="transport-button" onClick={onSkip} aria-label="Skip session (S)" title="Skip · S"><SkipForward size={16} strokeWidth={1.5} /></button>
    </div>

    <footer className="app-summary">
      <span className="summary-item"><span>Today</span><strong className="summary-value">{dailySessions} / {sessionGoal}</strong></span>
      <span className="summary-item"><span>Focus time</span><strong className="summary-value">{durationLabel(totalFocusMinutes)}</strong></span>
    </footer>
  </section>
}
