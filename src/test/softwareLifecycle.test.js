import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  LIFECYCLE_PHASES,
  computeSceneLayout,
  lerp,
  phaseProgress,
  stagePresence,
} from '../lib/softwareLifecycle.js'

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

test('keeps unfinished stages visible before scrolling begins', () => {
  expect(stagePresence(0)).toBe(0.42)
  expect(stagePresence(0, 0.68)).toBe(0.68)
  expect(stagePresence(1)).toBe(1)
})

test('centres the scene in whatever space the stage gives it', () => {
  // Taller than the design box, so the slack splits evenly above and below.
  const layout = computeSceneLayout(DESIGN_WIDTH, DESIGN_HEIGHT + 200)

  expect(layout.scale).toBe(1)
  expect(layout.offsetY).toBe(100)
  expect(layout.drawnHeight).toBe(DESIGN_HEIGHT)
})

test('reports the drawn height, not the box height, so the anchor can use it', () => {
  const height = DESIGN_HEIGHT + 200
  const layout = computeSceneLayout(DESIGN_WIDTH / 2, height)

  // Width-constrained: the artwork is shorter than its box, and the gap below
  // it is what the scroll anchor has to discount.
  expect(layout.drawnHeight).toBeLessThan(height)
  expect(layout.offsetY + layout.drawnHeight + layout.offsetY).toBeCloseTo(height)
})

test('only completes execution at the final scroll anchor', () => {
  expect(phaseProgress(0.99, 'execution')).toBeLessThan(1)
  expect(phaseProgress(1, 'execution')).toBe(1)
})
