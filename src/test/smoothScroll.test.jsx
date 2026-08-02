import { render } from '@testing-library/react'
import { vi } from 'vitest'
import { SmoothScrollProvider, SMOOTH_SCROLL_OPTIONS } from '../components/SmoothScrollProvider.jsx'

vi.mock('lenis/react', () => ({
  ReactLenis: ({ children }) => <div data-testid="lenis-root">{children}</div>,
}))

test('uses restrained wheel inertia while leaving touch scrolling native', () => {
  expect(SMOOTH_SCROLL_OPTIONS.lerp).toBeGreaterThan(0)
  expect(SMOOTH_SCROLL_OPTIONS.lerp).toBeLessThan(0.1)
  expect(SMOOTH_SCROLL_OPTIONS.smoothWheel).toBe(true)
  expect(SMOOTH_SCROLL_OPTIONS.syncTouch).toBe(false)
})

test('mounts the smooth scrolling root when motion is allowed', () => {
  const { getByTestId } = render(
    <SmoothScrollProvider>
      <main>Portfolio</main>
    </SmoothScrollProvider>
  )

  expect(getByTestId('lenis-root')).toHaveTextContent('Portfolio')
})
