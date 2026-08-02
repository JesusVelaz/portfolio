import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { lerp, phaseProgress } from '../lib/softwareLifecycle.js'

const DESIGN_WIDTH = 720
const DESIGN_HEIGHT = 840

function readTheme() {
  const style = getComputedStyle(document.documentElement)
  const value = (name, fallback) => style.getPropertyValue(name).trim() || fallback

  return {
    background: value('--background', '#09090b'),
    foreground: value('--foreground', '#fafafa'),
    surface: value('--card', '#18181b'),
    raised: value('--card-raised', '#27272a'),
    muted: value('--muted-foreground', '#a1a1aa'),
    border: value('--border', '#27272a'),
    strong: value('--border-strong', '#3f3f46'),
  }
}

function roundedRect(context, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + r, y)
  context.lineTo(x + width - r, y)
  context.quadraticCurveTo(x + width, y, x + width, y + r)
  context.lineTo(x + width, y + height - r)
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  context.lineTo(x + r, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - r)
  context.lineTo(x, y + r)
  context.quadraticCurveTo(x, y, x + r, y)
  context.closePath()
}

function drawPanel(context, theme, x, y, width, height) {
  roundedRect(context, x, y, width, height, 18)
  context.fillStyle = theme.surface
  context.fill()
  context.strokeStyle = theme.border
  context.lineWidth = 1
  context.stroke()
}

function drawLabel(context, theme, number, label, x, y) {
  context.fillStyle = theme.muted
  context.font = "600 11px 'JetBrains Mono', monospace"
  context.letterSpacing = '1.4px'
  context.fillText(`${number}  ${label}`, x, y)
  context.letterSpacing = '0px'
}

function drawCheck(context, theme, x, y, progress) {
  context.beginPath()
  context.arc(x, y, 10, 0, Math.PI * 2)
  context.strokeStyle = theme.strong
  context.lineWidth = 1.5
  context.stroke()

  if (progress <= 0) return
  context.beginPath()
  context.moveTo(x - 4, y)
  context.lineTo(x - 1, y + 3)
  context.lineTo(x + 5, y - 4)
  context.strokeStyle = theme.foreground
  context.lineWidth = 2
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.setLineDash([18 * progress, 18])
  context.stroke()
  context.setLineDash([])
}

function drawRequirementCard(context, theme, x, y, width, title, progress) {
  context.save()
  context.globalAlpha = 0.42 + progress * 0.58
  roundedRect(context, x, y, width, 76, 12)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = theme.strong
  context.lineWidth = 1
  context.stroke()

  context.fillStyle = theme.foreground
  context.font = "600 10px 'JetBrains Mono', monospace"
  context.fillText(title, x + 18, y + 26)
  context.fillStyle = theme.muted
  roundedRect(context, x + 18, y + 39, width - 62, 4, 2)
  context.fill()
  roundedRect(context, x + 18, y + 51, width - 88, 4, 2)
  context.fill()
  drawCheck(context, theme, x + width - 24, y + 24, progress)
  context.restore()
}

function drawConnector(context, theme, fromX, fromY, toX, toY, progress, dashed = false) {
  if (progress <= 0) return
  context.save()
  context.strokeStyle = theme.strong
  context.lineWidth = 1.5
  if (dashed) context.setLineDash([5, 7])

  const middleY = (fromY + toY) / 2
  const points = [
    [fromX, fromY],
    [fromX, middleY],
    [toX, middleY],
    [toX, toY],
  ]
  const visibleSegments = progress * 3
  context.beginPath()
  context.moveTo(points[0][0], points[0][1])
  for (let index = 1; index < points.length; index += 1) {
    const segmentProgress = Math.min(1, Math.max(0, visibleSegments - (index - 1)))
    if (segmentProgress <= 0) break
    context.lineTo(
      lerp(points[index - 1][0], points[index][0], segmentProgress),
      lerp(points[index - 1][1], points[index][1], segmentProgress)
    )
    if (segmentProgress < 1) break
  }
  context.stroke()
  context.restore()
}

