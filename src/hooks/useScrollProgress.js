import { useEffect, useRef } from 'react'
import { computeAnchoredProgress, computeProgress } from '../lib/scrollProgress.js'
import { computeSceneLayout } from '../lib/softwareLifecycle.js'

// Where the drawn scene sits, as opposed to where the canvas element sits. The
// artwork is centred inside the element, so anchoring on the element's own
// bottom edge would finish the animation while a band of empty canvas still
// hangs below it.
function sceneRectOf(canvas) {
  const rect = canvas.getBoundingClientRect()
  const { offsetY, drawnHeight } = computeSceneLayout(rect.width, rect.height)

  return { top: rect.top + offsetY, bottom: rect.top + offsetY + drawnHeight }
}

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
      const sceneRect = canvas ? sceneRectOf(canvas) : stage?.getBoundingClientRect()

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
