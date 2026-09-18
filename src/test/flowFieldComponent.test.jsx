import { render } from '@testing-library/react'
import { FlowField } from '../components/FlowField.jsx'

test('renders a canvas', () => {
  const { container } = render(<FlowField />)
  expect(container.querySelector('canvas')).not.toBeNull()
})

test('is decoration, so it stays out of the accessibility tree', () => {
  const { container } = render(<FlowField />)
  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
})

test('renders without a 2d context rather than throwing', () => {
  // vitest.setup.js makes getContext return null, which is what a real browser
  // does when canvas is unavailable. The hero must still render.
  expect(() => render(<FlowField />)).not.toThrow()
})

// Minimal stand-in for the 2d context. The suite returns null from getContext
// by default, which makes the component bail before it starts a loop — so a
// cleanup assertion needs a canvas that actually works.
function stubContext() {
  const calls = []
  const context = {
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    calls,
    fillRect() {
      calls.push({ op: 'fillRect', composite: context.globalCompositeOperation })
    },
    clearRect() {
      calls.push({ op: 'clearRect', composite: context.globalCompositeOperation })
    },
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {
      calls.push({ op: 'stroke', composite: context.globalCompositeOperation })
    },
    setTransform() {},
  }
  return context
}

// jsdom reports every element as 0x0, and the component skips sizing a canvas
// with no box. Give it a real one so the drawing path actually runs.
function stubSize(width, height) {
  return vi
    .spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect')
    .mockReturnValue({ width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0 })
}

// FlowField asks matchMedia two separate questions — reduced motion, and
// whether the viewport is too small to be worth running on — so the mock has to
// answer per query instead of returning one blanket value.
function mockMedia({ reduced = false, compact = false } = {}) {
  return vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: /prefers-reduced-motion/.test(query) ? reduced : compact,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

test('renders nothing on a compact viewport', () => {
  // Not hidden with CSS — never built at all, so there is no canvas, no
  // animation loop and no observers running on a phone.
  const media = mockMedia({ compact: true })
  const { container } = render(<FlowField />)

  expect(container.querySelector('canvas')).toBeNull()
  expect(container).toBeEmptyDOMElement()

  media.mockRestore()
})

test('renders the field once there is room for it', () => {
  const media = mockMedia({ compact: false })
  const { container } = render(<FlowField />)

  expect(container.querySelector('canvas')).not.toBeNull()

  media.mockRestore()
})

test('starts no animation loop on a compact viewport', () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(stubContext())
  const rect = stubSize(400, 500)
  const media = mockMedia({ compact: true })
  const raf = vi.spyOn(window, 'requestAnimationFrame')

  render(<FlowField />)

  expect(raf).not.toHaveBeenCalled()

  raf.mockRestore()
  media.mockRestore()
  rect.mockRestore()
  getContext.mockRestore()
})

test('still paints a frame under reduced motion, rather than leaving a blank panel', () => {
  const context = stubContext()
  const stroke = vi.spyOn(context, 'stroke')
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context)
  const rect = stubSize(400, 500)
  const media = mockMedia({ reduced: true })
  const raf = vi.spyOn(window, 'requestAnimationFrame')

  render(<FlowField />)

  // Reduce motion, not content: the still image is drawn, but no loop starts.
  expect(stroke).toHaveBeenCalled()
  expect(raf).not.toHaveBeenCalled()

  raf.mockRestore()
  media.mockRestore()
  rect.mockRestore()
  getContext.mockRestore()
})

test('runs an animation loop when motion is allowed', () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(stubContext())
  const rect = stubSize(400, 500)
  const media = mockMedia({ reduced: false })
  const raf = vi.spyOn(window, 'requestAnimationFrame')

  render(<FlowField />)

  expect(raf).toHaveBeenCalled()

  raf.mockRestore()
  media.mockRestore()
  rect.mockRestore()
  getContext.mockRestore()
})

test('fades by erasing alpha, never by painting a colour over the canvas', () => {
  // Regression: the fade used to paint --background over the canvas at low
  // alpha. Re-quantising the same colour every frame let the channels settle at
  // different 8-bit floors, so #09090b drifted to rgb(9,9,27) — a navy cast.
  // The ground now comes from CSS and the canvas only ever removes alpha.
  const context = stubContext()
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(context)
  const rect = stubSize(400, 500)
  const media = mockMedia({ reduced: true })

  render(<FlowField />)

  const rectFills = context.calls.filter((call) => call.op === 'fillRect')
  expect(rectFills.length).toBeGreaterThan(0)
  for (const fill of rectFills) {
    expect(fill.composite).toBe('destination-out')
  }

  // and the strokes themselves must still draw normally
  expect(context.calls.some((call) => call.op === 'stroke' && call.composite === 'source-over')).toBe(true)

  media.mockRestore()
  rect.mockRestore()
  getContext.mockRestore()
})

test('stops its animation frame on unmount', () => {
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, 'getContext')
    .mockReturnValue(stubContext())
  const cancel = vi.spyOn(window, 'cancelAnimationFrame')

  const { unmount } = render(<FlowField />)
  unmount()

  expect(cancel).toHaveBeenCalled()

  cancel.mockRestore()
  getContext.mockRestore()
})
