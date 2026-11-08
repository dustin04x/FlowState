interface Window {
  flowstate: {
    platform: string
    minimize: () => Promise<void>
    close: () => Promise<void>
    setAlwaysOnTop: (enabled: boolean) => Promise<boolean>
    setLaunchOnStartup: (enabled: boolean) => Promise<boolean>
    updateTrayState: (state: { kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; completed: number; goal: number; focusDuration: number }) => void
    onTrayAction: (listener: (action: 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60') => void) => () => void
  }
}
