import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { TypewriterGreeting } from '../components/TypewriterGreeting.jsx'

afterEach(() => {
  vi.useRealTimers()
})

test('backspaces the English greeting and types the Spanish greeting', () => {
  vi.useFakeTimers()
  render(<TypewriterGreeting />)

  expect(screen.getByTestId('typed-greeting')).toHaveTextContent('Hello,')

  // Hold, erase six characters, change language, then type five characters.
  for (let step = 0; step < 13; step += 1) {
    act(() => vi.runOnlyPendingTimers())
  }

  expect(screen.getByTestId('typed-greeting')).toHaveTextContent('Hola,')
})
