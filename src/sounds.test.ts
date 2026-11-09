import { describe, expect, it, vi } from 'vitest'
import { playChime } from './sounds'

describe('sounds', () => {
  it('plays a warm lowpass chime with a soft envelope', () => {
    const createBiquadFilter = vi.fn(() => ({ type: 'lowpass', frequency: { value: 2800 }, connect: vi.fn() }))
    const createOscillator = vi.fn(() => ({ type: 'triangle', frequency: { value: 523.25 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }))
    const createGain = vi.fn(() => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }))
    const context = { currentTime: 0, destination: {}, createGain, createBiquadFilter, createOscillator } as unknown as BaseAudioContext

    playChime(context, 'completion')

    expect(createGain).toHaveBeenCalled()
    expect(createBiquadFilter).toHaveBeenCalled()
    expect(createBiquadFilter.mock.results[0]?.value).toEqual(expect.objectContaining({ type: 'lowpass', frequency: { value: 2800 } }))
    expect(createOscillator).toHaveBeenCalled()
  })

  it('plays a break chime with a different base frequency', () => {
    const createBiquadFilter = vi.fn(() => ({ type: 'lowpass', frequency: { value: 2800 }, connect: vi.fn() }))
    const createOscillator = vi.fn(() => ({ type: 'triangle', frequency: { value: 392 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }))
    const createGain = vi.fn(() => ({ gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() }))
    const context = { currentTime: 0, destination: {}, createGain, createBiquadFilter, createOscillator } as unknown as BaseAudioContext

    playChime(context, 'break')

    expect(createOscillator).toHaveBeenCalled()
    expect(createBiquadFilter.mock.results[0]?.value).toEqual(expect.objectContaining({ type: 'lowpass' }))
    expect((createOscillator.mock.results[0]?.value as { frequency: { value: number } }).frequency.value).toBe(392)
  })
})
