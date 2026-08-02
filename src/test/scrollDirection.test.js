import { act, renderHook } from '@testing-library/react'
import { useScrollDirection } from '../hooks/useScrollDirection.js'

function scrollTo(y) {
  window.scrollY = y
  act(() => {
    window.dispatchEvent(new Event('scroll'))
    // The hook batches reads into a frame, so let one run.
    vi.advanceTimersByTime(32)
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  window.scrollY = 0
})

afterEach(() => {
  vi.useRealTimers()
})

test('reports up until the page has scrolled past the offset', () => {
  const { result } = renderHook(() => useScrollDirection({ offset: 120 }))
  scrollTo(80)
  expect(result.current).toBe('up')
})

test('flips to down once scrolling downward past the offset', () => {
  const { result } = renderHook(() => useScrollDirection({ offset: 120 }))
  scrollTo(200)
  scrollTo(400)
  expect(result.current).toBe('down')
})

test('comes back up as soon as the page scrolls upward', () => {
  const { result } = renderHook(() => useScrollDirection({ offset: 120 }))
  scrollTo(200)
  scrollTo(400)
  scrollTo(300)
  expect(result.current).toBe('up')
})

test('ignores jitter smaller than the threshold', () => {
  const { result } = renderHook(() => useScrollDirection({ offset: 120, threshold: 8 }))
  scrollTo(200)
  scrollTo(400)
  scrollTo(396)
  expect(result.current).toBe('down')
})

test('returning to the top always reads as up', () => {
  const { result } = renderHook(() => useScrollDirection({ offset: 120 }))
  scrollTo(200)
  scrollTo(400)
  scrollTo(0)
  expect(result.current).toBe('up')
})
