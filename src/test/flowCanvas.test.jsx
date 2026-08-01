import { render } from '@testing-library/react'
import { FlowCanvas } from '../components/FlowCanvas.jsx'

test('renders a decorative canvas hidden from assistive technology', () => {
  const { container } = render(<FlowCanvas />)
  const canvas = container.querySelector('canvas')
  expect(canvas).not.toBeNull()
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
})

test('does not throw when the 2d context is unavailable', () => {
  expect(() => render(<FlowCanvas />)).not.toThrow()
})
