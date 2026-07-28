import { render, screen } from '@testing-library/react'
import { Reveal } from '../components/Reveal.jsx'

// Framer Motion reads prefers-reduced-motion via the legacy addListener API, so this
// double must implement both the modern and legacy MediaQueryList surfaces.
function setReducedMotion(on) {
  window.matchMedia = (query) => ({
    matches: on && query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

afterEach(() => {
  setReducedMotion(false)
})

test('renders its children', () => {
  setReducedMotion(false)
  render(<Reveal>hello</Reveal>)
  expect(screen.getByText('hello')).toBeInTheDocument()
})

test('content is fully visible immediately when reduced motion is requested', () => {
  setReducedMotion(true)
  render(<Reveal>visible now</Reveal>)
  const el = screen.getByText('visible now')
  expect(el).toBeVisible()
  expect(el.style.opacity).not.toBe('0')
})

test('renders as the requested element', () => {
  setReducedMotion(true)
  render(<Reveal as="section">a section</Reveal>)
  expect(screen.getByText('a section').tagName).toBe('SECTION')
})

// Reveal wraps every section on the page, so its animation runs over very large areas.
// `filter` cannot be animated on the compositor — animating it re-rasterizes the element's
// whole area on the main thread every frame, which made scrolling crawl. Only `opacity` and
// `transform` are compositor-friendly, so the animation must stay within those two.
test('animates only compositor-friendly properties', () => {
  setReducedMotion(false)
  render(<Reveal>animated</Reveal>)
  const el = screen.getByText('animated')

  expect(el.style.filter).toBe('')
  expect(el.getAttribute('style') ?? '').not.toMatch(/blur|filter/)
})
