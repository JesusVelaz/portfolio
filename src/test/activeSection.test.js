import { act, renderHook } from '@testing-library/react'
import { useActiveSection } from '../hooks/useActiveSection.js'

const IDS = ['work', 'about', 'experience']

let observers = []

class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback
    this.targets = []
    this.disconnected = false
    observers.push(this)
  }
  observe(el) {
    this.targets.push(el)
  }
  disconnect() {
    this.disconnected = true
  }
  report(...visible) {
    act(() => {
      this.callback(
        this.targets.map((el) => ({
          target: el,
          isIntersecting: visible.includes(el.id),
          intersectionRatio: visible.includes(el.id) ? 1 - visible.indexOf(el.id) / 10 : 0,
        }))
      )
    })
  }
}

function mountSections() {
  IDS.forEach((id) => {
    const section = document.createElement('section')
    section.id = id
    document.body.append(section)
  })
}

beforeEach(() => {
  observers = []
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver)
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

test('reports the section filling most of the reading band', () => {
  mountSections()
  const { result } = renderHook(() => useActiveSection(IDS))

  observers[0].report('about')
  expect(result.current).toBe('about')
})

test('nothing visible yet means nothing is active', () => {
  mountSections()
  const { result } = renderHook(() => useActiveSection(IDS))

  expect(result.current).toBe(null)
})

// The nav outlives the route, so the first observer it builds can easily be
// one that had no sections to watch. Leaving that observer in place is what
// used to freeze the highlight on the first section forever.
test('observes the sections once they mount, not just on the first render', () => {
  const { result, rerender } = renderHook(({ enabled }) => useActiveSection(IDS, enabled), {
    initialProps: { enabled: false },
  })
  expect(observers).toHaveLength(0)

  mountSections()
  rerender({ enabled: true })

  expect(observers).toHaveLength(1)
  expect(observers[0].targets.map((el) => el.id)).toEqual(IDS)

  observers[0].report('experience')
  expect(result.current).toBe('experience')
})

test('leaving the page drops the highlight instead of holding a stale one', () => {
  mountSections()
  const { result, rerender } = renderHook(({ enabled }) => useActiveSection(IDS, enabled), {
    initialProps: { enabled: true },
  })

  observers[0].report('work')
  expect(result.current).toBe('work')

  rerender({ enabled: false })
  expect(result.current).toBe(null)
  expect(observers[0].disconnected).toBe(true)

  rerender({ enabled: true })
  expect(result.current).toBe(null)
  observers[1].report('about')
  expect(result.current).toBe('about')
})
