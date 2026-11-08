import { ChartNoAxesColumn, Minus, Pin, PinOff, Settings2, X } from 'lucide-react'

type View = 'timer' | 'settings' | 'stats'
type Props = { view: View; alwaysOnTop: boolean; onView: (view: View) => void; onAlwaysOnTop: () => void }

export function WindowHeader({ view, alwaysOnTop, onView, onAlwaysOnTop }: Props) {
  return <header className="titlebar">
    <div className="wordmark">
      <svg className="wordmark-mark" viewBox="40 60 186 132" aria-hidden="true">
        <g fill="currentColor">
          <rect x="40" y="120" width="6" height="64" />
          <rect x="60" y="148" width="6" height="36" />
          <rect x="80" y="148" width="6" height="36" />
          <rect x="100" y="148" width="6" height="36" />
          <rect x="120" y="120" width="6" height="64" />
          <rect x="140" y="148" width="6" height="36" />
          <g opacity=".35">
            <rect x="180" y="148" width="6" height="36" />
            <rect x="200" y="120" width="6" height="64" />
            <rect x="220" y="148" width="6" height="36" />
          </g>
        </g>
        <rect x="158" y="60" width="10" height="132" fill="#FF4D1F" />
      </svg>
      <span>FlowState</span>
    </div>
    <nav className="header-actions" aria-label="App navigation">
      <button className={`header-link ${view === 'stats' ? 'selected' : ''}`} onClick={() => onView(view === 'stats' ? 'timer' : 'stats')} aria-label="Statistics"><ChartNoAxesColumn size={13} /><span>Stats</span></button>
      <button className={`header-link ${view === 'settings' ? 'selected' : ''}`} onClick={() => onView(view === 'settings' ? 'timer' : 'settings')} aria-label="Settings"><Settings2 size={13} /><span>Set</span></button>
      <button className={`window-action ${alwaysOnTop ? 'selected' : ''}`} onClick={onAlwaysOnTop} aria-label={alwaysOnTop ? 'Disable always on top' : 'Enable always on top'} title="Always on top">{alwaysOnTop ? <Pin size={12} /> : <PinOff size={12} />}</button>
      <button className="window-action" onClick={() => void window.flowstate?.minimize()} aria-label="Minimize"><Minus size={14} /></button>
      <button className="window-action close-action" onClick={() => void window.flowstate?.close()} aria-label="Hide FlowState to tray" title="Hide to tray"><X size={14} /></button>
    </nav>
  </header>
}
