import { AppMenu } from './AppMenu'

type View = 'timer' | 'settings' | 'stats'
type Props = {
  view: View
  alwaysOnTop: boolean
  miniWindowOpen: boolean
  onView: (view: View) => void
  onAlwaysOnTop: () => void
  onDetach: () => void
}

export function AppHeader({ view, alwaysOnTop, miniWindowOpen, onView, onAlwaysOnTop, onDetach }: Props) {
  return <header className="app-header">
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
        <rect x="158" y="60" width="10" height="132" fill="var(--brand)" />
      </svg>
      <span>FlowState</span>
    </div>
    <AppMenu
      view={view}
      alwaysOnTop={alwaysOnTop}
      miniWindowOpen={miniWindowOpen}
      onView={onView}
      onAlwaysOnTop={onAlwaysOnTop}
      onDetach={onDetach}
    />
  </header>
}
