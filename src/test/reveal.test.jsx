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
