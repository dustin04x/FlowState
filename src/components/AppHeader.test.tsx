/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppHeader } from './AppHeader'

const bridge = {
  platform: 'win32',
  minimize: vi.fn(),
  close: vi.fn(),
} as unknown as Window['FlowState']

beforeEach(() => {
  window.FlowState = bridge
  vi.clearAllMocks()
})
afterEach(cleanup)

function renderHeader(overrides: Partial<Parameters<typeof AppHeader>[0]> = {}) {
  const props = {
    view: 'timer' as const,
    alwaysOnTop: false,
    miniWindowOpen: false,
    onView: vi.fn(),
    onAlwaysOnTop: vi.fn(),
    onDetach: vi.fn(),
    ...overrides,
  }
  render(<AppHeader {...props} />)
  return props
}

describe('AppHeader', () => {
  it('keeps the wordmark and secondary actions behind one menu', () => {
    renderHeader()
    expect(screen.getByText('FlowState')).not.toBeNull()
    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Statistics' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    expect(screen.getByRole('menu')).not.toBeNull()
    expect(screen.getByRole('menuitem', { name: /Statistics/ })).not.toBeNull()
    expect(screen.getByRole('menuitem', { name: /Settings/ })).not.toBeNull()
  })

  it('toggles always on top from the menu and closes it', () => {
    const props = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Always on top' }))
    expect(props.onAlwaysOnTop).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('navigates to statistics and closes on Escape', () => {
    const props = renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Statistics/ }))
    expect(props.onView).toHaveBeenCalledWith('stats')

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Menu' }))
  })

  it('wires minimize and hide to the native bridge', () => {
    renderHeader()
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Minimize' }))
    expect(bridge.minimize).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hide to tray' }))
    expect(bridge.close).toHaveBeenCalledTimes(1)
  })
})
