import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyFocusPreset, createSession, currentDailyStreak, dayKey, formatTime, nextSessionKind, pauseSession, progressFraction, remainingMs, resumeSession, shiftDayKey, startSession, type FocusPreset, type SessionKind, type TimerSession } from './engine/timer'
import { WindowHeader } from './components/WindowHeader'
import { TimerView } from './components/TimerView'
import { SettingsView } from './components/SettingsView'
import { StatsView } from './components/StatsView'

type Settings = { focus: number; shortBreak: number; longBreak: number; interval: number; dailyGoal: number; autoBreaks: boolean; autoFocus: boolean; sound: boolean; alwaysOnTop: boolean; launchOnStartup: boolean }
type DayStat = { date: string; sessions: number; minutes: number }
type Saved = { settings: Settings; session: TimerSession; completed: number; totalMinutes: number; history: DayStat[] }
type View = 'timer' | 'settings' | 'stats'
const defaults: Settings = { focus: 25, shortBreak: 5, longBreak: 15, interval: 4, dailyGoal: 4, autoBreaks: false, autoFocus: false, sound: true, alwaysOnTop: false, launchOnStartup: false }
const storageKey = 'flowstate-state-v1'
const createSaved = (): Saved => ({ settings: { ...defaults }, session: createSession('focus', defaults.focus), completed: 0, totalMinutes: 0, history: [] })
const bounded = (value: unknown, fallback: number, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) ? Math.max(min, Math.min(max, Math.round(value))) : fallback
const loadSaved = (): Saved => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return createSaved()
    const parsed = JSON.parse(raw) as Partial<Saved>
    const values = parsed.settings as Partial<Settings> | undefined
    const settings: Settings = {
      focus: bounded(values?.focus, 25, 1, 90), shortBreak: bounded(values?.shortBreak, 5, 1, 30),
      longBreak: bounded(values?.longBreak, 15, 1, 60), interval: bounded(values?.interval, 4, 2, 8), dailyGoal: bounded(values?.dailyGoal, 4, 1, 12),
      autoBreaks: values?.autoBreaks === true, autoFocus: values?.autoFocus === true,
      sound: values?.sound !== false, alwaysOnTop: values?.alwaysOnTop === true, launchOnStartup: values?.launchOnStartup === true,
    }
    const candidate = parsed.session
    const validKind = candidate && ['focus', 'shortBreak', 'longBreak'].includes(candidate.kind)
    const validStatus = candidate && ['idle', 'running', 'paused'].includes(candidate.status)
    const session = validKind && validStatus && Number.isFinite(candidate.remainingMs) && (candidate.deadline === null || Number.isFinite(candidate.deadline))
      ? candidate : createSession('focus', settings.focus)
    const history = Array.isArray(parsed.history) ? parsed.history.filter((item): item is DayStat => Boolean(item && /^\d{4}-\d{2}-\d{2}$/.test(item.date) && Number.isFinite(item.sessions) && Number.isFinite(item.minutes))) : []
    return { settings, session, completed: bounded(parsed.completed, 0, 0, Number.MAX_SAFE_INTEGER), totalMinutes: bounded(parsed.totalMinutes, 0, 0, Number.MAX_SAFE_INTEGER), history }
  } catch { return createSaved() }
}
const kindDuration = (kind: SessionKind, settings: Settings) => kind === 'focus' ? settings.focus : kind === 'shortBreak' ? settings.shortBreak : settings.longBreak

