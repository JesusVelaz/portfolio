import {
  ROAD_LENGTH,
  carYaw,
  driftAt,
  roadCurvature,
  roadX,
  roadZAtProgress,
} from '../lib/roadMotion.js'

test('points the car model down a straight road', () => {
  expect(carYaw(0, -1)).toBeCloseTo(0)
})

test('turns the car toward the same side as the road tangent', () => {
  expect(carYaw(0.5, -0.866)).toBeLessThan(0)
  expect(carYaw(-0.5, -0.866)).toBeGreaterThan(0)
})

test('adds bounded lateral slip and oversteer on bends', () => {
  for (let z = 0; z <= ROAD_LENGTH; z += 1) {
    const drift = driftAt(z)
    expect(drift.lateral).toBeGreaterThanOrEqual(-1.2)
    expect(drift.lateral).toBeLessThanOrEqual(1.2)
    expect(drift.slip).toBeGreaterThanOrEqual(-0.48)
    expect(drift.slip).toBeLessThanOrEqual(0.48)
  }

  expect(Math.abs(roadCurvature(80))).toBeGreaterThan(0)
})

test('keeps one six-position road while progress moves the car top to bottom', () => {
  const positions = Array.from({ length: 6 }, (_, index) => roadX((ROAD_LENGTH / 5) * index))

  expect(positions.map(Math.sign)).toEqual([1, -1, 1, -1, 1, -1])
  expect(roadZAtProgress(0)).toBeLessThan(roadZAtProgress(1))
  expect(roadZAtProgress(-1)).toBe(roadZAtProgress(0))
  expect(roadZAtProgress(2)).toBe(roadZAtProgress(1))
})
