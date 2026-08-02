import { createRef } from 'react'
import { render } from '@testing-library/react'
import { HeroStage } from '../components/HeroStage.jsx'

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

test('shows the placeholder rather than the scene when WebGL is unavailable', () => {
  const ref = createRef()
  const { container } = render(<HeroStage trackRef={ref} />)
  expect(container.querySelector('canvas')).toBeNull()
})