function drawBrowserNode(context, theme, progress) {
  context.save()
  context.globalAlpha = progress
  context.translate(165, 404)
  context.scale(0.82 + progress * 0.18, 0.82 + progress * 0.18)
  roundedRect(context, -78, -44, 156, 88, 12)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = theme.foreground
  context.lineWidth = 1.4
  context.stroke()
  context.beginPath()
  context.moveTo(-78, -19)
  context.lineTo(78, -19)
  context.strokeStyle = theme.strong
  context.stroke()
  for (let index = 0; index < 3; index += 1) {
    context.beginPath()
    context.arc(-59 + index * 13, -31, 2.5, 0, Math.PI * 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }
  context.fillStyle = theme.foreground
  context.font = "600 10px 'JetBrains Mono', monospace"
  context.fillText('CLIENT', -25, 12)
  context.restore()
}

function drawApiNode(context, theme, progress) {
  context.save()
  context.globalAlpha = progress
  context.translate(360, 404)
  context.scale(0.8 + progress * 0.2, 0.8 + progress * 0.2)
  context.beginPath()
  for (let index = 0; index < 6; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI) / 3
    const x = Math.cos(angle) * 54
    const y = Math.sin(angle) * 54
    if (index === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
  context.fillStyle = theme.foreground
  context.fill()
  context.fillStyle = theme.background
  context.font = "700 11px 'JetBrains Mono', monospace"
  context.textAlign = 'center'
  context.fillText('API', 0, 4)
  context.textAlign = 'start'
  context.restore()
}

function drawDatabaseNode(context, theme, progress) {
  context.save()
  context.globalAlpha = progress
  context.translate(555, 404)
  context.scale(0.82 + progress * 0.18, 0.82 + progress * 0.18)
  context.fillStyle = theme.raised
  context.strokeStyle = theme.foreground
  context.lineWidth = 1.4
  context.beginPath()
  context.ellipse(0, -31, 58, 18, 0, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.fillRect(-58, -31, 116, 62)
  context.beginPath()
  context.moveTo(-58, -31)
  context.lineTo(-58, 31)
  context.moveTo(58, -31)
  context.lineTo(58, 31)
  context.stroke()
  context.beginPath()
  context.ellipse(0, 31, 58, 18, 0, 0, Math.PI)
  context.stroke()
  context.fillStyle = theme.foreground
  context.font = "600 10px 'JetBrains Mono', monospace"
  context.textAlign = 'center'
  context.fillText('DATA', 0, 5)
  context.textAlign = 'start'
  context.restore()
}

function drawArchitecture(context, theme, progress, time) {
  drawConnector(context, theme, 243, 404, 306, 404, progress)
  drawConnector(context, theme, 414, 404, 497, 404, progress)
  drawBrowserNode(context, theme, progress)
  drawApiNode(context, theme, progress)
  drawDatabaseNode(context, theme, progress)

  if (progress > 0.6) {
    const flow = (time * 0.00018) % 1
    const firstX = lerp(243, 306, flow)
    const secondX = lerp(414, 497, flow)
    for (const x of [firstX, secondX]) {
      context.beginPath()
      context.arc(x, 404, 4, 0, Math.PI * 2)
      context.fillStyle = theme.foreground
      context.fill()
    }
  }
}

function drawProduct(context, theme, progress, time) {
  context.save()
  context.globalAlpha = progress
  context.translate(360, 686)
  context.scale(0.9 + progress * 0.1, 0.9 + progress * 0.1)
  roundedRect(context, -270, -84, 540, 168, 14)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = theme.foreground
  context.lineWidth = 1.3
  context.stroke()

  context.beginPath()
  context.moveTo(-270, -55)
  context.lineTo(270, -55)
  context.strokeStyle = theme.strong
  context.stroke()
  for (let index = 0; index < 3; index += 1) {
    context.beginPath()
    context.arc(-248 + index * 14, -69, 3, 0, Math.PI * 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }

  roundedRect(context, -250, -38, 92, 104, 8)
  context.fillStyle = theme.surface
  context.fill()
  for (let index = 0; index < 4; index += 1) {
    roundedRect(context, -232, -18 + index * 20, 54 - index * 4, 4, 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }

  for (let index = 0; index < 3; index += 1) {
    roundedRect(context, -138 + index * 126, -38, 108, 42, 8)
    context.fillStyle = theme.surface
    context.fill()
    roundedRect(context, -121 + index * 126, -21, 55, 5, 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }

  roundedRect(context, -138, 20, 360, 46, 8)
  context.fillStyle = theme.surface
  context.fill()
  for (let index = 0; index < 4; index += 1) {
    roundedRect(context, -120, 32 + index * 8, 265 - index * 22, 3, 1.5)
    context.fillStyle = theme.muted
    context.fill()
  }
  context.restore()

  const ready = Math.max(0, (progress - 0.72) / 0.28)
  if (ready > 0) {
    roundedRect(context, 247, 785, 226, 32, 16)
    context.fillStyle = theme.surface
    context.fill()
    context.strokeStyle = theme.strong
    context.stroke()
    context.beginPath()
    context.arc(270, 801, 5 + Math.sin(time * 0.004) * 0.7, 0, Math.PI * 2)
    context.fillStyle = theme.foreground
    context.fill()
    context.fillStyle = theme.foreground
    context.font = "600 10px 'JetBrains Mono', monospace"
    context.fillText('BUILD PASSED  ·  PRODUCT READY', 286, 805)
  }
}

export default function SoftwareLifecycleCanvas({ progressRef }) {
  const canvasRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let theme = readTheme()
    let width = 1
    let height = 1
    let frame = null
    let visible = true
    let visualProgress = reduced ? 1 : progressRef.current
    let previousTime = performance.now()

    function draw(progress, time) {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT)
      const offsetX = (width - DESIGN_WIDTH * scale) / 2
      // Top-weighted rather than vertically centered, aligning the artwork
      // with the H1 while leaving breathing room beneath the final state.
      const offsetY = Math.max(8, (height - DESIGN_HEIGHT * scale) * 0.16)
      context.save()
      context.translate(offsetX, offsetY)
      context.scale(scale, scale)

      const requirements = phaseProgress(progress, 'requirements')
      const architecture = phaseProgress(progress, 'architecture')
      const execution = phaseProgress(progress, 'execution')

      drawPanel(context, theme, 40, 36, 640, 222)
      drawLabel(context, theme, '01', 'GATHER REQUIREMENTS', 68, 70)
      const cards = [
        { title: 'USER FLOWS', start: [-150, 42], end: [68, 118] },
        { title: 'CONSTRAINTS', start: [550, -84], end: [270, 118] },
        { title: 'SUCCESS SIGNALS', start: [760, 238], end: [472, 118] },
      ]
      for (let index = 0; index < cards.length; index += 1) {
        const card = cards[index]
        const float = 1 - requirements
        const x =
          lerp(card.start[0], card.end[0], requirements) +
          Math.sin(time * 0.00055 + index * 2.2) * 11 * float
        const y =
          lerp(card.start[1], card.end[1], requirements) +
          Math.cos(time * 0.00043 + index * 1.7) * 8 * float
        drawRequirementCard(context, theme, x, y, 180, card.title, requirements)
      }

      drawConnector(context, theme, 360, 258, 360, 292, architecture, true)
      drawPanel(context, theme, 40, 292, 640, 228)
      drawLabel(context, theme, '02', 'BUILD ARCHITECTURE', 68, 326)
      drawArchitecture(context, theme, architecture, time)

      drawConnector(context, theme, 360, 520, 360, 566, execution, true)
      drawPanel(context, theme, 40, 566, 640, 262)
      drawLabel(context, theme, '03', 'EXECUTE THE PRODUCT', 68, 600)
      drawProduct(context, theme, execution, time)

      context.restore()
    }

    function resize() {
      const rect = canvas.getBoundingClientRect()
      const parent = canvas.parentNode instanceof Element ? canvas.parentNode.getBoundingClientRect() : null
      width = Math.round(rect.width || parent?.width || window.innerWidth)
      height = Math.round(rect.height || parent?.height || window.innerHeight)
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      draw(reduced ? 1 : visualProgress, performance.now())
    }

    function loop(time) {
      if (!visible || document.hidden) return
      const elapsed = Math.min(0.1, Math.max(0, (time - previousTime) / 1000))
      previousTime = time
      visualProgress += (progressRef.current - visualProgress) * (1 - Math.exp(-elapsed * 10))
      draw(visualProgress, time)
      frame = requestAnimationFrame(loop)
    }

    function restart() {
      if (frame) cancelAnimationFrame(frame)
      frame = null
      previousTime = performance.now()
      if (visible && !document.hidden && !reduced) frame = requestAnimationFrame(loop)
    }

    resize()
    const retry = requestAnimationFrame(resize)
    if (reduced) draw(1, 9000)
    else frame = requestAnimationFrame(loop)

    const intersectionObserver =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            restart()
          })
    intersectionObserver?.observe(canvas)

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    resizeObserver?.observe(canvas)

    const themeObserver =
      typeof MutationObserver === 'undefined'
        ? null
        : new MutationObserver(() => {
            theme = readTheme()
            draw(reduced ? 1 : visualProgress, reduced ? 9000 : performance.now())
          })
    themeObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    document.addEventListener('visibilitychange', restart)
    window.addEventListener('resize', resize)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      cancelAnimationFrame(retry)
      intersectionObserver?.disconnect()
      resizeObserver?.disconnect()
      themeObserver?.disconnect()
      document.removeEventListener('visibilitychange', restart)
      window.removeEventListener('resize', resize)
    }
  }, [progressRef, reduced])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
}
