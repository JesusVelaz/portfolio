import '@testing-library/jest-dom/vitest'
import { configure } from '@testing-library/react'
import { vi } from 'vitest'

// findBy* defaults to a 1s ceiling. These are correctness assertions ("does this route render
// this heading"), not speed assertions, and the suite runs 13 files in parallel — so a busy
// machine could fail a passing test. A higher ceiling costs nothing on success and still fails
// promptly when the behaviour is genuinely broken.
configure({ asyncUtilTimeout: 5000 })

if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.IntersectionObserver = MockIntersectionObserver
global.IntersectionObserver = MockIntersectionObserver

window.scrollTo = vi.fn()

// jsdom has no canvas implementation and logs a noisy "Not implemented" error for every
// getContext call. Returning null is what a real browser does when a context is
// unavailable, and it is the path Starfield already guards against.
HTMLCanvasElement.prototype.getContext = () => null
