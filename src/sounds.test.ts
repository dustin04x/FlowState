import { describe, expect, it, vi } from 'vitest'
import { playChime } from './sounds'

function makeContext() {
  const createOscillator = vi.fn(() => ({ type: '', frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }))
  const createGain = vi.fn(() => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }))
  const createBiquadFilter = vi.fn(() => ({ type: '', frequency: { value: 0 }, connect: vi.fn() }))
  const createStereoPanner = vi.fn(() => ({ pan: { value: 0 }, connect: vi.fn() }))
  const context = { currentTime: 0, destination: {}, createGain, createBiquadFilter, createOscillator, createStereoPanner } as unknown as BaseAudioContext
  return { context, createOscillator, createGain, createBiquadFilter, createStereoPanner }
}

function frequencies(createOscillator: ReturnType<typeof makeContext>['createOscillator']) {
  return createOscillator.mock.results.map((result) => (result.value as { frequency: { value: number } }).frequency.value)
}

describe('sounds', () => {
  it('plays a two-note bell with soft inharmonic partials', () => {
    const { context, createOscillator, createGain, createBiquadFilter, createStereoPanner } = makeContext()

    playChime(context, 'completion')

    const notes = frequencies(createOscillator)
    expect(notes).toContain(523.25)
    expect(notes).toContain(659.25)
    expect(notes).toHaveLength(6)
    expect(createStereoPanner).toHaveBeenCalledTimes(2)
    expect(createOscillator.mock.results.every((result) => (result.value as { type: string }).type === 'sine')).toBe(true)
    expect(createOscillator.mock.results.every((result) => (result.value as { start: ReturnType<typeof vi.fn> }).start.mock.calls.length === 1)).toBe(true)
    expect(createOscillator.mock.results.every((result) => (result.value as { stop: ReturnType<typeof vi.fn> }).stop.mock.calls.length === 1)).toBe(true)
    expect(createBiquadFilter.mock.results[0]?.value).toEqual(expect.objectContaining({ type: 'lowpass', frequency: { value: 4200 } }))

    const envelope = createGain.mock.results[0]?.value as { gain: { setValueAtTime: ReturnType<typeof vi.fn>; exponentialRampToValueAtTime: ReturnType<typeof vi.fn> } }
    expect(envelope.gain.setValueAtTime).toHaveBeenCalledWith(0.0001, 0)
    expect(envelope.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.05, 0.01)
    expect(envelope.gain.exponentialRampToValueAtTime).toHaveBeenLastCalledWith(0.0001, 1.5)
  })

  it('plays a lower descending break chime', () => {
    const { context, createOscillator, createBiquadFilter } = makeContext()

    playChime(context, 'break')

    const notes = frequencies(createOscillator)
    expect(notes).toContain(392)
    expect(notes).toContain(329.63)
    expect(createBiquadFilter.mock.results[0]?.value).toEqual(expect.objectContaining({ type: 'lowpass', frequency: { value: 3200 } }))
  })
})
