import { createRef } from 'react'
import { render } from '@testing-library/react'
import { HeroStage } from '../components/HeroStage.jsx'

test('renders the lifecycle canvas', () => {
  const ref = createRef()
  const { container } = render(<HeroStage trackRef={ref} />)
  expect(container.querySelector('canvas')).not.toBeNull()
})

test('is decoration, so it stays out of the accessibility tree', () => {
  const ref = createRef()
  const { container } = render(<HeroStage trackRef={ref} />)
  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
})
