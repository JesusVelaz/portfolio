export const LIFECYCLE_PHASES = {
  requirements: [0, 0.34],
  architecture: [0.26, 0.74],
  execution: [0.62, 1],
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function phaseProgress(progress, phase) {
  const [start, end] = LIFECYCLE_PHASES[phase]
  const local = clamp((progress - start) / (end - start), 0, 1)
  return local * local * (3 - 2 * local)
}

export function lerp(from, to, progress) {
  return from + (to - from) * progress
}

// The scene is drawn into a fixed design box and letterboxed into whatever
// space the stage gives it. Two callers need the resulting geometry: the
// renderer, to place the artwork, and the scroll anchor, to know where the
// artwork actually ends — which is not where the canvas element ends, because
// the centring leaves slack below it.
export const DESIGN_WIDTH = 720
export const DESIGN_HEIGHT = 840

export function computeSceneLayout(width, height) {
  const scale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT)
  const drawnHeight = DESIGN_HEIGHT * scale

  return {
    scale,
    drawnHeight,
    offsetX: (width - DESIGN_WIDTH * scale) / 2,
    offsetY: Math.max(0, (height - drawnHeight) / 2),
  }
}

// A stage is never invisible. Scroll controls how complete and prominent it is,
// while the idle floor keeps the whole engineering story legible on first load.
export function stagePresence(completion, idleOpacity = 0.42) {
  const progress = clamp(completion, 0, 1)
  const floor = clamp(idleOpacity, 0, 1)
  return floor + (1 - floor) * progress
}
