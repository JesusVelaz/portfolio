const PRIMARY_AMPLITUDE = 8.5
const PRIMARY_FREQUENCY = 0.075
const SECONDARY_AMPLITUDE = 4.2
const SECONDARY_FREQUENCY = 0.026

export function roadX(z) {
  return (
    Math.sin(z * PRIMARY_FREQUENCY) * PRIMARY_AMPLITUDE +
    Math.sin(z * SECONDARY_FREQUENCY) * SECONDARY_AMPLITUDE
  )
}

function roadSlope(z) {
  return (
    Math.cos(z * PRIMARY_FREQUENCY) * PRIMARY_AMPLITUDE * PRIMARY_FREQUENCY +
    Math.cos(z * SECONDARY_FREQUENCY) * SECONDARY_AMPLITUDE * SECONDARY_FREQUENCY
  )
}

// Signed curvature of x(z). Keeping this analytic avoids sampling noise in the
// drift and makes the car settle cleanly as a bend straightens out.
export function roadCurvature(z) {
  const slope = roadSlope(z)
  const secondDerivative =
    -Math.sin(z * PRIMARY_FREQUENCY) * PRIMARY_AMPLITUDE * PRIMARY_FREQUENCY ** 2 -
    Math.sin(z * SECONDARY_FREQUENCY) * SECONDARY_AMPLITUDE * SECONDARY_FREQUENCY ** 2

  return -secondDerivative / (1 + slope ** 2) ** 1.5
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

// A drift is two related motions: the chassis slips sideways and its nose
// oversteers relative to the direction of travel. Both follow curvature, so
// the car naturally straightens between corners.
export function driftAt(z) {
  const curvature = roadCurvature(z)
  return {
    curvature,
    lateral: clamp(curvature * 24, -1.2, 1.2),
    slip: clamp(curvature * 10, -0.48, 0.48),
  }
}

// The car model's nose faces local -Z. This sign is easy to invert: using the
// usual +Z heading makes it point backward and steer away from every bend.
export function carYaw(tangentX, tangentZ, slip = 0) {
  return Math.atan2(-tangentX, -tangentZ) + slip
}
