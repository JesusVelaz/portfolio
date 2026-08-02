import { carYaw, driftAt, roadCurvature } from '../lib/roadMotion.js'

test('points the car model down a straight road', () => {
  expect(carYaw(0, -1)).toBeCloseTo(0)
})

test('turns the car toward the same side as the road tangent', () => {
  expect(carYaw(0.5, -0.866)).toBeLessThan(0)
  expect(carYaw(-0.5, -0.866)).toBeGreaterThan(0)
})

test('adds bounded lateral slip and oversteer on bends', () => {
  for (let z = 0; z <= 260; z += 1) {
    const drift = driftAt(z)
    expect(drift.lateral).toBeGreaterThanOrEqual(-1.2)
    expect(drift.lateral).toBeLessThanOrEqual(1.2)
    expect(drift.slip).toBeGreaterThanOrEqual(-0.48)
    expect(drift.slip).toBeLessThanOrEqual(0.48)
  }

  expect(Math.abs(roadCurvature(80))).toBeGreaterThan(0)
})
