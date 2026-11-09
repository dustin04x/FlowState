interface Window {
  FlowState: {
    platform: string
    minimize: () => Promise<void>
    close: () => Promise<void>
    setAlwaysOnTop: (enabled: boolean) => Promise<boolean>
    setLaunchOnStartup: (enabled: boolean) => Promise<boolean>
    setTheme: (theme: 'system' | 'light' | 'dark') => Promise<boolean>
    updateTrayState: (state: { kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; completed: number; goal: number; focusDuration: number }) => void
    updateTimerState: (state: { kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; durationSeconds: number; completed: number; goal: number; focusDuration: number; progress: number; theme: 'light' | 'dark' }) => void
    timerAction: (action: 'toggle' | 'reset' | 'skip') => void
    openMiniWindow: () => Promise<boolean>
    getTimerState: () => Promise<{ kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; durationSeconds: number; completed: number; goal: number; focusDuration: number; progress: number; theme: 'light' | 'dark' } | null>
    expandMiniWindow: () => Promise<boolean>
    closeMiniWindow: () => Promise<boolean>
    onMiniWindowClosed: (listener: () => void) => () => void
    onTrayAction: (listener: (action: 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60') => void) => () => void
    onTimerState: (listener: (state: { kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; durationSeconds: number; completed: number; goal: number; focusDuration: number; progress: number; theme: 'light' | 'dark' }) => void) => () => void
    onTimerAction: (listener: (action: 'toggle' | 'reset' | 'skip') => void) => () => void
  }
}
