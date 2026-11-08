type Settings = { focus: number; shortBreak: number; longBreak: number; interval: number; dailyGoal: number; autoBreaks: boolean; autoFocus: boolean; sound: boolean; alwaysOnTop: boolean; launchOnStartup: boolean }
type DurationKey = 'focus' | 'shortBreak' | 'longBreak' | 'interval' | 'dailyGoal'
type Props = { settings: Settings; supportsStartup: boolean; onNumber: (key: DurationKey, value: number) => void; onToggle: (key: 'autoBreaks' | 'autoFocus' | 'sound' | 'alwaysOnTop' | 'launchOnStartup') => void }
const durationRows: { key: DurationKey; label: string; unit: string; min: number; max: number }[] = [
  { key: 'focus', label: 'Focus duration', unit: 'MIN', min: 1, max: 90 },
  { key: 'dailyGoal', label: 'Daily focus goal', unit: 'SESSIONS', min: 1, max: 12 },
  { key: 'shortBreak', label: 'Short break', unit: 'MIN', min: 1, max: 30 },
  { key: 'longBreak', label: 'Long break', unit: 'MIN', min: 1, max: 60 },
  { key: 'interval', label: 'Long break after', unit: 'SESSIONS', min: 2, max: 8 },
]
const toggleRows: { key: 'autoBreaks' | 'autoFocus' | 'sound' | 'alwaysOnTop' | 'launchOnStartup'; label: string }[] = [
  { key: 'autoBreaks', label: 'Auto-start breaks' }, { key: 'autoFocus', label: 'Auto-start focus' },
  { key: 'sound', label: 'Sound notifications' }, { key: 'alwaysOnTop', label: 'Always on top' }, { key: 'launchOnStartup', label: 'Launch on startup' },
]

export function SettingsView({ settings, supportsStartup, onNumber, onToggle }: Props) {
  return <section className="secondary-body">
    <div className="secondary-heading"><span>SETTINGS</span><span className="heading-note">Changes save automatically</span></div>
    <div className="settings-list">
      {durationRows.map(({ key, label, unit, min, max }) => <div className="setting-row" key={key}>
        <span className="setting-name">{label}</span>
        <div className="stepper">
          <button className="step-button" aria-label={`Decrease ${label}`} onClick={() => onNumber(key, Math.max(min, settings[key] - 1))}>−</button>
          <output aria-label={`${settings[key]} ${unit.toLowerCase()}`}>{String(settings[key]).padStart(2, '0')}</output><span className="setting-unit">{unit}</span>
          <button className="step-button" aria-label={`Increase ${label}`} onClick={() => onNumber(key, Math.min(max, settings[key] + 1))}>+</button>
        </div>
      </div>)}
      <div className="settings-break" />
      {toggleRows.filter((row) => row.key !== 'launchOnStartup' || supportsStartup).map(({ key, label }) => <div className="setting-row" key={key}>
        <span className="setting-name">{label}</span>
        <button className={`toggle ${settings[key] ? 'enabled' : ''}`} role="switch" aria-checked={settings[key]} aria-label={label} onClick={() => onToggle(key)}><i /></button>
      </div>)}
    </div>
    <footer className="secondary-footer"><span>SPACE · R · S</span><span>ESC TO RETURN</span></footer>
  </section>
}
