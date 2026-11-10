/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react'
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import App from '../App'

const storageKey = 'flowstate-state-v1'

const defaultSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  interval: 4,
  dailyGoal: 4,
  autoBreaks: false,
  autoFocus: false,
  sound: true,
  alwaysOnTop: false,
  launchOnStartup: false,
  theme: 'system',
}

// The vitest jsdom shim exposes a bare object for localStorage, so install a
// minimal but correct Storage implementation before rendering.
const store = new Map<string, string>()
const localStorageMock = {
  getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
  setItem: (key: string, value: string) => store.set(key, String(value)),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
}
vi.stubGlobal('localStorage', localStorageMock)

const flowStateMock = {
  platform: 'win32',
  minimize: vi.fn(),
  close: vi.fn(),
  setAlwaysOnTop: vi.fn().mockResolvedValue(true),
  setLaunchOnStartup: vi.fn().mockResolvedValue(true),
  setTheme: vi.fn().mockResolvedValue(true),
  updateTrayState: vi.fn(),
  updateTimerState: vi.fn(),
  timerAction: vi.fn(),
  openMiniWindow: vi.fn().mockResolvedValue(true),
  getTimerState: vi.fn().mockResolvedValue(null),
  expandMiniWindow: vi.fn().mockResolvedValue(true),
  closeMiniWindow: vi.fn().mockResolvedValue(true),
  onMiniWindowClosed: vi.fn().mockReturnValue(vi.fn()),
  onTrayAction: vi.fn().mockReturnValue(vi.fn()),
  onTimerState: vi.fn().mockReturnValue(vi.fn()),
  onTimerAction: vi.fn().mockReturnValue(vi.fn()),
}

const saveState = (state: Record<string, unknown>) => {
  localStorage.setItem(storageKey, JSON.stringify(state))
}

const clearState = () => {
  store.clear()
}

beforeEach(() => {
  clearState()
  window.FlowState = flowStateMock
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
  clearState()
  delete document.documentElement.dataset.theme
})

// Time display splits digits across spans ("25", ":", "00"), so query by its
// aria-label instead of text content.
const timeLabel = (minutes: number) => new RegExp(`${minutes} minutes 00 seconds`)

describe('App timer screen', () => {
  it('renders the focus timer ready to start a 25-minute session', () => {
    render(<App />)
    expect(screen.getByText('FlowState')).not.toBeNull()
    expect(screen.getByLabelText(timeLabel(25))).not.toBeNull()
    expect(screen.getByText('Ready to focus')).not.toBeNull()
    expect(screen.getByRole('tab', { name: /Focus/ })).not.toBeNull()
    expect(screen.getByTitle('Start or pause · Space')).not.toBeNull()
  })

  it('labels an idle break in plain language', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('tab', { name: 'Short break' }))
    expect(screen.getByText('Ready for a short break')).not.toBeNull()
    fireEvent.click(screen.getByRole('tab', { name: 'Long break' }))
    expect(screen.getByText('Ready for a long break')).not.toBeNull()
  })

  it('shows today goal progress and total focus time', () => {
    render(<App />)
    expect(screen.getByText('0 / 4')).not.toBeNull()
    expect(screen.getByText('0h 00m')).not.toBeNull()
  })

  it('toggles the timer with the space bar', () => {
    render(<App />)
    const toggle = screen.getByTitle('Start or pause · Space')
    expect(toggle.textContent).toBe('Start')
    fireEvent.keyDown(window, { key: ' ', code: 'Space' })
    expect(toggle.textContent).toBe('Pause')
    fireEvent.keyDown(window, { key: ' ', code: 'Space' })
    expect(toggle.textContent).toBe('Resume')
  })

  it('resets the timer with R', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: ' ', code: 'Space' })
    expect(screen.getByTitle('Start or pause · Space').textContent).toBe('Pause')
    fireEvent.keyDown(window, { key: 'r' })
    expect(screen.getByTitle('Start or pause · Space').textContent).toBe('Start')
    expect(screen.getByLabelText(timeLabel(25))).not.toBeNull()
  })

  it('skips the session with S', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: ' ', code: 'Space' })
    fireEvent.keyDown(window, { key: 's' })
    expect(screen.getByText('Session skipped.')).not.toBeNull()
  })

  it('applies the 45-minute preset', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '45' }))
    expect(screen.getByLabelText(timeLabel(45))).not.toBeNull()
  })

  it('applies the 60-minute preset', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '60' }))
    expect(screen.getByLabelText(timeLabel(60))).not.toBeNull()
  })

  it('navigates to settings and back with keyboard shortcuts', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    expect(screen.getByText('Settings')).not.toBeNull()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('Settings')).toBeNull()
    expect(screen.getByLabelText(timeLabel(25))).not.toBeNull()
  })

  it('navigates to statistics with Ctrl+I and back', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: 'i', ctrlKey: true })
    expect(screen.getByText('Statistics')).not.toBeNull()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByText('Statistics')).toBeNull()
  })
})

