import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu, screen, type IpcMainEvent, type IpcMainInvokeEvent, type MenuItemConstructorOptions } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'

type SessionKind = 'focus' | 'shortBreak' | 'longBreak'
type TimerStatus = 'idle' | 'running' | 'paused'
type TrayAction = 'toggle' | 'reset' | 'skip' | 'preset:25' | 'preset:45' | 'preset:60'
type TrayState = { kind: SessionKind; status: TimerStatus; remainingSeconds: number; completed: number; goal: number; focusDuration: number }
type WindowSettings = { x?: number; y?: number; alwaysOnTop?: boolean }

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let settingsPath = ''
let isQuitting = false
let lastMenuState = ''
let trayState: TrayState = { kind: 'focus', status: 'idle', remainingSeconds: 1500, completed: 0, goal: 4, focusDuration: 25 }

const readSettings = (): WindowSettings => {
  try { return JSON.parse(fs.readFileSync(settingsPath, 'utf8')) as WindowSettings } catch { return {} }
}
const writeSettings = (next: WindowSettings) => {
  const current = readSettings()
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true })
  fs.writeFileSync(settingsPath, JSON.stringify({ ...current, ...next }), 'utf8')
}
function rendererUrl() {
  return process.env.VITE_DEV_SERVER_URL ?? pathToFileURL(path.join(__dirname, '../dist/index.html')).href
}
function isTrustedSender(event: IpcMainInvokeEvent | IpcMainEvent) {
  if (!event.senderFrame || event.senderFrame !== event.sender.mainFrame) return false
  try { return new URL(event.senderFrame.url).href === new URL(rendererUrl()).href } catch { return false }
}
function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
  refreshTrayMenu()
}
function hideWindow() {
  mainWindow?.hide()
  refreshTrayMenu()
}
function toggleWindow() {
  if (mainWindow?.isVisible()) hideWindow()
  else showWindow()
}
function sendTrayAction(action: TrayAction) {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('tray:action', action)
  showWindow()
}
const sessionName = (kind: SessionKind) => kind === 'focus' ? 'Focus' : kind === 'shortBreak' ? 'Short break' : 'Long break'
const formatTrayTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
function parseTrayState(value: unknown): TrayState | null {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Partial<TrayState>
  if (!['focus', 'shortBreak', 'longBreak'].includes(candidate.kind ?? '') || !['idle', 'running', 'paused'].includes(candidate.status ?? '')) return null
  if (![candidate.remainingSeconds, candidate.completed, candidate.goal, candidate.focusDuration].every((item) => typeof item === 'number' && Number.isFinite(item))) return null
  return {
    kind: candidate.kind!, status: candidate.status!,
    remainingSeconds: Math.max(0, Math.min(5400, Math.floor(candidate.remainingSeconds!))),
    completed: Math.max(0, Math.floor(candidate.completed!)),
    goal: Math.max(1, Math.min(12, Math.floor(candidate.goal!))),
    focusDuration: Math.max(1, Math.min(90, Math.floor(candidate.focusDuration!))),
  }
}
function buildTrayMenu(): MenuItemConstructorOptions[] {
  const timerLabel = trayState.status === 'running' ? `Pause ${sessionName(trayState.kind).toLowerCase()}` : trayState.status === 'paused' ? 'Resume timer' : 'Start focus'
  const goalLabel = trayState.completed >= trayState.goal
    ? `Daily goal reached · ${trayState.goal}/${trayState.goal}`
    : `Today · ${Math.min(trayState.goal, trayState.completed)}/${trayState.goal} focus sessions`
  const presets: MenuItemConstructorOptions = {
    label: 'Focus preset',
    enabled: trayState.status !== 'running',
    submenu: [25, 45, 60].map((minutes) => ({
      label: `${minutes} minutes`, type: 'radio' as const, checked: trayState.focusDuration === minutes,
      click: () => sendTrayAction(`preset:${minutes}` as TrayAction),
    })),
  }
  return [
    { label: `FlowState · ${sessionName(trayState.kind)} · ${formatTrayTime(trayState.remainingSeconds)}`, enabled: false },
    { label: goalLabel, enabled: false },
    { type: 'separator' },
    { label: timerLabel, click: () => sendTrayAction('toggle') },
    presets,
    { label: 'Reset timer', click: () => sendTrayAction('reset') },
    { label: 'Skip session', click: () => sendTrayAction('skip') },
    { type: 'separator' },
    { label: mainWindow?.isVisible() ? 'Hide FlowState' : 'Show FlowState', click: toggleWindow },
    { type: 'separator' },
    { label: 'Quit FlowState', click: () => { isQuitting = true; app.quit() } },
  ]
}
function refreshTrayMenu() {
  if (!tray) return
  const menuState = `${trayState.kind}|${trayState.status}|${trayState.completed}|${trayState.goal}|${trayState.focusDuration}|${mainWindow?.isVisible()}`
  if (menuState !== lastMenuState) {
    lastMenuState = menuState
    tray.setContextMenu(Menu.buildFromTemplate(buildTrayMenu()))
  }
  tray.setToolTip(`FlowState · ${sessionName(trayState.kind)} · ${trayState.status === 'running' ? formatTrayTime(trayState.remainingSeconds) : trayState.status === 'paused' ? `Paused · ${formatTrayTime(trayState.remainingSeconds)}` : `Ready · ${formatTrayTime(trayState.remainingSeconds)}`}`)
}
function updateTray(value: unknown) {
  const parsed = parseTrayState(value)
  if (!parsed) return
  trayState = parsed
  refreshTrayMenu()
}
function createWindow() {
  const saved = readSettings()
  const bounds = saved.x !== undefined && saved.y !== undefined ? { x: saved.x, y: saved.y } : { center: true }
  const iconPath = path.join(__dirname, '../assets/flowstate-mark.png')
  const trayIconPath = path.join(__dirname, '../assets/flowstate-tray.png')
  const window = new BrowserWindow({
    ...bounds, width: 320, height: 420, minWidth: 320, maxWidth: 320, minHeight: 420, maxHeight: 420,
    title: 'FlowState', icon: nativeImage.createFromPath(iconPath), frame: false, resizable: false, show: false, backgroundColor: '#ECE8DF',
    alwaysOnTop: saved.alwaysOnTop ?? false, autoHideMenuBar: true,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  })
  mainWindow = window
  window.once('ready-to-show', () => window.show())
  window.on('move', () => { if (!window.isDestroyed()) { const { x, y } = window.getBounds(); writeSettings({ x, y }) } })
  window.on('close', (event) => {
    if (!isQuitting) { event.preventDefault(); hideWindow() }
  })
  window.on('show', refreshTrayMenu)
  window.on('hide', refreshTrayMenu)
  window.on('closed', () => { if (mainWindow === window) mainWindow = null })
  window.setMenu(null)
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  window.webContents.on('will-navigate', (event, url) => {
    if (url !== rendererUrl()) event.preventDefault()
  })
  if (process.env.VITE_DEV_SERVER_URL) void window.loadURL(process.env.VITE_DEV_SERVER_URL)
  else void window.loadFile(path.join(__dirname, '../dist/index.html'))

  if (!tray) {
    tray = new Tray(nativeImage.createFromPath(trayIconPath))
    tray.on('click', toggleWindow)
    tray.on('double-click', showWindow)
  }
  refreshTrayMenu()
}

