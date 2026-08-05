import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import {
  computeSceneLayout,
  lerp,
  phaseProgress,
  stagePresence,
} from '../lib/softwareLifecycle.js'

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value))
}

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

function cutCornerRect(context, x, y, width, height, cut = 12) {
  context.beginPath()
  context.moveTo(x + 10, y)
  context.lineTo(x + width - cut, y)
  context.lineTo(x + width, y + cut)
  context.lineTo(x + width, y + height - 10)
  context.quadraticCurveTo(x + width, y + height, x + width - 10, y + height)
  context.lineTo(x + 10, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - 10)
  context.lineTo(x, y + 10)
  context.quadraticCurveTo(x, y, x + 10, y)
  context.closePath()
}

function drawGrid(context, theme) {
  context.save()
  context.strokeStyle = theme.strong
  context.fillStyle = theme.strong
  context.globalAlpha = 0.11
  context.lineWidth = 1

  for (let x = 40; x <= 680; x += 40) {
    context.beginPath()
    context.moveTo(x, 76)
    context.lineTo(x, 816)
    context.stroke()
  }
  for (let y = 96; y <= 816; y += 40) {
    context.beginPath()
    context.moveTo(24, y)
    context.lineTo(696, y)
    context.stroke()
  }
  context.restore()
}

function drawWorkspace(context, theme, progress) {
  context.save()
  roundedRect(context, 24, 20, 672, 800, 22)
  context.fillStyle = theme.background
  context.globalAlpha = 0.72
  context.fill()
  context.globalAlpha = 1
  context.strokeStyle = theme.border
  context.lineWidth = 1
  context.stroke()

  context.beginPath()
  context.moveTo(24, 74)
  context.lineTo(696, 74)
  context.strokeStyle = theme.border
  context.stroke()

  for (let index = 0; index < 3; index += 1) {
    context.beginPath()
    context.arc(50 + index * 14, 47, 3, 0, Math.PI * 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.strong
    context.fill()
  }

  context.fillStyle = theme.foreground
  context.font = "600 10px 'JetBrains Mono', monospace"
  context.fillText('PRODUCT ENGINEERING / SYSTEM MAP', 112, 51)
  context.fillStyle = theme.muted
  context.textAlign = 'right'
  context.fillText(`${String(Math.round(progress * 100)).padStart(2, '0')}% / SCROLL TO BUILD`, 670, 51)
  context.textAlign = 'start'
  context.restore()
}

function drawStageLabel(context, theme, number, title, subtitle, x, y, completion) {
  context.save()
  context.fillStyle = theme.foreground
  context.font = "700 10px 'JetBrains Mono', monospace"
  context.fillText(number, x, y)
  context.fillStyle = theme.foreground
  context.font = "600 11px 'JetBrains Mono', monospace"
  context.fillText(title, x + 34, y)
  context.fillStyle = theme.muted
  context.font = "500 8px 'JetBrains Mono', monospace"
  context.fillText(subtitle, x + 34, y + 15)

  context.beginPath()
  context.moveTo(x, y + 23)
  context.lineTo(x + 208, y + 23)
  context.strokeStyle = theme.border
  context.stroke()
  context.beginPath()
  context.moveTo(x, y + 23)
  context.lineTo(x + 208 * completion, y + 23)
  context.strokeStyle = theme.foreground
  context.lineWidth = 1.5
  context.stroke()
  context.restore()
}

function drawCheck(context, theme, x, y, progress) {
  context.save()
  context.beginPath()
  context.arc(x, y, 8, 0, Math.PI * 2)
  context.strokeStyle = progress > 0.15 ? theme.foreground : theme.strong
  context.lineWidth = 1
  context.stroke()
  if (progress > 0) {
    context.beginPath()
    context.moveTo(x - 3.5, y)
    context.lineTo(x - 1, y + 2.5)
    context.lineTo(x + 4, y - 3.5)
    context.strokeStyle = theme.foreground
    context.lineWidth = 1.6
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.setLineDash([15 * progress, 15])
    context.stroke()
  }
  context.restore()
}

function drawRequirementCard(context, theme, card, x, y, progress, presence) {
  context.save()
  context.globalAlpha = presence
  cutCornerRect(context, x, y, 176, 72)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = progress > 0.8 ? theme.foreground : theme.strong
  context.lineWidth = 1
  context.stroke()

  context.fillStyle = theme.muted
  context.font = "600 8px 'JetBrains Mono', monospace"
  context.fillText(card.kind, x + 14, y + 19)
  context.fillStyle = theme.foreground
  context.font = "600 10px 'JetBrains Mono', monospace"
  context.fillText(card.title, x + 14, y + 39)
  context.fillStyle = theme.muted
  context.font = "500 8px 'JetBrains Mono', monospace"
  context.fillText(card.meta, x + 14, y + 57)
  drawCheck(context, theme, x + 153, y + 49, progress)
  context.restore()
}

function tracePolyline(context, points, progress) {
  const visibleSegments = clamp(progress) * (points.length - 1)
  context.beginPath()
  context.moveTo(points[0][0], points[0][1])
  for (let index = 1; index < points.length; index += 1) {
    const segmentProgress = clamp(visibleSegments - (index - 1))
    if (segmentProgress <= 0) break
    context.lineTo(
      lerp(points[index - 1][0], points[index][0], segmentProgress),
      lerp(points[index - 1][1], points[index][1], segmentProgress)
    )
    if (segmentProgress < 1) break
  }
}

function drawWire(context, theme, points, progress, dashed = false) {
  context.save()
  context.lineWidth = 1
  context.strokeStyle = theme.strong
  context.globalAlpha = 0.45
  if (dashed) context.setLineDash([4, 6])
  tracePolyline(context, points, 1)
  context.stroke()

  if (progress > 0) {
    context.globalAlpha = 1
    context.strokeStyle = theme.foreground
    context.lineWidth = 1.5
    context.setLineDash([])
    tracePolyline(context, points, progress)
    context.stroke()
  }
  context.restore()
}

function polygon(context, x, y, radius, sides, rotation = -Math.PI / 2) {
  context.beginPath()
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (index * Math.PI * 2) / sides
    const px = x + Math.cos(angle) * radius
    const py = y + Math.sin(angle) * radius
    if (index === 0) context.moveTo(px, py)
    else context.lineTo(px, py)
  }
  context.closePath()
}

