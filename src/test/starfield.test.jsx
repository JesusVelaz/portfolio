import { render } from '@testing-library/react'
import { Starfield } from '../components/Starfield.jsx'

test('renders a canvas hidden from assistive technology', () => {
  const { container } = render(<Starfield />)
  const canvas = container.querySelector('canvas')
  expect(canvas).not.toBeNull()
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
})

test('does not throw when the 2d context is unavailable', () => {
  expect(() => render(<Starfield />)).not.toThrow()
})
