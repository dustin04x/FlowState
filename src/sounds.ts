export type ChimeKind = 'completion' | 'break'

type ChimeParams = { base: number; overtone: number; durationMs: number }

const CHIMES: Record<ChimeKind, ChimeParams> = {
  completion: { base: 523.25, overtone: 1.5, durationMs: 1400 },
  break: { base: 392, overtone: 1.5, durationMs: 1000 },
}

// Warm, soft-bell synthesis: a lowpassed triangle with a soft sine overtone and
// a gentle attack/release so the chime never clicks.
export function playChime(context: BaseAudioContext, kind: ChimeKind) {
  const { base, overtone, durationMs } = CHIMES[kind]
  const master = context.createGain()
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2800
  const now = context.currentTime
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.06, now + 0.1)
  master.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)
  master.connect(context.destination)
  const fundamental = context.createOscillator()
  fundamental.type = 'triangle'
  fundamental.frequency.value = base
  const harmonic = context.createOscillator()
  harmonic.type = 'sine'
  harmonic.frequency.value = base * overtone
  fundamental.connect(filter)
  harmonic.connect(filter)
  filter.connect(master)
  const tail = durationMs / 1000 + 0.1
  fundamental.start(now)
  fundamental.stop(now + tail)
  harmonic.start(now)
  harmonic.stop(now + tail)
}
