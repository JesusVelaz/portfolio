// The maths behind the hero's flow field, kept out of the component so it can
// be tested without a canvas.
//
// A "flow field" here is a smooth noise field sampled per particle to give a
// direction. Particles leave short segments each frame and the previous frame
// is faded rather than cleared, so the trails are drawn by accumulation rather
// than stored as paths. That is what keeps the whole thing to one fill and one
// stroke per frame regardless of particle count.

// Tuned on the calibration page and pinned here. Density is expressed per
// 100,000 css px² rather than as a flat count, because the panel is fluid and
// a fixed count would read as dense on a phone and sparse on a desktop.
export const FLOW_FIELD_DEFAULTS = {
  tone: 0.42,
  density: 1111,
  alpha: 0.5,
  fade: 0.055,
  lineWidth: 0.85,
  noiseScale: 0.0038,
  step: 1.15,
}

const DENSITY_UNIT = 100000
const MIN_PARTICLES = 40
const EDGE_MARGIN = 10

// Cursor repulsion. Stored squared so the common case — a particle nowhere
// near the cursor — costs a multiply and a compare rather than a square root.
const CURSOR_REACH_SQ = 26000
const CURSOR_STRENGTH = 2.4

// Stroke ramp endpoints per ground. Deliberately equal-channel greys: an
// earlier version lifted the blue channel slightly and the whole field read
// as cool rather than neutral.
const LIGHT_FROM = 226
const LIGHT_TO = 38
const DARK_FROM = 42
const DARK_TO = 242

export function particleCount(width, height, density) {
  const scaled = Math.round((density * width * height) / DENSITY_UNIT)
  return Math.max(MIN_PARTICLES, scaled)
}

// tone runs 0 → 1 as "barely there" → "strongly marked", in whichever
// direction that means for the ground it is drawn on.
export function strokeTone(tone, isDark) {
  const from = isDark ? DARK_FROM : LIGHT_FROM
  const to = isDark ? DARK_TO : LIGHT_TO
  const value = Math.round(from + (to - from) * tone)
  return { r: value, g: value, b: value }
}

export function strokeStyle(tone, isDark) {
  const { r, g, b } = strokeTone(tone, isDark)
  return `rgb(${r},${g},${b})`
}

function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return n - Math.floor(n)
}

// Value noise: hash the four surrounding lattice corners and interpolate with
// a smoothstep so the field is continuous. Cheap, and good enough for a look
// that is deliberately soft.
export function valueNoise(x, y) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)

  const a = hash2(xi, yi)
  const b = hash2(xi + 1, yi)
  const c = hash2(xi, yi + 1)
  const d = hash2(xi + 1, yi + 1)

  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v
}

// Time advances along the field's y axis rather than being a separate
// dimension, which turns the whole field slowly instead of making it shimmer.
export function flowAngle(x, y, time, scale) {
  return valueNoise(x * scale, y * scale + time * 0.12) * Math.PI * 4
}

export function shouldRespawn(particle, width, height) {
  if (particle.life <= 0) return true
  return (
    particle.x < -EDGE_MARGIN ||
    particle.x > width + EDGE_MARGIN ||
    particle.y < -EDGE_MARGIN ||
    particle.y > height + EDGE_MARGIN
  )
}

// dx, dy are the particle's offset from the cursor, so the result already
// points away from it.
export function cursorPush(dx, dy) {
  const distanceSq = dx * dx + dy * dy
  if (distanceSq >= CURSOR_REACH_SQ) return { x: 0, y: 0 }

  const falloff = (1 - distanceSq / CURSOR_REACH_SQ) * CURSOR_STRENGTH
  const inverse = 1 / (Math.sqrt(distanceSq) || 1)
  return { x: dx * inverse * falloff, y: dy * inverse * falloff }
}
