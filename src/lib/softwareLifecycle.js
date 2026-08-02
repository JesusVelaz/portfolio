export const LIFECYCLE_PHASES = {
  requirements: [0, 0.34],
  architecture: [0.24, 0.7],
  execution: [0.58, 0.96],
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
