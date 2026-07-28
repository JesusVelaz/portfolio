import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Starfield.module.css'

const LAYERS = [
  { density: 0.00009, size: 0.7, speed: 0.02, alpha: 0.45 },
  { density: 0.00005, size: 1.1, speed: 0.06, alpha: 0.70 },
  { density: 0.00002, size: 1.7, speed: 0.12, alpha: 0.95 },
]

export function Starfield() {
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

    let stars = []
    let width = 0
    let height = 0
    let frame = 0
    let running = true

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = canvas.clientWidth || window.innerWidth
      height = canvas.clientHeight || window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      stars = []
      for (const layer of LAYERS) {
        const count = Math.round(width * height * layer.density)
        for (let i = 0; i < count; i += 1) {
          stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: layer.size * (0.6 + Math.random() * 0.8),
            a: layer.alpha * (0.4 + Math.random() * 0.6),
            speed: layer.speed,
          })
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#CFE0FF'
      const scroll = window.scrollY || 0
      for (const s of stars) {
        let y = (s.y - scroll * s.speed) % height
        if (y < 0) y += height
        ctx.globalAlpha = s.a
        ctx.beginPath()
        ctx.arc(s.x, y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function loop() {
      if (!running) return
      draw()
      frame = requestAnimationFrame(loop)
    }

    function onResize() {
      build()
      draw()
    }

    function onVisibilityChange() {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(frame)
      } else if (!reduced) {
        running = true
        loop()
      }
    }

    build()
    if (reduced) {
      draw()
    } else {
      loop()
    }

    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [reduced])

  return (
    <div className={styles.wrap} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={`${styles.aurora} ${styles.auroraA}`} />
      <div className={`${styles.aurora} ${styles.auroraB}`} />
    </div>
  )
}
