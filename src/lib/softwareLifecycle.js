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

// A stage is never invisible. Scroll controls how complete and prominent it is,
// while the idle floor keeps the whole engineering story legible on first load.
export function stagePresence(completion, idleOpacity = 0.42) {
  const progress = clamp(completion, 0, 1)
  const floor = clamp(idleOpacity, 0, 1)
  return floor + (1 - floor) * progress
}
