import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Check, MoreHorizontal } from 'lucide-react'

type View = 'timer' | 'settings' | 'stats'
type Props = {
  view: View
  alwaysOnTop: boolean
  miniWindowOpen: boolean
  onView: (view: View) => void
  onAlwaysOnTop: () => void
  onDetach: () => void
}

const viewItems: { view: View; label: string; shortcut?: string }[] = [
  { view: 'timer', label: 'Timer' },
  { view: 'stats', label: 'Statistics', shortcut: 'I' },
  { view: 'settings', label: 'Settings', shortcut: ',' },
]

const isMac = () => typeof window !== 'undefined' && window.FlowState?.platform === 'darwin'

export function AppMenu({ view, alwaysOnTop, miniWindowOpen, onView, onAlwaysOnTop, onDetach }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close()
    }
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      close(true)
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    menuRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const choose = (action: () => void) => {
    action()
    close(true)
  }

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Tab') { close(); return }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button'))
    const current = items.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? items.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
    items[next]?.focus()
  }

  return (
    <div className="header-menu" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className="menu-trigger"
        aria-label="Menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="app-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal size={16} strokeWidth={1.5} />
      </button>
      {open && (
        <div id="app-menu" ref={menuRef} className="app-menu" role="menu" aria-label="App menu" onKeyDown={onMenuKeyDown}>
          {viewItems.map((item) => (
            <button
              key={item.view}
              type="button"
              role="menuitem"
              className="menu-item"
              aria-current={view === item.view ? 'page' : undefined}
              onClick={() => choose(() => onView(item.view))}
            >
              <span className="menu-check">{view === item.view && <Check size={12} strokeWidth={2} aria-hidden="true" />}</span>
              <span className="menu-label">{item.label}</span>
              {item.shortcut && <span className="menu-shortcut">{isMac() ? `⌘${item.shortcut}` : `Ctrl ${item.shortcut}`}</span>}
            </button>
          ))}
          <div className="menu-separator" role="separator" />
          <button type="button" role="menuitemcheckbox" aria-checked={alwaysOnTop} className="menu-item" onClick={() => choose(onAlwaysOnTop)}>
            <span className="menu-check">{alwaysOnTop && <Check size={12} strokeWidth={2} aria-hidden="true" />}</span>
            <span className="menu-label">Always on top</span>
          </button>
          <button type="button" role="menuitemcheckbox" aria-checked={miniWindowOpen} className="menu-item" onClick={() => choose(onDetach)}>
            <span className="menu-check">{miniWindowOpen && <Check size={12} strokeWidth={2} aria-hidden="true" />}</span>
            <span className="menu-label">Mini-clock</span>
          </button>
          <div className="menu-separator" role="separator" />
          <button type="button" role="menuitem" className="menu-item" onClick={() => choose(() => void window.FlowState?.minimize())}>
            <span className="menu-check" />
            <span className="menu-label">Minimize</span>
          </button>
          <button type="button" role="menuitem" className="menu-item" onClick={() => choose(() => void window.FlowState?.close())}>
            <span className="menu-check" />
            <span className="menu-label">Hide to tray</span>
          </button>
        </div>
      )}
    </div>
  )
}
