import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

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