function drawSpecCore(context, theme, progress, time) {
  context.save()
  const pulse = 1 + Math.sin(time * 0.0025) * 0.025 * (1 - progress)
  context.translate(360, 268)
  context.scale(pulse, pulse)
  polygon(context, 0, 0, 28, 6)
  context.fillStyle = theme.surface
  context.fill()
  context.strokeStyle = progress > 0.65 ? theme.foreground : theme.strong
  context.lineWidth = 1.4
  context.stroke()
  context.beginPath()
  context.arc(0, 0, 19, 0, Math.PI * 2)
  context.strokeStyle = theme.border
  context.stroke()
  context.fillStyle = theme.foreground
  context.font = "700 9px 'JetBrains Mono', monospace"
  context.textAlign = 'center'
  context.fillText('SPEC', 0, -1)
  context.fillStyle = theme.muted
  context.font = "500 6px 'JetBrains Mono', monospace"
  context.fillText(progress > 0.82 ? 'LOCKED' : 'DRAFT', 0, 10)
  context.textAlign = 'start'
  context.restore()
}

function drawRequirements(context, theme, progress, time) {
  drawStageLabel(
    context,
    theme,
    '01',
    'GATHER REQUIREMENTS',
    'NEEDS / CONSTRAINTS / SUCCESS SIGNALS',
    50,
    101,
    progress
  )

  const cards = [
    {
      kind: 'USER NEED',
      title: 'Fast team handoffs',
      meta: 'FLOW / CORE',
      start: [42, 164],
      end: [50, 140],
    },
    {
      kind: 'CONSTRAINT',
      title: 'Role-based access',
      meta: 'RULE / REQUIRED',
      start: [270, 128],
      end: [272, 140],
    },
    {
      kind: 'SUCCESS',
      title: '< 2 min workflow',
      meta: 'METRIC / P95',
      start: [500, 170],
      end: [494, 140],
    },
  ]
  const presence = stagePresence(progress, 0.8)

  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index]
    const unsettled = 1 - progress
    const x =
      lerp(card.start[0], card.end[0], progress) +
      Math.sin(time * 0.00055 + index * 2.1) * 5 * unsettled
    const y =
      lerp(card.start[1], card.end[1], progress) +
      Math.cos(time * 0.00046 + index * 1.8) * 4 * unsettled
    const cardProgress = clamp(progress * 3 - index * 0.72)
    drawRequirementCard(context, theme, card, x, y, cardProgress, presence)

    const centerX = x + 88
    const bottomY = y + 72
    drawWire(
      context,
      theme,
      [
        [centerX, bottomY],
        [centerX, 232],
        [360, 232],
        [360, 240],
      ],
      clamp(progress * 1.35 - index * 0.1),
      true
    )
  }
  drawSpecCore(context, theme, progress, time)
}

