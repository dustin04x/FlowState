import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WindowHeader } from './WindowHeader'

describe('WindowHeader', () => {
  it('uses FlowState title case in the visible titlebar and tray affordance', () => {
    const markup = renderToStaticMarkup(
      <WindowHeader view="timer" alwaysOnTop={false} onView={() => {}} onAlwaysOnTop={() => {}} />,
    )

    expect(markup).toContain('<span>FlowState</span>')
    expect(markup).toContain('Hide FlowState to tray')
    expect(markup).not.toContain('FLOWSTATE')
  })

  it('crops the logo to its visible mark for the compact titlebar', () => {
    const markup = renderToStaticMarkup(
      <WindowHeader view="timer" alwaysOnTop={false} onView={() => {}} onAlwaysOnTop={() => {}} />,
    )

    expect(markup).toContain('viewBox="40 60 186 132"')
  })
})
