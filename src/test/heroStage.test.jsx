import { createRef } from 'react'
import { render } from '@testing-library/react'
import { HeroStage, supportsWebGL } from '../components/HeroStage.jsx'

// vitest.setup.js stubs getContext to return null, so the WebGL probe fails
// here exactly as it would on a machine without WebGL. That is the point: the
// scene is never imported during tests and needs no mocking.

test('renders without crashing when WebGL is unavailable', () => {
  const ref = createRef()
  const { container } = render(<HeroStage trackRef={ref} />)
  expect(container.firstChild).not.toBeNull()
})

test('is decoration, so it stays out of the accessibility tree', () => {
  const ref = createRef()
  const { container } = render(<HeroStage trackRef={ref} />)
  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
})

test('reports no WebGL when a context cannot be created', () => {
  // vitest.setup.js stubs getContext to return null, matching a machine without WebGL.
  expect(supportsWebGL()).toBe(false)
})

test('reports WebGL when a context is available', () => {
  const original = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = () => ({})
  try {
    expect(supportsWebGL()).toBe(true)
  } finally {
    HTMLCanvasElement.prototype.getContext = original
  }
})
