import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Starfield.module.css'

export function Starfield() {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let ctx = null
    try {
      ctx = canvas.getContext('2d')
    } catch {
      return
    }
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let frame = null
    let visible = true
    let lastDraw = 0
    const points = Array.from({ length: 14 }, (_, index) => ({
      angle: (Math.PI * 2 * index) / 14,
      orbit: 0.22 + (index % 4) * 0.075,
      speed: 0.00006 + (index % 3) * 0.000018,
      size: index % 5 === 0 ? 3.5 : 2.2,
    }))

    // The canvas cannot use CSS variables directly, so it reads them once per
    // theme change and paints with the resolved values.
    let colors = readColors()

    function readColors() {
      const root = getComputedStyle(document.documentElement)
      return {
        node: root.getPropertyValue('--foreground').trim() || '#fafafa',
      }
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height)
      const cx = width * 0.5
      const cy = height * 0.48
      const radius = Math.min(width, height)
      const positions = points.map((point) => {
        const angle = point.angle + (reduced ? 0 : time * point.speed)
        return {
          ...point,
          x: cx + Math.cos(angle) * radius * point.orbit,
          y: cy + Math.sin(angle) * radius * point.orbit * 0.72,
        }
      })

      ctx.lineWidth = 1
      ctx.strokeStyle = colors.node
      for (let i = 0; i < positions.length; i += 1) {
        for (let j = i + 1; j < positions.length; j += 1) {
          const a = positions[i]
          const b = positions[j]
          const distance = Math.hypot(a.x - b.x, a.y - b.y)
          if (distance < radius * 0.29) {
            ctx.globalAlpha = 0.2 * (1 - distance / (radius * 0.29))
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // With the accent gone there is no second hue to tell the sizes apart,
      // so weight does it instead.
      ctx.fillStyle = colors.node
      for (const point of positions) {
        ctx.globalAlpha = point.size > 3 ? 0.85 : 0.45
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(cx, cy, 7, 0, Math.PI * 2)
      ctx.fill()
    }

    function loop(time) {
      if (!visible || document.hidden || reduced) return
      if (time - lastDraw > 32) {
        draw(time)
        lastDraw = time
      }
      frame = requestAnimationFrame(loop)
    }

    function onVisibilityChange() {
      if (frame) cancelAnimationFrame(frame)
      if (!document.hidden && visible && !reduced) {
        frame = requestAnimationFrame(loop)
      }
    }

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (frame) cancelAnimationFrame(frame)
            if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(loop)
          })

    // The theme swaps the root's data attribute; the canvas has to be told.
    const themeObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            colors = readColors()
            draw(performance.now())
          })
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    resize()
    if (!reduced) {
      frame = requestAnimationFrame(loop)
    }

    if (observer && wrapRef.current) observer.observe(wrapRef.current)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer?.disconnect()
      themeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.label}>
        <span>Systems thinking</span>
        <span>Accessible by default</span>
      </div>
    </div>
  )
}
