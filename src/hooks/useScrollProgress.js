import { useEffect, useRef } from 'react'
import { computeProgress } from '../lib/scrollProgress.js'

// Tracks how far the given container has scrolled through the viewport.
//
// The value is returned in a ref rather than state on purpose. Scroll fires
// many times a second, and setState here would re-render the whole hero on
// every one of those. The consumer is an animation loop that already runs each
// frame, so it can simply read the current value.
export function useScrollProgress(ref) {
  const progress = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      progress.current = computeProgress(el.getBoundingClientRect(), window.innerHeight)
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [ref])

  return progress
}
