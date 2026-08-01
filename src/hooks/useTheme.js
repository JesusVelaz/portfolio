import { useCallback, useEffect, useSyncExternalStore } from 'react'

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

// External store backed by the DOM attribute, observed via MutationObserver
function createThemeStore() {
  function subscribe(callback) {
    // Attach MutationObserver to watch for data-theme changes on documentElement
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          callback()
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })

    // Return unsubscribe function
    return () => {
      observer.disconnect()
    }
  }

  function getSnapshot() {
    return currentTheme()
  }

  function getServerSnapshot() {
    // On the server, return 'dark' as default
    return 'dark'
  }

  return { subscribe, getSnapshot, getServerSnapshot }
}

const store = createThemeStore()

export function useTheme() {
  const theme = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  const setTheme = useCallback((next) => {
    apply(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Private-browsing modes throw. The theme still applies for this session.
    }
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
    }
    query.addEventListener?.('change', onChange)
    return () => query.removeEventListener?.('change', onChange)
  }, [])

  return { theme, setTheme, toggle }
}
