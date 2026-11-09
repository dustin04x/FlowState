import { useEffect, useRef, useState } from 'react'

interface AnimatedDigitProps {
  value: number
  className?: string
}

const DURATION = 200

export function AnimatedDigit({ value, className }: AnimatedDigitProps) {
  const [outgoing, setOutgoing] = useState<number | null>(null)
  const prevRef = useRef(value)
  const mountedRef = useRef(false)
  const reducedMotion =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  // Skip the very first effect run (initial mount) so no outgoing digit
  // flashes when the component first renders.
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (prevRef.current !== value && !reducedMotion) {
      setOutgoing(prevRef.current)
      prevRef.current = value
      const t = setTimeout(() => {
        setOutgoing(null)
      }, DURATION)
      return () => clearTimeout(t)
    }
  }, [value, reducedMotion])

  // The current digit stays in normal flow so the wrapper keeps its natural
  // width and never collapses. Only the outgoing digit is taken out of flow.
  return (
    <span className={['animated-digit', className].filter(Boolean).join(' ')}>
      {outgoing != null && <span className="digit digit-out roll-out">{outgoing}</span>}
      <span className={`digit digit-current ${outgoing != null ? 'roll-in' : ''}`}>{value}</span>
    </span>
  )
}
