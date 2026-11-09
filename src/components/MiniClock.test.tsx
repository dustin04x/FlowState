/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MiniClock } from './MiniClock'

afterEach(cleanup)

const baseProps = {
  kind: 'focus' as const,
  status: 'running' as const,
  remainingSeconds: 900,
  durationSeconds: 1500,
  progress: 0.4,
  onToggle: () => {},
  onReset: () => {},
  onExpand: () => {},
  onClose: () => {},
}

describe('MiniClock', () => {
  it('renders session type and time digits', () => {
    const { container } = render(<MiniClock {...baseProps} />)
    expect(container.querySelector('.mini-session')?.textContent).toBe('Focus')
    expect(container.querySelectorAll('.animated-digit')).toHaveLength(4)
  })

  it('renders short break with correct label', () => {
    const { container } = render(<MiniClock {...baseProps} kind="shortBreak" status="idle" remainingSeconds={300} durationSeconds={300} progress={0} />)
    expect(container.querySelector('.mini-session')?.textContent).toBe('Short break')
  })

  it('renders long break with correct label', () => {
    const { container } = render(<MiniClock {...baseProps} kind="longBreak" status="idle" remainingSeconds={900} durationSeconds={900} progress={0} />)
    expect(container.querySelector('.mini-session')?.textContent).toBe('Long break')
  })

  it('calls onToggle when the primary button is clicked', () => {
    const onToggle = vi.fn()
    const { container } = render(<MiniClock {...baseProps} onToggle={onToggle} />)
    const primary = container.querySelector('.mini-play')
    expect(primary).not.toBeNull()
    primary?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('keeps expand and close as separate actions', () => {
    const onExpand = vi.fn()
    const onClose = vi.fn()
    render(<MiniClock {...baseProps} onExpand={onExpand} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand to main window' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close mini-clock' }))
    expect(onExpand).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('carries the resolved theme on its own root', () => {
    const { container } = render(<MiniClock {...baseProps} theme="dark" />)
    expect(container.querySelector('.mini-clock')?.getAttribute('data-theme')).toBe('dark')
  })
})
