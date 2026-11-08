import { describe, expect, it } from 'vitest'
import { createSession, startSession, pauseSession, resumeSession, remainingMs, completeSession, nextSessionKind, progressFraction, currentDailyStreak, FOCUS_PRESETS, applyFocusPreset, dailyGoalProgress } from './timer'

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
  })

  it('maps elapsed time to a clamped progress fraction for each timer state', () => {
    const initial = createSession('focus', 25, 1000)
    expect(progressFraction(initial, 25, 1000)).toBe(0)
    const running = startSession(initial, 1000)
    expect(progressFraction(running, 25, 751_000)).toBe(0.5)
    const paused = pauseSession(running, 751_000)
    expect(progressFraction(paused, 25, 999_000)).toBe(0.5)
  })

  it('counts a real daily streak that may continue from yesterday', () => {
    expect(currentDailyStreak(['2026-11-06', '2026-11-07', '2026-11-08'], '2026-11-08')).toBe(3)
    expect(currentDailyStreak(['2026-11-06', '2026-11-07'], '2026-11-08')).toBe(2)
    expect(currentDailyStreak(['2026-11-05'], '2026-11-08')).toBe(0)
  })

  it('offers 25, 45, and 60 minute focus presets and applies them only to an editable focus session', () => {
    expect(FOCUS_PRESETS).toEqual([25, 45, 60])
    expect(applyFocusPreset(createSession('focus', 10), 45)).toEqual(createSession('focus', 45))
    const running = startSession(createSession('focus', 10), 1000)
    expect(applyFocusPreset(running, 45)).toBe(running)
    expect(applyFocusPreset(createSession('shortBreak', 5), 45)).toEqual(createSession('shortBreak', 5))
  })

  it('clamps daily goal progress and reports remaining focus sessions', () => {
    expect(dailyGoalProgress(2, 5)).toEqual({ completed: 2, goal: 5, remaining: 3, fraction: 0.4 })
    expect(dailyGoalProgress(9, 5)).toEqual({ completed: 5, goal: 5, remaining: 0, fraction: 1 })
    expect(dailyGoalProgress(-1, 0)).toEqual({ completed: 0, goal: 1, remaining: 1, fraction: 0 })
  })
})
