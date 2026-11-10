export type ChimeKind = 'completion' | 'break'

type Note = { frequency: number; offset: number; gain: number; decay: number; pan: number }
type Chime = { notes: Note[]; cutoff: number }

// Two-note bells: a rising major third for completions, a softer descending
// third for breaks. Slight stereo spread keeps them from sounding flat.
const CHIMES: Record<ChimeKind, Chime> = {
  completion: {
    cutoff: 4200,
    notes: [
      { frequency: 523.25, offset: 0, gain: 1, decay: 1.5, pan: -0.16 },
      { frequency: 659.25, offset: 0.17, gain: 0.8, decay: 1.7, pan: 0.16 },
    ],
  },
  break: {
    cutoff: 3200,
    notes: [
      { frequency: 392, offset: 0, gain: 0.85, decay: 1, pan: 0.12 },
      { frequency: 329.63, offset: 0.15, gain: 0.75, decay: 1.2, pan: -0.12 },
    ],
  },
}

// Inharmonic partials give a glassy bell instead of a flat beep. Higher
// partials are quieter and die away faster than the fundamental.
const PARTIALS = [
  { ratio: 1, gain: 1, decay: 1 },
  { ratio: 2.004, gain: 0.22, decay: 0.6 },
  { ratio: 3.01, gain: 0.07, decay: 0.4 },
]
const PEAK = 0.05

export function playChime(context: BaseAudioContext, kind: ChimeKind) {
  const { notes, cutoff } = CHIMES[kind]
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = cutoff
  filter.connect(context.destination)

  const now = context.currentTime
  for (const note of notes) {
    const start = now + note.offset
    const panner = context.createStereoPanner()
    panner.pan.value = note.pan
    panner.connect(filter)
    for (const partial of PARTIALS) {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = note.frequency * partial.ratio
      const envelope = context.createGain()
      const end = start + note.decay * partial.decay
      envelope.gain.setValueAtTime(0.0001, start)
      envelope.gain.exponentialRampToValueAtTime(PEAK * note.gain * partial.gain, start + 0.01)
      envelope.gain.exponentialRampToValueAtTime(0.0001, end)
      oscillator.connect(envelope)
      envelope.connect(panner)
      oscillator.start(start)
      oscillator.stop(end + 0.02)
    }
  }
}
