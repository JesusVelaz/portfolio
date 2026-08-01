import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './FlowCanvas.module.css'

const LANES = [
  {
    y: 0.23,
    speed: 24,
    direction: -1,
    items: ['PRODUCT THINKING', 'WORKFLOW DESIGN', 'ACCESSIBLE UI', 'REACT', 'SVELTEKIT'],
  },
  {
    y: 0.45,
    speed: 17,
    direction: 1,
    items: ['REST APIs', 'AUTHORIZATION', 'CONVEX', 'POSTGRESQL', 'MULTI-TENANT'],
  },
  {
    y: 0.67,
    speed: 29,
    direction: -1,
    items: ['SHIP', 'MEASURE', 'IMPROVE', 'AUTOMATE', 'OPERATE'],
  },
  {
    y: 0.84,
    speed: 20,
    direction: 1,
    items: ['CLEAR INTERFACES', 'SOUND DATA', 'TRUSTED SYSTEMS'],
  },
]

function roundedRect(ctx, x, y, width, height, radius) {
  const right = x + width
  const bottom = y + height
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(right - radius, y)
  ctx.quadraticCurveTo(right, y, right, y + radius)
  ctx.lineTo(right, bottom - radius)
  ctx.quadraticCurveTo(right, bottom, right - radius, bottom)
  ctx.lineTo(x + radius, bottom)
  ctx.quadraticCurveTo(x, bottom, x, bottom - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor
}

export function FlowCanvas() {
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
    let colors = readColors()

    function readColors() {
      const root = getComputedStyle(document.documentElement)
      return {
        foreground: root.getPropertyValue('--foreground').trim() || '#fafafa',
        background: root.getPropertyValue('--background').trim() || '#09090b',
        card: root.getPropertyValue('--card').trim() || '#18181b',
        border: root.getPropertyValue('--border-strong').trim() || '#3f3f46',
        muted: root.getPropertyValue('--muted-foreground').trim() || '#a1a1aa',
      }
    }

    function drawLane(lane, laneIndex, time) {
      const y = height * lane.y
      const tokenHeight = Math.max(30, Math.min(36, height * 0.068))
      const gap = 18
      const fontSize = Math.max(9, Math.min(11, width * 0.016))

      ctx.font = '600 ' + fontSize + 'px "JetBrains Mono", ui-monospace, monospace'
      ctx.textBaseline = 'middle'

      const tokens = lane.items.map((label) => ({
        label,
        width: Math.ceil(ctx.measureText(label).width) + 32,
      }))
      const cycle = tokens.reduce((sum, token) => sum + token.width + gap, 0)
      const elapsed = reduced ? 0 : time / 1000
      const phase = positiveModulo(elapsed * lane.speed * lane.direction, cycle)

      ctx.globalAlpha = 0.45
      ctx.strokeStyle = colors.border
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()

      let cursor = -cycle + phase
      let repeat = 0
      while (cursor < width + cycle) {
        tokens.forEach((token, tokenIndex) => {
          const x = cursor
          const top = y - tokenHeight / 2
          const emphasized = (tokenIndex + laneIndex + repeat) % 5 === 0

          roundedRect(ctx, x, top, token.width, tokenHeight, tokenHeight / 2)
          ctx.globalAlpha = emphasized ? 0.94 : 0.88
          ctx.fillStyle = emphasized ? colors.foreground : colors.card
          ctx.fill()
          ctx.globalAlpha = 0.8
          ctx.strokeStyle = emphasized ? colors.foreground : colors.border
          ctx.stroke()

          ctx.globalAlpha = emphasized ? 1 : 0.88
          ctx.fillStyle = emphasized ? colors.background : colors.muted
          ctx.fillText(token.label, x + 16, y + 0.5)
          cursor += token.width + gap
        })
        repeat += 1
      }

      if (!reduced) {
        for (let index = 0; index < 4; index += 1) {
          const distance = width + 80
          const travel = positiveModulo(
            elapsed * lane.speed * (1.7 + index * 0.08) + index * distance * 0.27,
            distance
          )
          const x = lane.direction < 0 ? width + 40 - travel : travel - 40
          ctx.globalAlpha = 0.7 - index * 0.1
          ctx.fillStyle = colors.foreground
          ctx.beginPath()
          ctx.arc(x, y, index === 0 ? 3.2 : 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height)
      LANES.forEach((lane, index) => drawLane(lane, index, time))
      ctx.globalAlpha = 1
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth || 1
      height = canvas.clientHeight || 1
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw(performance.now())
    }

    function loop(time) {
      if (!visible || document.hidden || reduced) return
      if (time - lastDraw > 32) {
        draw(time)
        lastDraw = time
      }
      frame = requestAnimationFrame(loop)
    }

    function restart() {
      if (frame) cancelAnimationFrame(frame)
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(loop)
    }

    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            restart()
          })

    const themeObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            colors = readColors()
            draw(performance.now())
          })

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => resize())

    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    if (wrapRef.current) {
      intersectionObserver?.observe(wrapRef.current)
      resizeObserver?.observe(wrapRef.current)
    }

    resize()
    restart()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', restart)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      intersectionObserver?.disconnect()
      themeObserver?.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', restart)
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <div className={styles.topline} aria-hidden="true">
        <span>Product systems / continuous loop</span>
        <span className={styles.status}>Live canvas</span>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <p className={styles.statement}>
        <strong>Design the interface.</strong>
        <span>Engineer the system underneath.</span>
      </p>
      <p className={styles.footer} aria-hidden="true">
        Understand → build → validate → improve
      </p>
    </div>
  )
}
