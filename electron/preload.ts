import { contextBridge, ipcRenderer } from 'electron'

type Snapshot = {
  kind: 'focus' | 'shortBreak' | 'longBreak'
  status: 'idle' | 'running' | 'paused'
  remainingSeconds: number
  durationSeconds: number
  completed: number
  goal: number
  focusDuration: number
  progress: number
  theme: 'light' | 'dark'
}

contextBridge.exposeInMainWorld('FlowState', {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('window:minimize') as Promise<void>,
  close: () => ipcRenderer.invoke('window:close') as Promise<void>,
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.invoke('window:set-always-on-top', enabled) as Promise<boolean>,
  setLaunchOnStartup: (enabled: boolean) => ipcRenderer.invoke('app:set-launch-on-startup', enabled) as Promise<boolean>,
  setTheme: (theme: 'system' | 'light' | 'dark') => ipcRenderer.invoke('theme:set', theme) as Promise<boolean>,
  updateTrayState: (state: { kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; completed: number; goal: number; focusDuration: number }) => ipcRenderer.send('tray:update-state', state),
  updateTimerState: (state: Snapshot) => ipcRenderer.send('timer:update-state', state),
  timerAction: (action: 'toggle' | 'reset' | 'skip') => ipcRenderer.send('timer:action', action),
  onTrayAction: (listener: (action: 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60') => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60') => listener(action)
    ipcRenderer.on('tray:action', handler)
    return () => ipcRenderer.removeListener('tray:action', handler)
  },
  onTimerState: (listener: (state: Snapshot) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, state: Snapshot) => listener(state)
    ipcRenderer.on('timer:state', handler)
    return () => ipcRenderer.removeListener('timer:state', handler)
  },
  onTimerAction: (listener: (action: 'toggle' | 'reset' | 'skip') => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: 'toggle' | 'reset' | 'skip') => listener(action)
    ipcRenderer.on('timer:action', handler)
    return () => ipcRenderer.removeListener('timer:action', handler)
  },
  openMiniWindow: () => ipcRenderer.invoke('mini:open') as Promise<boolean>,
  getTimerState: () => ipcRenderer.invoke('timer:get-state') as Promise<Snapshot | null>,
  expandMiniWindow: () => ipcRenderer.invoke('mini:expand') as Promise<boolean>,
  closeMiniWindow: () => ipcRenderer.invoke('mini:close') as Promise<boolean>,
  onMiniWindowClosed: (listener: () => void) => {
    const handler = () => listener()
    ipcRenderer.on('mini:closed', handler)
    return () => ipcRenderer.removeListener('mini:closed', handler)
  },
})
