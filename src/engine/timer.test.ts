import { describe, expect, it } from 'vitest'
import {
  createSession,
  startSession,
  pauseSession,
  resumeSession,
  remainingMs,
  completeSession,
  nextSessionKind,
  progressFraction,
  currentDailyStreak,
  FOCUS_PRESETS,
  applyFocusPreset,
  dailyGoalProgress,
  formatTime,
  dayKey,
  shiftDayKey,
  MAX_SESSION_MINUTES,
  sessionMinutes,
} from './timer'

describe('timestamp timer engine', () => {
  it('calculates remaining time from the deadline rather than tick count', () => {
    const session = startSession(createSession('focus', 25, 1000), 1000)
    expect(remainingMs(session, 31_000)).toBe(24 * 60_000 + 30_000)
  })

  it('freezes remaining time while paused and resumes from that duration', () => {
    const running = startSession(createSession('focus', 25, 1000), 1000)
    const paused = pauseSession(running, 61_000)
    expect(remainingMs(paused, 500_000)).toBe(24 * 60_000)
    const resumed = resumeSession(paused, 500_000)
    expect(remainingMs(resumed, 501_000)).toBe(23 * 60_000 + 59_000)
  })

  it('marks completion only after the deadline', () => {
    const session = startSession(createSession('focus', 1, 1000), 1000)
    expect(completeSession(session, 60_999)).toBe(false)
    expect(completeSession(session, 61_000)).toBe(true)
  })

  it('schedules a long break after the configured number of completed focus sessions', () => {
    expect(nextSessionKind('focus', 3, 4)).toBe('shortBreak')
    expect(nextSessionKind('focus', 4, 4)).toBe('longBreak')
    expect(nextSessionKind('longBreak', 4, 4)).toBe('focus')
    expect(nextSessionKind('shortBreak', 4, 4)).toBe('focus')
  })

  it('interval edge: zero completed focus sessions never yields a long break', () => {
    expect(nextSessionKind('focus', 0, 4)).toBe('shortBreak')
    expect(nextSessionKind('focus', 1, 4)).toBe('shortBreak')
    expect(nextSessionKind('focus', 4, 4)).toBe('longBreak')
    expect(nextSessionKind('focus', 8, 4)).toBe('longBreak')
  })

  it('maps elapsed time to a clamped progress fraction for each timer state', () => {
    const initial = createSession('focus', 25, 1000)
    expect(progressFraction(initial, 25, 1000)).toBe(0)
    const running = startSession(initial, 1000)
    expect(progressFraction(running, 25, 751_000)).toBe(0.5)
    const paused = pauseSession(running, 751_000)
    expect(progressFraction(paused, 25, 999_000)).toBe(0.5)
  })

  it('progress fraction clamps to 1 after the deadline has passed', () => {
    const running = startSession(createSession('focus', 1, 1000), 1000)
    expect(progressFraction(running, 1, 200_000)).toBe(1)
  })

  it('remaining time clamps to zero after the deadline has passed', () => {
    const running = startSession(createSession('focus', 1, 1000), 1000)
    expect(remainingMs(running, 200_000)).toBe(0)
  })

  it('counts a real daily streak that may continue from yesterday', () => {
    expect(currentDailyStreak(['2026-11-06', '2026-11-07', '2026-11-08'], '2026-11-08')).toBe(3)
    expect(currentDailyStreak(['2026-11-06', '2026-11-07'], '2026-11-08')).toBe(2)
    expect(currentDailyStreak(['2026-11-05'], '2026-11-08')).toBe(0)
  })

  it('daily streak resets when today itself has no session', () => {
    expect(currentDailyStreak(['2026-11-06', '2026-11-07'], '2026-11-08')).toBe(2)
    expect(currentDailyStreak([], '2026-11-08')).toBe(0)
    expect(currentDailyStreak(['2026-11-08'], '2026-11-08')).toBe(1)
  })

  it('offers 25, 45, and 60 minute focus presets and applies them only to an editable focus session', () => {
    expect(FOCUS_PRESETS).toEqual([25, 45, 60])
    expect(applyFocusPreset(createSession('focus', 10), 45)).toEqual(createSession('focus', 45))
    const running = startSession(createSession('focus', 10), 1000)
    expect(applyFocusPreset(running, 45)).toBe(running)
    expect(applyFocusPreset(createSession('shortBreak', 5), 45)).toEqual(createSession('shortBreak', 5))
  })

  it('applyFocusPreset returns the same session reference when not applicable', () => {
    const session = createSession('shortBreak', 5)
    expect(applyFocusPreset(session, 25)).toBe(session)
  })

  it('clamps daily goal progress and reports remaining focus sessions', () => {
    expect(dailyGoalProgress(2, 5)).toEqual({ completed: 2, goal: 5, remaining: 3, fraction: 0.4 })
    expect(dailyGoalProgress(9, 5)).toEqual({ completed: 5, goal: 5, remaining: 0, fraction: 1 })
    expect(dailyGoalProgress(-1, 0)).toEqual({ completed: 0, goal: 1, remaining: 1, fraction: 0 })
  })

  it('formatTime renders zero and hour-spanning durations', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(90_000)).toBe('01:30')
    expect(formatTime(25 * 60_000)).toBe('25:00')
  })

  it('dayKey produces ISO-ish local date keys', () => {
    expect(dayKey(new Date(2026, 10, 8))).toBe('2026-11-08')
  })

  it('shiftDayKey walks forward and backward across month boundaries', () => {
    expect(shiftDayKey('2026-11-30', 1)).toBe('2026-12-01')
    expect(shiftDayKey('2026-12-01', -1)).toBe('2026-11-30')
  })
})

