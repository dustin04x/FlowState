import { AnimatedDigit } from './AnimatedDigit'

interface TimerDisplayProps {
  minutes: string
  seconds: string
  className?: string
}

export function TimerDisplay({ minutes, seconds, className }: TimerDisplayProps) {
  const minDigits = minutes.padStart(2, '0').split('').map(Number)
  const secDigits = seconds.padStart(2, '0').split('').map(Number)

  return (
    <span className={['timer-display', className].filter(Boolean).join(' ')}>
      <AnimatedDigit value={minDigits[0]} />
      <AnimatedDigit value={minDigits[1]} />
      <span className="timer-separator">:</span>
      <AnimatedDigit value={secDigits[0]} />
      <AnimatedDigit value={secDigits[1]} />
    </span>
  )
}
