export const ROAD_LENGTH = 96

const ROAD_AMPLITUDE = 9.2
const ROAD_FREQUENCY = (Math.PI * 5) / ROAD_LENGTH
const CAR_END_MARGIN = 3.2

export function roadX(z) {
  // Five half-waves create the six alternating positions in the supplied
  // sketch: right, left, right, left, right, left.
  return Math.cos(z * ROAD_FREQUENCY) * ROAD_AMPLITUDE
}

function roadSlope(z) {
  return -Math.sin(z * ROAD_FREQUENCY) * ROAD_AMPLITUDE * ROAD_FREQUENCY
}

// Signed curvature of x(z). Keeping this analytic avoids sampling noise in the
// drift and makes the car settle cleanly as a bend straightens out.
export function roadCurvature(z) {
  const slope = roadSlope(z)
  const secondDerivative =
    -Math.cos(z * ROAD_FREQUENCY) * ROAD_AMPLITUDE * ROAD_FREQUENCY ** 2

  return -secondDerivative / (1 + slope ** 2) ** 1.5
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function roadZAtProgress(progress) {
  const normalized = clamp(progress, 0, 1)
  return CAR_END_MARGIN + normalized * (ROAD_LENGTH - CAR_END_MARGIN * 2)
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