app.whenReady().then(() => {
  settingsPath = path.join(app.getPath('userData'), 'window.json')
  const saved = readSettings()
  if (saved.x !== undefined && saved.y !== undefined) {
    const displays = screen.getAllDisplays()
    const visible = displays.some(({ workArea }) => saved.x! >= workArea.x - 280 && saved.x! < workArea.x + workArea.width && saved.y! >= workArea.y - 380 && saved.y! < workArea.y + workArea.height)
    if (!visible) writeSettings({ x: undefined, y: undefined })
  }
  ipcMain.handle('window:minimize', (event) => { if (!isTrustedSender(event)) throw new Error('Untrusted renderer'); mainWindow?.minimize() })
  ipcMain.handle('window:close', (event) => { if (!isTrustedSender(event)) throw new Error('Untrusted renderer'); hideWindow() })
  ipcMain.handle('window:set-always-on-top', (event, enabled: unknown) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted renderer')
    if (typeof enabled !== 'boolean') return false
    mainWindow?.setAlwaysOnTop(enabled)
    writeSettings({ alwaysOnTop: enabled })
    return true
  })
  ipcMain.handle('app:set-launch-on-startup', (event, enabled: unknown) => {
    if (!isTrustedSender(event)) throw new Error('Untrusted renderer')
    if (typeof enabled !== 'boolean' || process.platform === 'linux') return false
    app.setLoginItemSettings({ openAtLogin: enabled })
    return true
  })
  ipcMain.on('tray:update-state', (event: IpcMainEvent, state: unknown) => {
    if (isTrustedSender(event)) updateTray(state)
  })
  createWindow()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); else showWindow() })
})
app.on('before-quit', () => { isQuitting = true })
