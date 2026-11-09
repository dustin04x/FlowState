import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const entryPath = fileURLToPath(new URL('./index.html', import.meta.url))
const site = existsSync(entryPath) ? readFileSync(entryPath, 'utf8') : ''

describe('FlowState website', () => {
  it('has a static HTML entry point', () => {
    expect(existsSync(entryPath)).toBe(true)
  })

  it('uses the title-case brand and explains its local-first behavior', () => {
    expect(site).toContain('<title>FlowState')
    expect(site).toMatch(/no account/i)
    expect(site).toMatch(/stay on your device/i)
  })

  it('links to every published platform download without changing asset URLs', () => {
    const downloads = [
      'FLOWSTATE-1.0.0-arm64.dmg',
      'FLOWSTATE-1.0.0-x64.dmg',
      'FLOWSTATE-1.0.0-amd64.deb',
      'FLOWSTATE-1.0.0-x86_64.AppImage',
    ]

    for (const asset of downloads) {
      expect(site).toContain(`https://github.com/dustin04x/FlowState/releases/download/v1.0.0/${asset}`)
    }

    expect(site).toContain('https://github.com/dustin04x/FlowState/releases/download/v1.0.1/FlowState-1.0.0-x64.exe')
  })

  it('discloses the unsigned and unnotarized desktop packages', () => {
    expect(site).toContain('unsigned')
    expect(site).toContain('not notarized')
  })

  it('gives actual app screenshots descriptive alternative text', () => {
    expect(site).toMatch(/src="\.\/assets\/focus-idle\.png" alt="[^"]+"/)
    expect(site).toMatch(/src="\.\/assets\/break-mode\.png" alt="[^"]+"/)
    expect(site).toMatch(/src="\.\/assets\/statistics\.png" alt="[^"]+"/)
  })
})
