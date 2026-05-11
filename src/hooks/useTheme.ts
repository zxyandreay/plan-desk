import { useEffect } from 'react'
import type { ThemePreference } from '../types/models'

function resolveTheme(theme: ThemePreference) {
  if (theme !== 'system') {
    return theme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(theme: ThemePreference) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const applyTheme = () => {
      const resolvedTheme = resolveTheme(theme)
      const root = document.documentElement

      root.dataset.theme = resolvedTheme
      root.dataset.themePreference = theme
      root.classList.toggle('dark', resolvedTheme === 'dark')
      root.style.colorScheme = resolvedTheme
    }

    applyTheme()

    if (theme !== 'system') {
      return undefined
    }

    media.addEventListener('change', applyTheme)
    return () => media.removeEventListener('change', applyTheme)
  }, [theme])
}
