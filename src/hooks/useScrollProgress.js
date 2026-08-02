import { useEffect, useRef } from 'react'
import { computeAnchoredProgress, computeProgress } from '../lib/scrollProgress.js'

// Tracks how far the given container has scrolled through the viewport.
//
// The value is returned in a ref rather than state on purpose. Scroll fires
// many times a second, and setState here would re-render the whole hero on
// every one of those. The consumer is an animation loop that already runs each
// frame, so it can simply read the current value.
export function useScrollProgress(ref, { completionRef, stageRef } = {}) {
  const progress = useRef(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const measure = () => {
      const trackRect = el.getBoundingClientRect()
      const completion = completionRef?.current
      const stage = stageRef?.current
      const canvas = stage?.querySelector('canvas')
      const sceneRect = canvas?.getBoundingClientRect() ?? stage?.getBoundingClientRect()

      progress.current =
        window.innerWidth > 900 && completion && sceneRect
          ? computeAnchoredProgress(
              trackRect,
              completion.getBoundingClientRect(),
              sceneRect
            )
          : computeProgress(trackRect, window.innerHeight)
    }

    measure()
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure)

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [completionRef, ref, stageRef])

  return progress
}
