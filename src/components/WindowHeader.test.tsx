import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { WindowHeader } from './WindowHeader'

describe('WindowHeader', () => {
  it('crops the logo to its visible mark for the compact titlebar', () => {
    const markup = renderToStaticMarkup(
      <WindowHeader view="timer" alwaysOnTop={false} onView={() => {}} onAlwaysOnTop={() => {}} />,
    )

    expect(markup).toContain('viewBox="40 60 186 132"')
  })
})
