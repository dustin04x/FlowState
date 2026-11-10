/** @vitest-environment jsdom */
import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnimatedDigit } from './AnimatedDigit'

afterEach(() => vi.useRealTimers())

describe('AnimatedDigit', () => {
  it('renders the current digit', () => {
    const { container } = render(<AnimatedDigit value={5} />)
    expect(container.querySelector('.digit-current')?.textContent).toBe('5')
  })

  it('keeps unchanged digits stable (no outgoing animation)', () => {
    const { container, rerender } = render(<AnimatedDigit value={5} />)
    rerender(<AnimatedDigit value={5} />)
    expect(container.querySelector('.digit-out')).toBeNull()
  })

  it('animates a changed countdown digit and removes its outgoing value', () => {
    const { container, rerender } = render(<AnimatedDigit value={1} />)
    expect(container.querySelectorAll('.digit-current')).toHaveLength(1)

    vi.useFakeTimers()
    rerender(<AnimatedDigit value={2} />)
    expect(container.querySelector('.digit-out')?.textContent).toBe('1')
    expect(container.querySelector('.digit-current')?.textContent).toBe('2')
    expect(container.querySelector('.digit-out')?.classList.contains('roll-out')).toBe(true)
    expect(container.querySelector('.digit-current')?.classList.contains('roll-in')).toBe(true)

    act(() => vi.advanceTimersByTime(260))
    expect(container.querySelector('.digit-out')).toBeNull()
    expect(container.querySelector('.digit-current')?.textContent).toBe('2')
  })
})
