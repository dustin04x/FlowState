import { useCallback, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MiniClock } from './components/MiniClock'
import { type TimerStatus, type SessionKind } from './engine/timer'
import { applyTheme, type ResolvedTheme } from './theme'

type MiniTimerState = {
  kind: SessionKind
  status: TimerStatus
  remainingSeconds: number
  durationSeconds: number
  completed: number
  goal: number
  focusDuration: number
  progress: number
  theme: ResolvedTheme
}

function MiniClockApp() {
  const [state, setState] = useState<MiniTimerState | null>(null)
  const theme = state?.theme

  const onTimerState = useCallback((next: MiniTimerState) => {
    setState(next)
  }, [])

  useEffect(() => {
    const remove = window.FlowState?.onTimerState(onTimerState)
    // Ask for the current snapshot in case the main process broadcast it
    // before this window finished mounting.
    window.FlowState?.getTimerState().then((snapshot) => { if (snapshot) setState(snapshot) })
    return () => remove?.()
  }, [onTimerState])

  useEffect(() => { if (theme) applyTheme(theme) }, [theme])

  const toggle = useCallback(() => window.FlowState?.timerAction('toggle'), [])
  const reset = useCallback(() => window.FlowState?.timerAction('reset'), [])
  const expand = useCallback(() => { void window.FlowState?.expandMiniWindow() }, [])
  const close = useCallback(() => {
    if (window.FlowState?.closeMiniWindow) void window.FlowState.closeMiniWindow()
    else window.close()
  }, [])

  if (!state) return null

  const { kind, status, remainingSeconds, durationSeconds, progress } = state

  return (
    <MiniClock
      kind={kind}
      status={status}
      remainingSeconds={remainingSeconds}
      durationSeconds={durationSeconds}
      progress={progress}
      theme={state.theme}
      onToggle={toggle}
      onReset={reset}
      onExpand={expand}
      onClose={close}
    />
  )
}

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(<MiniClockApp />)
}
