import { storageKey } from './storage'

export type ThemeChoice = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const resolveTheme = (choice: ThemeChoice, systemDark: boolean): ResolvedTheme =>
  choice === 'system' ? (systemDark ? 'dark' : 'light') : choice

export function applyTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151513' : '#F2F0E9')
}

// Applied before React mounts so a dark window never flashes paper on launch.
export function applyStoredTheme() {
  let choice: ThemeChoice = 'system'
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as { settings?: { theme?: unknown } }
    if (saved.settings?.theme === 'light' || saved.settings?.theme === 'dark') choice = saved.settings.theme
  } catch { /* Unreadable storage falls back to the system theme. */ }
  const systemDark = typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(resolveTheme(choice, systemDark))
}
