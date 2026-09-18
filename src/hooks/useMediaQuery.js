import { useEffect, useState } from 'react'

function read(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

// Same shape as useReducedMotion, but for an arbitrary query. Used to keep work
// off viewports where it would not earn its cost, rather than to hide something
// with CSS after it has already been built and started.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => read(query))

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)

    // Re-read on subscribe: the viewport can change between the first render
    // and this effect running.
    setMatches(mql.matches)

    const onChange = (event) => setMatches(event.matches)
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [query])

  return matches
}
