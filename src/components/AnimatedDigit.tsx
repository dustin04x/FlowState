import { useLayoutEffect, useRef, useState } from 'react'

interface AnimatedDigitProps {
  value: number
  className?: string
}

const DIGIT_TRANSITION_MS = 260

export function AnimatedDigit({ value, className }: AnimatedDigitProps) {
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const previousValue = useRef(value)

  useLayoutEffect(() => {
    if (previousValue.current === value) return
    const previous = previousValue.current
    previousValue.current = value

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setOutgoing(null)
      return
    }

    setOutgoing(previous)
    const timeout = window.setTimeout(() => setOutgoing(null), DIGIT_TRANSITION_MS)
    return () => window.clearTimeout(timeout)
  }, [value])

  return (
    <span className={['animated-digit', className].filter(Boolean).join(' ')}>
      {outgoing !== null && <span className="digit digit-out roll-out" aria-hidden="true">{outgoing}</span>}
      <span className={`digit digit-current${outgoing !== null ? ' roll-in' : ''}`}>{value}</span>
    </span>
  )
}
