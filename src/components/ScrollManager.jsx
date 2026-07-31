import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

// How far the target has to move before it is worth re-aiming, how still the
// page has to be to count as arrived, how many such frames end the watch, and
// the hard ceiling on how long we keep watching at all.
const DRIFT_PX = 4
const STILL_PX = 1
const SETTLED_FRAMES = 10
const MAX_FRAMES = 240

export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    const behavior = reduced ? 'auto' : 'smooth'
    const target = hash ? document.getElementById(hash.slice(1)) : null

    if (!target) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    // Sections below the fold are `content-visibility: auto`, so until they
    // actually render the browser has nothing but `contain-intrinsic-size` to
    // go on and every offset past the first unrendered one is a guess — off by
    // enough to leave you a whole section short of where you asked to go.
    // Images and fonts settling shift things the same way, just less.
    //
    // So aim, then keep re-aiming. Each pass renders more of the page, which
    // makes the next measurement truer. Watching the target's position in the
    // document rather than its distance from the viewport is what keeps this
    // from fighting the smooth scroll already in flight: it only re-issues
    // when the layout moved, not on every frame of the animation.
    let frame = 0
    let aimedAt = null
    let wasAt = null
    let settled = 0
    let frames = 0
    let abandoned = false

    const align = () => {
      frame = 0
      if (abandoned) return

      const top = Math.round(target.getBoundingClientRect().top + window.scrollY)
      const y = window.scrollY
      // A smooth scroll can pass through a stretch of already-rendered page
      // without shifting anything, and a still target mid-flight is not an
      // arrival. Only a page that has stopped moving counts.
      const flying = wasAt === null || Math.abs(y - wasAt) > STILL_PX

      if (aimedAt === null || Math.abs(top - aimedAt) > DRIFT_PX) {
        aimedAt = top
        settled = 0
        target.scrollIntoView({ behavior, block: 'start' })
      } else if (flying) {
        settled = 0
      } else {
        settled += 1
      }

      wasAt = y
      frames += 1
      if (settled < SETTLED_FRAMES && frames < MAX_FRAMES) {
        frame = requestAnimationFrame(align)
      }
    }

    // Whoever grabs the page mid-flight outranks us.
    const abandon = () => {
      abandoned = true
    }
    const takeovers = ['wheel', 'touchstart', 'keydown']
    takeovers.forEach((type) => window.addEventListener(type, abandon, { passive: true }))

    align()

    return () => {
      abandoned = true
      if (frame) cancelAnimationFrame(frame)
      takeovers.forEach((type) => window.removeEventListener(type, abandon))
    }
  }, [pathname, hash, reduced])

  return null
}
