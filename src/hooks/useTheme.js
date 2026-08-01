import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

function storedChoice() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function apply(theme) {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setThemeState] = useState(currentTheme)

  const setTheme = useCallback((next) => {
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-browsing modes throw. The theme still applies for this session.
    }
    setThemeState(next)
  }, [])

  const toggle = useCallback(() => {
    setTheme(currentTheme() === 'dark' ? 'light' : 'dark')
  }, [setTheme])

  // The system preference only speaks until the visitor makes a choice of their
  // own. After that it would be overriding a deliberate decision.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (event) => {
      if (storedChoice()) return
      const next = event.matches ? 'dark' : 'light'
      apply(next)
      setThemeState(next)
    }
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  return { theme, setTheme, toggle }
}
