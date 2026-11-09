/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { TimerDisplay } from './TimerDisplay'

describe('TimerDisplay', () => {
  it('renders four animated digits and one separator', () => {
    const { container } = render(<TimerDisplay minutes="25" seconds="00" />)
    expect(container.querySelectorAll('.animated-digit')).toHaveLength(4)
    expect(container.querySelector('.timer-separator')?.textContent).toBe(':')
  })

  it('renders single-digit values with leading zero', () => {
    const { container } = render(<TimerDisplay minutes="5" seconds="9" />)
    expect(container.querySelectorAll('.animated-digit')).toHaveLength(4)
  })
})
