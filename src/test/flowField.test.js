import {
  FLOW_FIELD_DEFAULTS,
  cursorPush,
  flowAngle,
  particleCount,
  shouldRespawn,
  strokeTone,
  valueNoise,
} from '../lib/flowField.js'

test('resolves particle count from area rather than a flat number', () => {
  // density is "particles per 100,000 css px²", so a 100,000px² canvas gets
  // exactly the density figure.
  expect(particleCount(1000, 100, 1111)).toBe(1111)
  expect(particleCount(500, 100, 1111)).toBe(556)
})

test('keeps a floor so a small panel is never empty', () => {
  expect(particleCount(10, 10, 1111)).toBe(40)
})

test('draws strokes in pure neutral grey, never a hue', () => {
  for (const tone of [0, 0.25, 0.42, 0.8, 1]) {
    for (const dark of [true, false]) {
      const { r, g, b } = strokeTone(tone, dark)
      expect(r).toBe(g)
      expect(g).toBe(b)
    }
  }
})

test('darkens strokes on a light ground as tone rises', () => {
  expect(strokeTone(0.9, false).r).toBeLessThan(strokeTone(0.1, false).r)
})

test('lightens strokes on a dark ground as tone rises', () => {
  expect(strokeTone(0.9, true).r).toBeGreaterThan(strokeTone(0.1, true).r)
})

test('keeps strokes clear of both grounds at the default tone', () => {
  // #fafafa is 250, #09090b is 9. A stroke that lands on top of its own
  // background is invisible, which is the failure this guards.
  expect(strokeTone(FLOW_FIELD_DEFAULTS.tone, false).r).toBeLessThan(230)
  expect(strokeTone(FLOW_FIELD_DEFAULTS.tone, true).r).toBeGreaterThan(40)
})

test('produces deterministic noise', () => {
  expect(valueNoise(3.7, 11.2)).toBe(valueNoise(3.7, 11.2))
})

test('keeps noise inside the unit range', () => {
  for (let x = 0; x < 40; x += 3.3) {
    for (let y = 0; y < 40; y += 2.7) {
      const n = valueNoise(x, y)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(1)
    }
  }
})

test('varies noise across space', () => {
  const samples = new Set()
  for (let i = 0; i < 20; i += 1) samples.add(valueNoise(i * 1.7, i * 0.9).toFixed(4))
  expect(samples.size).toBeGreaterThan(5)
})

test('turns the field over time at a fixed point', () => {
  const scale = FLOW_FIELD_DEFAULTS.noiseScale
  expect(flowAngle(120, 90, 0, scale)).not.toBe(flowAngle(120, 90, 6, scale))
})

test('retires a particle once its life runs out', () => {
  expect(shouldRespawn({ x: 50, y: 50, life: 0 }, 200, 200)).toBe(true)
  expect(shouldRespawn({ x: 50, y: 50, life: 5 }, 200, 200)).toBe(false)
})

test('retires a particle that has drifted off the canvas', () => {
  expect(shouldRespawn({ x: -40, y: 50, life: 90 }, 200, 200)).toBe(true)
  expect(shouldRespawn({ x: 240, y: 50, life: 90 }, 200, 200)).toBe(true)
  expect(shouldRespawn({ x: 50, y: -40, life: 90 }, 200, 200)).toBe(true)
  expect(shouldRespawn({ x: 50, y: 240, life: 90 }, 200, 200)).toBe(true)
})

test('pushes particles directly away from the cursor', () => {
  // particle sits up and to the right of the cursor, so it should be pushed
  // further up and further right.
  const push = cursorPush(30, -20)
  expect(push.x).toBeGreaterThan(0)
  expect(push.y).toBeLessThan(0)
})

test('ignores the cursor beyond its reach', () => {
  const push = cursorPush(9000, 9000)
  expect(push.x).toBe(0)
  expect(push.y).toBe(0)
})

test('pushes harder the closer the cursor gets', () => {
  const near = cursorPush(20, 0)
  const far = cursorPush(150, 0)
  expect(near.x).toBeGreaterThan(far.x)
})
