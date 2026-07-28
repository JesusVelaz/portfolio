import { mostVisible } from '../lib/mostVisible.js'

const entry = (id, isIntersecting, intersectionRatio) => ({
  target: { id },
  isIntersecting,
  intersectionRatio,
})

test('returns the intersecting entry with the largest ratio', () => {
  const result = mostVisible([
    entry('work', true, 0.2),
    entry('about', true, 0.8),
    entry('contact', true, 0.5),
  ])
  expect(result).toBe('about')
})

test('ignores entries that are not intersecting', () => {
  const result = mostVisible([entry('work', false, 0.9), entry('about', true, 0.3)])
  expect(result).toBe('about')
})

test('returns null when nothing is intersecting', () => {
  expect(mostVisible([entry('work', false, 0)])).toBeNull()
})

test('returns null for an empty list', () => {
  expect(mostVisible([])).toBeNull()
})