describe('timer session immutability', () => {
  it('createSession starts idle with no deadline', () => {
    const session = createSession('focus', 25)
    expect(session).toMatchObject({ kind: 'focus', status: 'idle', deadline: null, remainingMs: 25 * 60_000 })
  })

  it('startSession sets deadline and does not mutate the input', () => {
    const session = createSession('focus', 5, 1000)
    const started = startSession(session, 1000)
    expect(session.deadline).toBeNull()
    expect(started.deadline).toBe(1000 + 5 * 60_000)
    expect(started.status).toBe('running')
  })

  it('pauseSession on a non-running session is a no-op', () => {
    const idle = createSession('focus', 5)
    expect(pauseSession(idle, 1000)).toBe(idle)
    const paused = pauseSession(startSession(createSession('focus', 5, 1000), 1000), 1000)
    expect(paused.status).toBe('paused')
    expect(paused.deadline).toBeNull()
  })
})

describe('session duration metadata', () => {
  it('createSession records durationMs', () => {
    expect(createSession('focus', 25).durationMs).toBe(25 * 60_000)
    expect(createSession('shortBreak', 5).durationMs).toBe(5 * 60_000)
  })

  it('sessionMinutes uses durationMs when present', () => {
    expect(sessionMinutes(createSession('focus', 25), 45)).toBe(25)
    expect(sessionMinutes({ ...createSession('focus', 25), durationMs: 45 * 60_000 }, 10)).toBe(45)
  })

  it('sessionMinutes falls back and clamps invalid durationMs', () => {
    expect(sessionMinutes({ ...createSession('focus', 25), durationMs: -5 * 60_000 }, 45)).toBe(45)
    expect(sessionMinutes({ ...createSession('focus', 25), durationMs: NaN }, 45)).toBe(45)
    expect(sessionMinutes({ kind: 'focus', status: 'idle', deadline: null, remainingMs: 25 * 60_000 }, 45)).toBe(45)
  })

  it('MAX_SESSION_MINUTES is 90', () => {
    expect(MAX_SESSION_MINUTES).toBe(90)
  })

  it('pauseSession preserves durationMs', () => {
    const paused = pauseSession(startSession(createSession('focus', 25, 1000), 1000), 61_000)
    expect(paused.durationMs).toBe(25 * 60_000)
  })

  it('applyFocusPreset preserves durationMs on applicable sessions', () => {
    const session = createSession('focus', 10)
    expect(applyFocusPreset(session, 45).durationMs).toBe(45 * 60_000)
  })
})

