import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

export const SMOOTH_SCROLL_OPTIONS = {
  autoRaf: true,
  lerp: 0.085,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  anchors: false,
}

export function SmoothScrollProvider({ children }) {
  const reduced = useReducedMotion()

  if (reduced) return children

  return (
    <ReactLenis root options={SMOOTH_SCROLL_OPTIONS}>
      {children}
    </ReactLenis>
  )
}
