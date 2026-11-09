import { Maximize2, Pause, Play, RotateCcw, X } from 'lucide-react'
import { type SessionKind, type TimerStatus } from '../engine/timer'
import type { ResolvedTheme } from '../theme'
import { TimerDisplay } from './TimerDisplay'

interface MiniClockProps {
  kind: SessionKind
  status: TimerStatus
  remainingSeconds: number
  durationSeconds: number
  progress: number
  theme?: ResolvedTheme
  onToggle: () => void
  onReset: () => void
  onExpand: () => void
  onClose: () => void
}

const sessionLabels: Record<SessionKind, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

export function MiniClock({ kind, status, remainingSeconds, durationSeconds, progress, theme = 'light', onToggle, onReset, onExpand, onClose }: MiniClockProps) {
  const totalSeconds = Math.max(0, Math.min(durationSeconds, remainingSeconds))
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  const actionLabel = status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'

  return (
    <div className="mini-clock" data-session={kind} data-theme={theme}>
      <header className="mini-header">
        <span className="mini-wordmark">
          <svg className="wordmark-mark" viewBox="40 60 186 132" aria-hidden="true">
            <g fill="currentColor">
              <rect x="40" y="120" width="6" height="64" />
              <rect x="60" y="148" width="6" height="36" />
              <rect x="80" y="148" width="6" height="36" />
              <rect x="100" y="148" width="6" height="36" />
              <rect x="120" y="120" width="6" height="64" />
              <rect x="140" y="148" width="6" height="36" />
              <g opacity=".35">
                <rect x="180" y="148" width="6" height="36" />
                <rect x="200" y="120" width="6" height="64" />
                <rect x="220" y="148" width="6" height="36" />
              </g>
            </g>
            <rect x="158" y="60" width="10" height="132" fill="var(--brand)" />
          </svg>
          FlowState
        </span>
        <span className="mini-session">{sessionLabels[kind]}</span>
        <span className="mini-actions">
          <button type="button" className="mini-action" onClick={onExpand} aria-label="Expand to main window" title="Expand"><Maximize2 size={12} strokeWidth={1.5} /></button>
          <button type="button" className="mini-action" onClick={onClose} aria-label="Close mini-clock" title="Close"><X size={12} strokeWidth={1.5} /></button>
        </span>
      </header>
      <div className="mini-body">
        <div className="mini-time">
          <TimerDisplay minutes={minutes} seconds={seconds} className="mini-time-digits" />
        </div>
        <div className="mini-progress" role="img" aria-label={`Session ${Math.round(progress * 100)} percent complete`}>
          <i style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
      <div className="mini-controls">
        <button type="button" className="mini-secondary" onClick={onReset} aria-label="Reset timer" title="Reset"><RotateCcw size={13} strokeWidth={1.5} /></button>
        <button type="button" className="mini-play" onClick={onToggle} aria-label={actionLabel} title={actionLabel}>
          {status === 'running' ? <Pause size={13} strokeWidth={1.5} fill="currentColor" /> : <Play size={13} strokeWidth={1.5} fill="currentColor" />}
        </button>
      </div>
    </div>
  )
}
