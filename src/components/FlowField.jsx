import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import {
  FLOW_FIELD_DEFAULTS,
  cursorPush,
  flowAngle,
  particleCount,
  shouldRespawn,
  strokeStyle,
} from '../lib/flowField.js'
import styles from './FlowField.module.css'

// Ambient canvas beside the hero copy. Replaces the scroll-scrubbed lifecycle
// canvas: this one is fixed in place and animates on its own, so the hero is
// no longer tied to how far the page has been scrolled.
//
// Nothing here is React state. Every value the loop touches lives in a ref, so
// the hero subtree never re-renders while the field is running.

// Frames to run before the first paint. Trails are drawn by accumulation, so a
// cold canvas is an empty one — without this the panel fades up from nothing
// each time it is scrolled to.
const WARMUP_FRAMES = 110

// Below this the hero is a single column and the field would stack under the
// copy as a band rather than sitting beside it — which is the whole point of it.
// Matches .layout's own collapse point in Hero.module.css.
const TOO_NARROW = '(max-width: 900px)'

function isDarkTheme() {
  return document.documentElement.dataset.theme === 'dark'
}

export function FlowField({ settings }) {
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()
  const tooNarrow = useMediaQuery(TOO_NARROW)

  useEffect(() => {
    // Nothing is mounted on a narrow viewport, so there is nothing to set up.
    if (tooNarrow) return

    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return

    const context = canvas.getContext('2d')
    // Real browsers return null when a context cannot be created, and jsdom
    // always does. Render the empty canvas rather than throwing the hero away.
    if (!context) return

    const config = { ...FLOW_FIELD_DEFAULTS, ...settings }
    const state = {
      width: 0,
      height: 0,
      time: 0,
      particles: [],
      isDark: isDarkTheme(),
      pointer: { x: -9999, y: -9999, targetX: -9999, targetY: -9999 },
    }

    let frame = 0

    function seed() {
      const count = particleCount(state.width, state.height, config.density)
      state.particles = Array.from({ length: count }, () => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        life: Math.random() * 260,
      }))

      // The canvas holds only the trails. Its ground is painted by CSS from
      // --background, so start from nothing.
      context.globalAlpha = 1
      context.globalCompositeOperation = 'source-over'
      context.clearRect(0, 0, state.width, state.height)
    }

    function respawn(particle) {
      particle.x = Math.random() * state.width
      particle.y = Math.random() * state.height
      particle.life = 130 + Math.random() * 230
    }

    function step() {
      // Fade the previous frame instead of clearing it — that is what draws the
      // trails, and why the whole field costs one fill and one stroke.
      //
      // The fade erases alpha rather than painting the background over itself.
      // Painting a translucent ground onto its own output re-quantises every
      // channel each frame, and because the 8-bit rounding floor depends on the
      // channel's own value, the three channels settle at different levels —
      // #09090b drifted to rgb(9,9,27), a visible navy cast. Removing alpha
      // touches no colour at all, so the CSS ground behind shows through exactly
      // as authored and the trails can never tint.
      context.globalCompositeOperation = 'destination-out'
      context.globalAlpha = config.fade
      context.fillStyle = '#000'
      context.fillRect(0, 0, state.width, state.height)

      context.globalCompositeOperation = 'source-over'
      context.globalAlpha = config.alpha
      context.strokeStyle = strokeStyle(config.tone, state.isDark)
      context.lineWidth = config.lineWidth
      context.beginPath()

      const { pointer } = state
      const tracking = pointer.x > -9000

      for (const particle of state.particles) {
        const angle = flowAngle(particle.x, particle.y, state.time, config.noiseScale)
        let vx = Math.cos(angle)
        let vy = Math.sin(angle)

        if (tracking) {
          const push = cursorPush(particle.x - pointer.x, particle.y - pointer.y)
          vx += push.x
          vy += push.y
        }

        context.moveTo(particle.x, particle.y)
        particle.x += vx * config.step
        particle.y += vy * config.step
        context.lineTo(particle.x, particle.y)

        particle.life -= 1
        if (shouldRespawn(particle, state.width, state.height)) respawn(particle)
      }

      context.stroke()
      context.globalAlpha = 1
    }

    function warm(frames) {
      seed()
      for (let i = 0; i < frames; i += 1) {
        state.time += 0.016
        step()
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      // Cap at 2 — beyond that the extra pixels cost more than they show.
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      state.width = rect.width
      state.height = rect.height
      canvas.width = Math.round(rect.width * ratio)
      canvas.height = Math.round(rect.height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      warm(WARMUP_FRAMES)
    }

    function loop() {
      state.time += 0.016

      const { pointer } = state
      if (pointer.targetX < -9000) {
        pointer.x = -9999
        pointer.y = -9999
      } else {
        if (pointer.x < -9000) {
          pointer.x = pointer.targetX
          pointer.y = pointer.targetY
        }
        pointer.x += (pointer.targetX - pointer.x) * 0.16
        pointer.y += (pointer.targetY - pointer.y) * 0.16
      }

      step()
      frame = requestAnimationFrame(loop)
    }

    function onPointerMove(event) {
      const rect = canvas.getBoundingClientRect()
      state.pointer.targetX = event.clientX - rect.left
      state.pointer.targetY = event.clientY - rect.top
    }

    function onPointerLeave() {
      state.pointer.targetX = -9999
      state.pointer.targetY = -9999
    }

    // The theme toggle rewrites data-theme on <html>. Re-read the ground and
    // rebuild, or the accumulated trails keep the old background colour.
    const themeObserver = new MutationObserver(() => {
      state.isDark = isDarkTheme()
      warm(WARMUP_FRAMES)
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerleave', onPointerLeave)

    resize()

    // Reduced motion keeps the image and drops the movement: one developed
    // still frame rather than a blank panel.
    if (!reduced) frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [reduced, settings, tooNarrow])

  // Not hidden with CSS — a hidden canvas still holds an animation frame open
  // and still costs battery. On a phone the field is never built at all.
  if (tooNarrow) return null

  return (
    <div ref={hostRef} className={styles.field} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
