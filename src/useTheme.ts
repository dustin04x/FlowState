import { useEffect, useState } from 'react'
import { applyTheme, resolveTheme, type ResolvedTheme, type ThemeChoice } from './theme'

export function useTheme(choice: ThemeChoice): ResolvedTheme {
  const [systemDark, setSystemDark] = useState(
    () => typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemDark(query.matches)
    onChange()
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  const theme = resolveTheme(choice, systemDark)
  useEffect(() => { applyTheme(theme) }, [theme])
  return theme
}