function drawBrowserNode(context, theme, x, y, presence, active) {
  context.save()
  context.globalAlpha = presence
  roundedRect(context, x, y, 136, 82, 10)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = active > 0.75 ? theme.foreground : theme.strong
  context.stroke()
  context.beginPath()
  context.moveTo(x, y + 22)
  context.lineTo(x + 136, y + 22)
  context.strokeStyle = theme.strong
  context.stroke()
  for (let index = 0; index < 3; index += 1) {
    context.beginPath()
    context.arc(x + 14 + index * 11, y + 11, 2.2, 0, Math.PI * 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }
  roundedRect(context, x + 12, y + 34, 34, 35, 4)
  context.fillStyle = theme.surface
  context.fill()
  for (let index = 0; index < 3; index += 1) {
    roundedRect(context, x + 56, y + 36 + index * 12, 58 - index * 8, 4, 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }
  context.fillStyle = theme.muted
  context.font = "600 7px 'JetBrains Mono', monospace"
  context.fillText('CLIENT', x + 8, y + 96)
  context.restore()
}

function drawApiNode(context, theme, x, y, presence, active, time) {
  context.save()
  context.globalAlpha = presence
  const rotation = active * 0.18 + Math.sin(time * 0.001) * 0.015
  context.translate(x, y)
  context.rotate(rotation)
  polygon(context, 0, 0, 48, 8)
  context.fillStyle = theme.surface
  context.fill()
  context.strokeStyle = active > 0.7 ? theme.foreground : theme.strong
  context.lineWidth = 1.4
  context.stroke()
  context.rotate(-rotation)
  context.beginPath()
  context.arc(0, 0, 29, 0, Math.PI * 2)
  context.strokeStyle = theme.border
  context.stroke()
  context.fillStyle = theme.foreground
  context.font = "700 10px 'JetBrains Mono', monospace"
  context.textAlign = 'center'
  context.fillText('API', 0, -2)
  context.fillStyle = theme.muted
  context.font = "500 6px 'JetBrains Mono', monospace"
  context.fillText('/v1/workflows', 0, 11)
  context.textAlign = 'start'
  context.restore()
}

function drawDatabaseNode(context, theme, x, y, presence, active) {
  context.save()
  context.globalAlpha = presence
  context.fillStyle = theme.raised
  context.strokeStyle = active > 0.75 ? theme.foreground : theme.strong
  context.lineWidth = 1.2
  context.beginPath()
  context.ellipse(x, y - 25, 55, 15, 0, 0, Math.PI * 2)
  context.fill()
  context.stroke()
  context.fillRect(x - 55, y - 25, 110, 52)
  context.beginPath()
  context.moveTo(x - 55, y - 25)
  context.lineTo(x - 55, y + 27)
  context.moveTo(x + 55, y - 25)
  context.lineTo(x + 55, y + 27)
  context.stroke()
  context.beginPath()
  context.ellipse(x, y + 27, 55, 15, 0, 0, Math.PI)
  context.stroke()
  context.beginPath()
  context.ellipse(x, y + 2, 55, 13, 0, 0, Math.PI)
  context.strokeStyle = theme.border
  context.stroke()
  context.fillStyle = theme.foreground
  context.font = "600 8px 'JetBrains Mono', monospace"
  context.textAlign = 'center'
  context.fillText('DATABASE', x, y + 5)
  context.textAlign = 'start'
  context.fillStyle = theme.muted
  context.font = "600 7px 'JetBrains Mono', monospace"
  context.fillText('DATA', x - 55, y + 57)
  context.restore()
}

function drawWorkerNode(context, theme, x, y, presence, active) {
  context.save()
  context.globalAlpha = presence
  cutCornerRect(context, x, y, 136, 44, 10)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = active > 0.8 ? theme.foreground : theme.strong
  context.stroke()
  context.beginPath()
  context.arc(x + 20, y + 22, 7, 0, Math.PI * 2)
  context.strokeStyle = theme.foreground
  context.stroke()
  context.beginPath()
  context.moveTo(x + 17, y + 22)
  context.lineTo(x + 23, y + 22)
  context.moveTo(x + 20, y + 19)
  context.lineTo(x + 20, y + 25)
  context.stroke()
  context.fillStyle = theme.foreground
  context.font = "600 8px 'JetBrains Mono', monospace"
  context.fillText('EVENT WORKER', x + 37, y + 19)
  context.fillStyle = theme.muted
  context.font = "500 6px 'JetBrains Mono', monospace"
  context.fillText('QUEUE / ASYNC', x + 37, y + 31)
  context.restore()
}

function drawPacket(context, theme, fromX, toX, y, time, offset) {
  const progress = (time * 0.00022 + offset) % 1
  context.beginPath()
  context.arc(lerp(fromX, toX, progress), y, 3.5, 0, Math.PI * 2)
  context.fillStyle = theme.foreground
  context.fill()
}

function drawArchitecture(context, theme, progress, time) {
  drawStageLabel(
    context,
    theme,
    '02',
    'BUILD ARCHITECTURE',
    'CLIENT / API / DATA / EVENTS',
    50,
    321,
    progress
  )

  const presence = stagePresence(progress, 0.55)
  const vertical = clamp(progress * 1.2)
  drawWire(context, theme, [[360, 296], [360, 363]], vertical, true)
  drawWire(context, theme, [[210, 421], [312, 421]], progress)
  drawWire(context, theme, [[408, 421], [517, 421]], progress)
  drawWire(context, theme, [[360, 469], [360, 497]], progress, true)

  drawBrowserNode(context, theme, 74, 380, presence, progress)
  drawApiNode(context, theme, 360, 421, presence, progress, time)
  drawDatabaseNode(context, theme, 572, 421, presence, progress)
  drawWorkerNode(context, theme, 292, 497, presence, progress)

  context.save()
  context.globalAlpha = presence
  context.fillStyle = theme.surface
  context.strokeStyle = theme.strong
  const tags = [
    ['AUTH', 248, 382],
    ['CACHE', 425, 455],
    ['QUEUE', 476, 501],
  ]
  for (const [label, x, y] of tags) {
    roundedRect(context, x, y, 54, 20, 10)
    context.fill()
    context.stroke()
    context.fillStyle = theme.muted
    context.font = "600 6px 'JetBrains Mono', monospace"
    context.textAlign = 'center'
    context.fillText(label, x + 27, y + 13)
    context.fillStyle = theme.surface
  }
  context.textAlign = 'start'
  context.restore()

  if (progress > 0.2) {
    context.save()
    context.globalAlpha = clamp((progress - 0.2) / 0.35)
    drawPacket(context, theme, 210, 312, 421, time, 0)
    drawPacket(context, theme, 408, 517, 421, time, 0.5)
    context.restore()
  }
}

function drawProductWindow(context, theme, progress, presence) {
  const x = 50
  const y = 631
  const width = 418
  const height = 157

  context.save()
  context.globalAlpha = presence
  roundedRect(context, x, y, width, height, 12)
  context.fillStyle = theme.raised
  context.fill()
  context.strokeStyle = progress > 0.75 ? theme.foreground : theme.strong
  context.stroke()
  context.beginPath()
  context.moveTo(x, y + 25)
  context.lineTo(x + width, y + 25)
  context.strokeStyle = theme.strong
  context.stroke()
  for (let index = 0; index < 3; index += 1) {
    context.beginPath()
    context.arc(x + 14 + index * 11, y + 12.5, 2.2, 0, Math.PI * 2)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }
  context.fillStyle = theme.muted
  context.font = "600 7px 'JetBrains Mono', monospace"
  context.textAlign = 'right'
  context.fillText('WORKFLOW / PRODUCTION', x + width - 12, y + 15)
  context.textAlign = 'start'

  roundedRect(context, x + 12, y + 37, 82, 106, 7)
  context.fillStyle = theme.surface
  context.fill()
  context.fillStyle = theme.foreground
  context.font = "700 7px 'JetBrains Mono', monospace"
  context.fillText('PRODUCT', x + 24, y + 55)
  for (let index = 0; index < 4; index += 1) {
    roundedRect(context, x + 24, y + 70 + index * 17, 48 - index * 4, 3, 1.5)
    context.fillStyle = index === 0 ? theme.foreground : theme.muted
    context.fill()
  }

  const cards = [
    ['ACTIVE', '1,284'],
    ['SUCCESS', '98.7%'],
    ['LATENCY', '1.4m'],
  ]
  for (let index = 0; index < cards.length; index += 1) {
    const cardX = x + 106 + index * 98
    roundedRect(context, cardX, y + 37, 88, 44, 7)
    context.fillStyle = theme.surface
    context.fill()
    context.fillStyle = theme.muted
    context.font = "600 6px 'JetBrains Mono', monospace"
    context.fillText(cards[index][0], cardX + 10, y + 52)
    context.fillStyle = theme.foreground
    context.font = "700 11px 'JetBrains Mono', monospace"
    context.fillText(cards[index][1], cardX + 10, y + 70)
  }

  roundedRect(context, x + 106, y + 91, 284, 52, 7)
  context.fillStyle = theme.surface
  context.fill()
  context.beginPath()
  const chartProgress = Math.max(0.18, progress)
  const chartPoints = [
    [x + 118, y + 130],
    [x + 158, y + 119],
    [x + 198, y + 124],
    [x + 238, y + 104],
    [x + 278, y + 113],
    [x + 326, y + 98],
    [x + 378, y + 106],
  ]
  const segments = chartProgress * (chartPoints.length - 1)
  context.moveTo(chartPoints[0][0], chartPoints[0][1])
  for (let index = 1; index < chartPoints.length; index += 1) {
    const local = clamp(segments - (index - 1))
    if (local <= 0) break
    context.lineTo(
      lerp(chartPoints[index - 1][0], chartPoints[index][0], local),
      lerp(chartPoints[index - 1][1], chartPoints[index][1], local)
    )
    if (local < 1) break
  }
  context.strokeStyle = theme.foreground
  context.lineWidth = 1.5
  context.stroke()
  context.restore()
}

function drawBuildConsole(context, theme, progress, presence, time) {
  const x = 486
  const y = 631
  const width = 184

  context.save()
  context.globalAlpha = presence
  cutCornerRect(context, x, y, width, 112, 12)
  context.fillStyle = theme.surface
  context.fill()
  context.strokeStyle = progress > 0.75 ? theme.foreground : theme.strong
  context.stroke()
  context.fillStyle = theme.foreground
  context.font = "600 8px 'JetBrains Mono', monospace"
  context.fillText('$ npm run build', x + 13, y + 21)

  const rows = ['typecheck', 'tests', 'bundle']
  for (let index = 0; index < rows.length; index += 1) {
    const rowProgress = clamp(progress * 3.2 - index * 0.7)
    const rowY = y + 46 + index * 19
    context.fillStyle = theme.muted
    context.font = "500 7px 'JetBrains Mono', monospace"
    context.fillText(rows[index], x + 13, rowY)
    context.textAlign = 'right'
    context.fillStyle = rowProgress > 0.92 ? theme.foreground : theme.muted
    context.fillText(rowProgress > 0.92 ? 'PASS' : rowProgress > 0.1 ? 'RUN' : 'WAIT', x + width - 13, rowY)
    context.textAlign = 'start'
  }
  context.restore()

  context.save()
  context.globalAlpha = presence
  roundedRect(context, x, 756, width, 32, 16)
  context.fillStyle = progress > 0.92 ? theme.foreground : theme.surface
  context.fill()
  context.strokeStyle = progress > 0.92 ? theme.foreground : theme.strong
  context.stroke()
  context.beginPath()
  context.arc(x + 18, 772, 4 + Math.sin(time * 0.004) * (progress > 0.9 ? 0.5 : 0), 0, Math.PI * 2)
  context.fillStyle = progress > 0.92 ? theme.background : theme.foreground
  context.fill()
  context.fillStyle = progress > 0.92 ? theme.background : theme.foreground
  context.font = "700 7px 'JetBrains Mono', monospace"
  context.fillText(progress > 0.92 ? 'PRODUCT READY' : progress > 0.2 ? 'BUILD IN PROGRESS' : 'READY TO BUILD', x + 31, 775)
  context.restore()
}

function drawExecution(context, theme, progress, time) {
  drawStageLabel(
    context,
    theme,
    '03',
    'EXECUTE THE PRODUCT',
    'BUILD / TEST / SHIP / LEARN',
    50,
    581,
    progress
  )
  const presence = stagePresence(progress, 0.5)
  drawWire(context, theme, [[360, 541], [360, 611]], clamp(progress * 1.2), true)
  drawProductWindow(context, theme, progress, presence)
  drawBuildConsole(context, theme, progress, presence, time)
}

function drawFlowMarker(context, theme, progress) {
  const y = lerp(91, 802, progress)
  context.save()
  context.beginPath()
  context.moveTo(682, 91)
  context.lineTo(682, 802)
  context.strokeStyle = theme.border
  context.lineWidth = 1
  context.stroke()
  context.beginPath()
  context.arc(682, y, 4, 0, Math.PI * 2)
  context.fillStyle = theme.foreground
  context.fill()
  context.restore()
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

      const { scale, offsetX, offsetY } = computeSceneLayout(width, height)
      context.save()
      context.translate(offsetX, offsetY)
      context.scale(scale, scale)

      const requirements = phaseProgress(progress, 'requirements')
      const architecture = phaseProgress(progress, 'architecture')
      const execution = phaseProgress(progress, 'execution')

      drawWorkspace(context, theme, progress)
      drawGrid(context, theme)
      drawRequirements(context, theme, requirements, time)
      drawArchitecture(context, theme, architecture, time)
      drawExecution(context, theme, execution, time)
      drawFlowMarker(context, theme, progress)
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
