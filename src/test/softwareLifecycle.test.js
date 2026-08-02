import { LIFECYCLE_PHASES, lerp, phaseProgress } from '../lib/softwareLifecycle.js'

test('orders requirements, architecture, and execution through the scroll', () => {
  expect(LIFECYCLE_PHASES.requirements[0]).toBeLessThan(LIFECYCLE_PHASES.architecture[0])
  expect(LIFECYCLE_PHASES.architecture[0]).toBeLessThan(LIFECYCLE_PHASES.execution[0])
})

test('clamps every lifecycle phase at both ends', () => {
  for (const phase of Object.keys(LIFECYCLE_PHASES)) {
    expect(phaseProgress(-1, phase)).toBe(0)
    expect(phaseProgress(2, phase)).toBe(1)
  }
})

test('interpolates layout positions', () => {
  expect(lerp(10, 20, 0)).toBe(10)
  expect(lerp(10, 20, 0.5)).toBe(15)
  expect(lerp(10, 20, 1)).toBe(20)
})
