import { computeAnchoredProgress, computeProgress } from '../lib/scrollProgress.js'

const VIEWPORT = 1000

test('is 0 before the container reaches the top of the viewport', () => {
  expect(computeProgress({ top: 400, height: 3000 }, VIEWPORT)).toBe(0)
})

test('is 0 exactly when the container top meets the viewport top', () => {
  expect(computeProgress({ top: 0, height: 3000 }, VIEWPORT)).toBe(0)
})

test('is 1 when the container bottom meets the viewport bottom', () => {
  // height 3000, viewport 1000 -> travel of 2000, so top: -2000 is the end.
  expect(computeProgress({ top: -2000, height: 3000 }, VIEWPORT)).toBe(1)
})

test('is 0.5 halfway through the travel', () => {
  expect(computeProgress({ top: -1000, height: 3000 }, VIEWPORT)).toBe(0.5)
})

test('clamps past the end rather than exceeding 1', () => {
  expect(computeProgress({ top: -9000, height: 3000 }, VIEWPORT)).toBe(1)
})

// A container shorter than the viewport can never scroll through it, so the
// travel-based formula would divide by a negative. It falls back to tracking
// the container across the screen instead.
test('still advances smoothly when the container is shorter than the viewport', () => {
  const early = computeProgress({ top: 900, height: 400 }, VIEWPORT)
  const mid = computeProgress({ top: 300, height: 400 }, VIEWPORT)
  const late = computeProgress({ top: -300, height: 400 }, VIEWPORT)

  expect(early).toBeLessThan(mid)
  expect(mid).toBeLessThan(late)
  expect(early).toBeGreaterThanOrEqual(0)
  expect(late).toBeLessThanOrEqual(1)
})

test('never returns NaN when the viewport has no height', () => {
  expect(Number.isNaN(computeProgress({ top: 0, height: 0 }, 0))).toBe(false)
})

test('finishes when the final capability reaches the bottom of the sticky canvas', () => {
  const stage = { top: 96, bottom: 876 }
  const startTrack = { top: 96 }
  const completionAtStart = { top: 1696 }
  const travel = 820

  expect(computeAnchoredProgress(startTrack, completionAtStart, stage)).toBe(0)
  expect(
    computeAnchoredProgress(
      { top: startTrack.top - travel / 2 },
      { top: completionAtStart.top - travel / 2 },
      stage
    )
  ).toBe(0.5)
  expect(
    computeAnchoredProgress(
      { top: startTrack.top - travel },
      { top: stage.bottom },
      stage
    )
  ).toBe(1)
})
