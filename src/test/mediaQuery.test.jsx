import { renderHook, act } from '@testing-library/react'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

function mockMatchMedia(matches) {
  const listeners = new Set()
  const mql = {
    matches,
    media: '',
    addEventListener: (_, fn) => listeners.add(fn),
    removeEventListener: (_, fn) => listeners.delete(fn),
    addListener: (fn) => listeners.add(fn),
    removeListener: (fn) => listeners.delete(fn),
    dispatchEvent: () => true,
  }
  const spy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
    mql.media = query
    return mql
  })
  return {
    spy,
    change(next) {
      mql.matches = next
      listeners.forEach((fn) => fn({ matches: next }))
    },
  }
}

test('reports whether the query matches on first render', () => {
  const media = mockMatchMedia(true)
  const { result } = renderHook(() => useMediaQuery('(max-width: 900px)'))
  expect(result.current).toBe(true)
  media.spy.mockRestore()
})

test('reports false when the query does not match', () => {
  const media = mockMatchMedia(false)
  const { result } = renderHook(() => useMediaQuery('(max-width: 900px)'))
  expect(result.current).toBe(false)
  media.spy.mockRestore()
})

test('updates when the viewport crosses the breakpoint', () => {
  const media = mockMatchMedia(false)
  const { result } = renderHook(() => useMediaQuery('(max-width: 900px)'))
  expect(result.current).toBe(false)

  act(() => media.change(true))
  expect(result.current).toBe(true)

  media.spy.mockRestore()
})

test('falls back to false where matchMedia is unavailable', () => {
  const original = window.matchMedia
  // deleting rather than mocking, so the hook sees the property genuinely absent
  delete window.matchMedia
  const { result } = renderHook(() => useMediaQuery('(max-width: 900px)'))
  expect(result.current).toBe(false)
  window.matchMedia = original
})