describe('App settings', () => {
  it('toggles always-on-top and invokes the native setter', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    const toggle = screen.getByRole('switch', { name: 'Always on top' })
    fireEvent.click(toggle)
    expect(flowStateMock.setAlwaysOnTop).toHaveBeenCalledWith(true)
    fireEvent.click(toggle)
    expect(flowStateMock.setAlwaysOnTop).toHaveBeenCalledWith(false)
  })

  it('hides launch-on-startup on non-windows platforms', () => {
    window.FlowState = { ...flowStateMock, platform: 'linux' }
    render(<App />)
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    expect(screen.queryByRole('switch', { name: 'Launch on startup' })).toBeNull()
  })

  it('adjusts focus duration via the stepper', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    const increase = screen.getByRole('button', { name: /Increase Focus duration/ })
    fireEvent.click(increase)
    expect(screen.getByText('26')).not.toBeNull()
    fireEvent.keyDown(window, { key: 'Escape' })
  })
})

describe('App appearance', () => {
  it('switches theme, applies it, and persists the choice', () => {
    render(<App />)
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    fireEvent.click(screen.getByRole('button', { name: 'Dark' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(flowStateMock.setTheme).toHaveBeenCalledWith('dark')
    expect(JSON.parse(localStorage.getItem(storageKey)!).settings.theme).toBe('dark')
  })

  it('restores a saved dark theme on load', () => {
    saveState({
      settings: { ...defaultSettings, theme: 'dark' },
      session: { kind: 'focus', status: 'idle', deadline: null, remainingMs: 25 * 60_000 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByLabelText(timeLabel(25))).not.toBeNull()
  })
})

describe('App persistence', () => {
  it('loads custom settings from localStorage', () => {
    saveState({
      settings: { ...defaultSettings, focus: 40, dailyGoal: 7, autoBreaks: true },
      session: { kind: 'focus', status: 'idle', deadline: null, remainingMs: 40 * 60_000 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    expect(screen.getByLabelText(timeLabel(40))).not.toBeNull()
  })

  it('persists a changed setting to localStorage', () => {
    saveState({
      settings: { ...defaultSettings, focus: 30 },
      session: { kind: 'focus', status: 'idle', deadline: null, remainingMs: 30 * 60_000 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    expect(screen.getByLabelText(timeLabel(30))).not.toBeNull()
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    fireEvent.click(screen.getByRole('button', { name: /Increase Focus duration/ }))
    expect(screen.getByText('31')).not.toBeNull()
    const stored = JSON.parse(localStorage.getItem(storageKey)!)
    expect(stored.settings.focus).toBe(31)
  })

  it('recovers from corrupted localStorage without crashing', () => {
    localStorage.setItem(storageKey, '{ not valid json !!!')
    expect(() => render(<App />)).not.toThrow()
    expect(screen.getByLabelText(timeLabel(25))).not.toBeNull()
    expect(screen.getByText('Ready to focus')).not.toBeNull()
  })

  it('recovers from localStorage with missing properties using safe defaults', () => {
    localStorage.setItem(storageKey, JSON.stringify({ settings: {} }))
    expect(() => render(<App />)).not.toThrow()
    expect(screen.getByLabelText(timeLabel(25))).not.toBeNull()
  })

  it('auto-completes a running session whose deadline passed while the app was closed', async () => {
    const past = Date.now() - 5000
    saveState({
      settings: { ...defaultSettings, focus: 1 },
      session: { kind: 'focus', status: 'running', deadline: past, remainingMs: 0 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Session complete · +1 min.')).not.toBeNull())
  })

  it('does not double-count a completed session when the view re-renders', async () => {
    const past = Date.now() - 5000
    saveState({
      settings: { ...defaultSettings, focus: 1 },
      session: { kind: 'focus', status: 'running', deadline: past, remainingMs: 0 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Session complete · +1 min.')).not.toBeNull())
    // Trigger a re-render by toggling a setting; the completed count must not grow
    // past 1 (no double-count of the same completed session).
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    fireEvent.click(screen.getByRole('switch', { name: 'Sound notifications' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'i', ctrlKey: true })
    await waitFor(() => expect(screen.queryByText('2')).toBeNull())
  })
})

describe('timer display stability', () => {
  it('keeps progress based on the running session own duration when the focus setting changes', () => {
    const now = Date.now()
    saveState({
      settings: { ...defaultSettings, focus: 25 },
      session: { kind: 'focus', status: 'running', deadline: now + 15 * 60_000, remainingMs: 15 * 60_000, durationMs: 30 * 60_000 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    // A 30-minute session with 15 minutes left is half done.
    expect(screen.getByRole('img', { name: /percent complete/ }).getAttribute('aria-label')).toBe('Session 50 percent complete')
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    fireEvent.click(screen.getByRole('button', { name: /Increase Focus duration/ }))
    fireEvent.keyDown(window, { key: 'Escape' })
    // Changing the next session's length must not rescale the running one.
    expect(screen.getByRole('img', { name: /percent complete/ }).getAttribute('aria-label')).toBe('Session 50 percent complete')
  })

  it('records a completion on the day it finishes rather than the day the app launched', () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date(2026, 10, 8, 23, 59, 30))
      saveState({
        settings: { ...defaultSettings, focus: 25 },
        session: { kind: 'focus', status: 'running', deadline: Date.now() + 5_000, remainingMs: 5_000, durationMs: 25 * 60_000 },
        completed: 0,
        totalMinutes: 0,
        history: [],
      })
      render(<App />)
      act(() => {
        vi.setSystemTime(new Date(2026, 10, 9, 0, 0, 1))
        vi.advanceTimersByTime(1_000)
      })
      const stored = JSON.parse(localStorage.getItem(storageKey)!)
      expect(stored.history[0].date).toBe('2026-11-09')
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('App statistics', () => {
  it('renders completed sessions, total minutes, streak, and the 7-day view', () => {
    saveState({
      settings: { ...defaultSettings },
      session: { kind: 'focus', status: 'idle', deadline: null, remainingMs: 25 * 60_000 },
      completed: 12,
      totalMinutes: 300,
      history: [
        { date: '2026-11-02', sessions: 1, minutes: 25 },
        { date: '2026-11-03', sessions: 2, minutes: 50 },
        { date: '2026-11-04', sessions: 0, minutes: 0 },
        { date: '2026-11-05', sessions: 1, minutes: 25 },
        { date: '2026-11-06', sessions: 1, minutes: 25 },
        { date: '2026-11-07', sessions: 1, minutes: 25 },
        { date: '2026-11-08', sessions: 1, minutes: 25 },
      ],
    })
    render(<App />)
    fireEvent.keyDown(window, { key: 'i', ctrlKey: true })
    expect(screen.getByText('12')).not.toBeNull()
    expect(screen.getByText('5h 00m')).not.toBeNull()
    expect(screen.getByText('Day streak')).not.toBeNull()
    expect(screen.getByText('Last 7 days')).not.toBeNull()
  })
})

describe('duration crediting and history validation', () => {
  it('credits the session\u2019s actual duration, not the current focus setting', async () => {
    // A saved 30-minute focus session while the focus setting is 25 minutes.
    saveState({
      settings: { ...defaultSettings, focus: 25 },
      session: { kind: 'focus', status: 'running', deadline: Date.now() - 5000, remainingMs: 0, durationMs: 30 * 60_000 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Session complete · +30 min.')).not.toBeNull())
    fireEvent.keyDown(window, { key: 'i', ctrlKey: true })
    // The statistics page credits the session's actual 30-minute duration.
    expect(screen.getByText('0h 30m')).not.toBeNull()
  })

  it('filters history entries with negative sessions or minutes', () => {
    saveState({
      settings: { ...defaultSettings },
      session: { kind: 'focus', status: 'idle', deadline: null, remainingMs: 25 * 60_000 },
      completed: 0,
      totalMinutes: 0,
      history: [
        { date: '2026-11-01', sessions: 1, minutes: 25 },
        { date: '2026-11-02', sessions: -1, minutes: 25 },
        { date: '2026-11-03', sessions: 1, minutes: -5 },
      ],
    })
    render(<App />)
    fireEvent.keyDown(window, { key: 'i', ctrlKey: true })
    // Invalid history entries are filtered; totals stay at their safe defaults.
    expect(screen.getByText('0h 00m')).not.toBeNull()
  })

  it('completes a restored running session exactly once and does not recount on re-render', async () => {
    saveState({
      settings: { ...defaultSettings, focus: 25 },
      session: { kind: 'focus', status: 'running', deadline: Date.now() - 5000, remainingMs: 0 },
      completed: 0,
      totalMinutes: 0,
      history: [],
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Session complete · +25 min.')).not.toBeNull())
    fireEvent.keyDown(window, { key: ',', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'i', ctrlKey: true })
    // Exactly one completion is persisted, even after a settings-triggered re-render.
    const stored = JSON.parse(localStorage.getItem(storageKey)!)
    expect(stored.completed).toBe(1)
    expect(stored.totalMinutes).toBe(25)
    expect(screen.queryByText('2')).toBeNull()
  })
})
