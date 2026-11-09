import type { ThemeChoice } from '../theme'

type Settings = {
  focus: number
  shortBreak: number
  longBreak: number
  interval: number
  dailyGoal: number
  autoBreaks: boolean
  autoFocus: boolean
  sound: boolean
  alwaysOnTop: boolean
  launchOnStartup: boolean
  theme: ThemeChoice
}
type DurationKey = 'focus' | 'shortBreak' | 'longBreak' | 'interval' | 'dailyGoal'
type ToggleKey = 'autoBreaks' | 'autoFocus' | 'sound' | 'alwaysOnTop' | 'launchOnStartup'
type Props = {
  settings: Settings
  supportsStartup: boolean
  onNumber: (key: DurationKey, value: number) => void
  onToggle: (key: ToggleKey) => void
  onTheme: (theme: ThemeChoice) => void
}

const durationRows: { key: DurationKey; label: string; unit: string; min: number; max: number }[] = [
  { key: 'focus', label: 'Focus duration', unit: 'min', min: 1, max: 90 },
  { key: 'shortBreak', label: 'Short break', unit: 'min', min: 1, max: 30 },
  { key: 'longBreak', label: 'Long break', unit: 'min', min: 1, max: 60 },
  { key: 'interval', label: 'Long break after', unit: 'sessions', min: 2, max: 8 },
  { key: 'dailyGoal', label: 'Daily focus goal', unit: 'sessions', min: 1, max: 12 },
]
const toggleRows: { key: ToggleKey; label: string }[] = [
  { key: 'autoBreaks', label: 'Auto-start breaks' },
  { key: 'autoFocus', label: 'Auto-start focus' },
  { key: 'sound', label: 'Sound notifications' },
  { key: 'alwaysOnTop', label: 'Always on top' },
  { key: 'launchOnStartup', label: 'Launch on startup' },
]
const themes: { value: ThemeChoice; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function SettingsView({ settings, supportsStartup, onNumber, onToggle, onTheme }: Props) {
  return <section className="page settings-view">
    <div className="page-head"><h1>Settings</h1><span className="page-hint">Esc</span></div>
    <div className="page-scroll">
      <div className="group-label">Timer</div>
      {durationRows.map(({ key, label, unit, min, max }) => <div className="setting-row" key={key}>
        <span className="setting-name">{label}</span>
        <div className="stepper">
          <button type="button" className="step-button" aria-label={`Decrease ${label}`} onClick={() => onNumber(key, Math.max(min, settings[key] - 1))}>−</button>
          <output aria-label={`${settings[key]} ${unit.toLowerCase()}`}>{String(settings[key]).padStart(2, '0')}</output>
          <span className="setting-unit">{unit}</span>
          <button type="button" className="step-button" aria-label={`Increase ${label}`} onClick={() => onNumber(key, Math.min(max, settings[key] + 1))}>+</button>
        </div>
      </div>)}

      <div className="group-label">Behavior</div>
      {toggleRows.filter((row) => row.key !== 'launchOnStartup' || supportsStartup).map(({ key, label }) => <div className="setting-row" key={key}>
        <span className="setting-name">{label}</span>
        <button type="button" className="toggle" role="switch" aria-checked={settings[key]} aria-label={label} onClick={() => onToggle(key)} />
      </div>)}

      <div className="group-label">Appearance</div>
      <div className="setting-row">
        <span className="setting-name">Theme</span>
        <div className="theme-options" role="group" aria-label="Theme">
          {themes.map(({ value, label }) => <button
            key={value}
            type="button"
            className="theme-option"
            aria-pressed={settings.theme === value}
            onClick={() => onTheme(value)}
          >{label}</button>)}
        </div>
      </div>
    </div>
  </section>
}
