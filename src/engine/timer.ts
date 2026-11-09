export type SessionKind = 'focus' | 'shortBreak' | 'longBreak'
export type TimerStatus = 'idle' | 'running' | 'paused'
// durationMs is the full length the session was created with. It is optional so
// sessions saved by earlier versions (which lack it) still load.
export interface TimerSession { kind: SessionKind; status: TimerStatus; deadline: number | null; remainingMs: number; durationMs?: number }
export const MAX_SESSION_MINUTES = 90
export const sessionMinutes = (session: TimerSession, fallbackMinutes: number): number =>
  typeof session.durationMs === 'number' && Number.isFinite(session.durationMs) && session.durationMs > 0
    ? Math.max(1, Math.round(session.durationMs / 60_000))
    : fallbackMinutes
export const FOCUS_PRESETS = [25, 45, 60] as const
export type FocusPreset = (typeof FOCUS_PRESETS)[number]
export type DailyGoalProgress = { completed: number; goal: number; remaining: number; fraction: number }
export const applyFocusPreset = (session: TimerSession, minutes: FocusPreset): TimerSession =>
  session.kind === 'focus' && session.status !== 'running' ? createSession('focus', minutes) : session
export const dailyGoalProgress = (completed: number, goal: number): DailyGoalProgress => {
  const normalizedGoal = Math.max(1, Math.min(12, Math.round(Number.isFinite(goal) ? goal : 4)))
  const normalizedCompleted = Math.max(0, Math.min(normalizedGoal, Math.floor(Number.isFinite(completed) ? completed : 0)))
  return { completed: normalizedCompleted, goal: normalizedGoal, remaining: normalizedGoal - normalizedCompleted, fraction: normalizedCompleted / normalizedGoal }
}
export const createSession = (kind: SessionKind, minutes: number, _now = Date.now()): TimerSession => ({
  kind, status: 'idle', deadline: null, remainingMs: minutes * 60_000,
  durationMs: minutes * 60_000,
})
export const startSession = (session: TimerSession, now = Date.now()): TimerSession => ({
  ...session, status: 'running', deadline: now + session.remainingMs,
})
export const pauseSession = (session: TimerSession, now = Date.now()): TimerSession => {
  if (session.status !== 'running' || session.deadline === null) return session
  return { ...session, status: 'paused', deadline: null, remainingMs: Math.max(0, session.deadline - now) }
}
export const resumeSession = (session: TimerSession, now = Date.now()): TimerSession =>
  session.status === 'paused' ? startSession(session, now) : session
export const remainingMs = (session: TimerSession, now = Date.now()): number =>
  session.status === 'running' && session.deadline !== null
    ? Math.max(0, session.deadline - now)
    : Math.max(0, session.remainingMs)
export const completeSession = (session: TimerSession, now = Date.now()): boolean =>
  session.status === 'running' && session.deadline !== null && now >= session.deadline
export const progressFraction = (session: TimerSession, durationMinutes: number, now = Date.now()): number => {
  const duration = Math.max(1, durationMinutes * 60_000)
  return Math.max(0, Math.min(1, 1 - remainingMs(session, now) / duration))
}
export const nextSessionKind = (current: SessionKind, completedFocusCount: number, interval: number): SessionKind => {
  if (current !== 'focus') return 'focus'
  return completedFocusCount > 0 && completedFocusCount % interval === 0 ? 'longBreak' : 'shortBreak'
}
export const dayKey = (date: Date): string => {
  const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2, '0'), day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
export const shiftDayKey = (key: string, offset: number): string => {
  const date = new Date(`${key}T12:00:00`)
  date.setDate(date.getDate() + offset)
  return dayKey(date)
}
export const currentDailyStreak = (activeDays: string[], today: string): number => {
  const days = new Set(activeDays)
  let cursor = days.has(today) ? today : shiftDayKey(today, -1)
  if (!days.has(cursor)) return 0
  let streak = 0
  while (days.has(cursor)) { streak += 1; cursor = shiftDayKey(cursor, -1) }
  return streak
}
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000)
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
}