function App() {
  const [saved, setSaved] = useState<Saved>(loadSaved)
  const [view, setView] = useState<View>('timer')
  const [now, setNow] = useState(Date.now())
  const [message, setMessage] = useState('')
  const [completionCue, setCompletionCue] = useState(false)
  const timeoutRef = useRef<number | undefined>()
  const messageTimeoutRef = useRef<number | undefined>()
  const audioRef = useRef<AudioContext | null>(null)
  const { session, settings } = saved
  const today = dayKey(new Date(now))
  const dailyStat = saved.history.find((entry) => entry.date === today)
  const dailySessions = dailyStat?.sessions ?? 0
  const progress = progressFraction(session, kindDuration(session.kind, settings), now)
  const supportsStartup = window.FlowState?.platform === 'win32' || window.FlowState?.platform === 'darwin'
  const update = useCallback((fn: (current: Saved) => Saved) => setSaved((current) => fn(current)), [])

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(saved)) }, [saved])
  useEffect(() => { const tick = window.setInterval(() => setNow(Date.now()), 250); return () => window.clearInterval(tick) }, [])
  useEffect(() => () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current) }, [])

  const playTone = useCallback(() => {
    if (!settings.sound) return
    try {
      const context = audioRef.current ?? new AudioContext()
      audioRef.current = context
      const oscillator = context.createOscillator(), gain = context.createGain()
      oscillator.type = 'sine'; oscillator.frequency.value = 620
      gain.gain.setValueAtTime(0.0001, context.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.055, context.currentTime + 0.025)
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35)
      oscillator.connect(gain); gain.connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + 0.36)
    } catch { /* Sound is optional; the timer continues if audio is unavailable. */ }
  }, [settings.sound])

  const start = useCallback(() => { setMessage(''); update((current) => ({ ...current, session: current.session.status === 'paused' ? resumeSession(current.session) : startSession(current.session) })) }, [update])
  const pause = useCallback(() => { setMessage(''); update((current) => ({ ...current, session: pauseSession(current.session) })) }, [update])
  const reset = useCallback(() => { setMessage(''); setCompletionCue(false); update((current) => ({ ...current, session: createSession(current.session.kind, kindDuration(current.session.kind, current.settings)) })) }, [update])
  const advance = useCallback((current: Saved, countFocus: boolean): Saved => {
    const completed = current.completed + (countFocus ? 1 : 0)
    const kind = nextSessionKind(current.session.kind, completed, current.settings.interval)
    const next = createSession(kind, kindDuration(kind, current.settings))
    const started = kind === 'focus' ? current.settings.autoFocus : current.settings.autoBreaks
    const result: Saved = { ...current, completed, totalMinutes: current.totalMinutes + (countFocus ? current.settings.focus : 0), session: started ? startSession(next) : next }
    if (countFocus) {
      const date = dayKey(new Date())
      const previous = result.history.find((entry) => entry.date === date)
      result.history = previous
        ? result.history.map((entry) => entry.date === date ? { ...entry, sessions: entry.sessions + 1, minutes: entry.minutes + current.settings.focus } : entry)
        : [...result.history, { date, sessions: 1, minutes: current.settings.focus }].slice(-400)
    }
    return result
  }, [])
  const finish = useCallback((skipped = false) => {
    const countedFocus = !skipped && session.kind === 'focus'
    update((current) => advance(current, countedFocus))
    playTone()
    setMessage(skipped ? 'SESSION SKIPPED.' : countedFocus ? `SESSION COMPLETE · +${settings.focus} MIN.` : 'BREAK COMPLETE.')
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    if (!skipped) {
      setCompletionCue(true)
      timeoutRef.current = window.setTimeout(() => setCompletionCue(false), 520)
    } else setCompletionCue(false)
    if (messageTimeoutRef.current) window.clearTimeout(messageTimeoutRef.current)
    messageTimeoutRef.current = window.setTimeout(() => setMessage(''), 1800)
  }, [advance, playTone, session.kind, settings.focus, update])
  useEffect(() => { if (session.status === 'running' && remainingMs(session, now) <= 0) finish(false) }, [finish, now, session])

  const selectKind = (kind: SessionKind) => {
    if (session.status === 'running') return
    update((current) => ({ ...current, session: createSession(kind, kindDuration(kind, current.settings)) }))
    setMessage(''); setCompletionCue(false)
  }
  const setDuration = (key: 'focus' | 'shortBreak' | 'longBreak' | 'interval' | 'dailyGoal', value: number) => update((current) => {
    const nextSettings = { ...current.settings, [key]: value }
    const nextSession = key !== 'interval' && key !== 'dailyGoal' && current.session.kind === key && current.session.status !== 'running'
      ? createSession(current.session.kind, kindDuration(current.session.kind, nextSettings)) : current.session
    return { ...current, settings: nextSettings, session: nextSession }
  })
  const selectPreset = useCallback((minutes: FocusPreset) => update((current) => ({
    ...current,
    settings: { ...current.settings, focus: minutes },
    session: applyFocusPreset(current.session, minutes),
  })), [update])
  const toggleSetting = (key: 'autoBreaks' | 'autoFocus' | 'sound' | 'alwaysOnTop' | 'launchOnStartup') => {
    const value = !settings[key]
    update((current) => ({ ...current, settings: { ...current.settings, [key]: value } }))
    const applyNative = key === 'alwaysOnTop' ? window.FlowState?.setAlwaysOnTop(value) : key === 'launchOnStartup' ? window.FlowState?.setLaunchOnStartup(value) : undefined
    if (applyNative) void applyNative.then((success) => {
      if (!success) update((current) => ({ ...current, settings: { ...current.settings, [key]: !value } }))
    }).catch(() => update((current) => ({ ...current, settings: { ...current.settings, [key]: !value } })))
  }
  const toggleTimer = useCallback(() => session.status === 'running' ? pause() : start(), [pause, session.status, start])
  const skip = useCallback(() => finish(true), [finish])

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null
    if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return
    if ((event.ctrlKey || event.metaKey) && event.key === ',') { event.preventDefault(); setView('settings'); return }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') { event.preventDefault(); setView('stats'); return }
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key === 'Escape') { setView('timer'); return }
    if (view !== 'timer' || event.repeat) return
    if (event.code === 'Space') { event.preventDefault(); toggleTimer() }
    else if (event.key.toLowerCase() === 'r') reset()
    else if (event.key.toLowerCase() === 's') skip()
  }, [session.status, view, pause, start, reset, skip])
  useEffect(() => { window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown) }, [onKeyDown])

  const statsDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = shiftDayKey(today, index - 6)
    const entry = saved.history.find((item) => item.date === date)
    const parsed = new Date(`${date}T12:00:00`)
    return { date, label: parsed.toLocaleDateString('en', { weekday: 'narrow' }), minutes: entry?.minutes ?? 0, sessions: entry?.sessions ?? 0 }
  }), [saved.history, today])
  const streak = currentDailyStreak(saved.history.filter((entry) => entry.sessions > 0).map((entry) => entry.date), today)
  const remaining = remainingMs(session, now)
  const remainingSeconds = Math.ceil(remaining / 1000)
  useEffect(() => {
    window.FlowState?.updateTrayState({ kind: session.kind, status: session.status, remainingSeconds, completed: dailySessions, goal: settings.dailyGoal, focusDuration: settings.focus })
  }, [dailySessions, remainingSeconds, session.kind, session.status, settings.dailyGoal, settings.focus])
  useEffect(() => window.FlowState?.onTrayAction((action) => {
    if (action === 'toggle') toggleTimer()
    else if (action === 'reset') reset()
    else if (action === 'skip') skip()
    else if (action === 'preset:25') selectPreset(25)
    else if (action === 'preset:45') selectPreset(45)
    else if (action === 'preset:60') selectPreset(60)
  }), [reset, selectPreset, skip, toggleTimer])
  const statusMessage = message || (session.status === 'running' ? session.kind === 'focus' ? 'Focusing' : 'Take a short break' : session.status === 'paused' ? 'Paused' : 'Ready to focus')
  const rootClass = `window-shell ${completionCue ? 'done' : session.status} ${session.kind === 'focus' ? '' : 'break-mode'} ${session.status === 'running' ? 'is-running' : ''}`

  return <main className={rootClass}>
    <WindowHeader view={view} alwaysOnTop={settings.alwaysOnTop} onView={setView} onAlwaysOnTop={() => toggleSetting('alwaysOnTop')} />
    {view === 'timer' && <TimerView kind={session.kind} status={session.status} focusDuration={settings.focus} minutes={formatTime(remaining).slice(0, 2)} seconds={formatTime(remaining).slice(3)} progress={progress} dailySessions={dailySessions} sessionGoal={settings.dailyGoal} totalFocusMinutes={saved.totalMinutes} message={statusMessage} completionCue={completionCue} onSelectKind={selectKind} onPreset={selectPreset} onToggle={toggleTimer} onReset={reset} onSkip={skip} />}
    {view === 'settings' && <SettingsView settings={settings} supportsStartup={supportsStartup} onNumber={setDuration} onToggle={toggleSetting} />}
    {view === 'stats' && <StatsView completedSessions={saved.completed} totalMinutes={saved.totalMinutes} streak={streak} dailySessions={dailySessions} dailyGoal={settings.dailyGoal} days={statsDays} />}
  </main>
}
export default App
