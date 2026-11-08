import { contextBridge, ipcRenderer } from 'electron'
contextBridge.exposeInMainWorld('flowstate', {
  platform: process.platform,
  minimize: () => ipcRenderer.invoke('window:minimize') as Promise<void>,
  close: () => ipcRenderer.invoke('window:close') as Promise<void>,
  setAlwaysOnTop: (enabled: boolean) => ipcRenderer.invoke('window:set-always-on-top', enabled) as Promise<boolean>,
  setLaunchOnStartup: (enabled: boolean) => ipcRenderer.invoke('app:set-launch-on-startup', enabled) as Promise<boolean>,
  updateTrayState: (state: { kind: 'focus' | 'shortBreak' | 'longBreak'; status: 'idle' | 'running' | 'paused'; remainingSeconds: number; completed: number; goal: number; focusDuration: number }) => ipcRenderer.send('tray:update-state', state),
  onTrayAction: (listener: (action: 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60') => void) => {
    const handler = (_event: Electron.IpcRendererEvent, action: 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60') => listener(action)
    ipcRenderer.on('tray:action', handler)
    return () => ipcRenderer.removeListener('tray:action', handler)
  },
})
