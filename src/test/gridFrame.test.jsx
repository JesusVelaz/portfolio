import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import { GridFrame } from '../components/GridFrame.jsx'

test('is decoration, so it stays out of the accessibility tree', () => {
  const { container } = render(<GridFrame />)
  expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
})
