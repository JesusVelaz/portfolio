import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { ThemeToggle } from '../components/ThemeToggle.jsx'
import { useTheme } from '../hooks/useTheme.js'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.dataset.theme = 'dark'
})

test('names the action it will take, not the state it is in', () => {
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument()
})

test('clicking flips the theme on the root element', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  await user.click(screen.getByRole('button'))
  expect(document.documentElement.dataset.theme).toBe('light')
  expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
})

test('remembers the choice so it survives the next visit', async () => {
  const user = userEvent.setup()
  render(<ThemeToggle />)
  await user.click(screen.getByRole('button'))
  expect(localStorage.getItem('theme')).toBe('light')
})

test('reads the theme already on the root rather than assuming one', () => {
  document.documentElement.dataset.theme = 'light'
  render(<ThemeToggle />)
  expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toBeInTheDocument()
})

test('multiple consumers sync when one toggles the theme', async () => {
  const user = userEvent.setup()

  function ThemeConsumer() {
    const { theme } = useTheme()
    return <div data-testid="theme-display">{theme}</div>
  }

  render(
    <>
      <ThemeToggle />
      <ThemeConsumer />
    </>
  )

  // Initially dark (from beforeEach)
  expect(screen.getByTestId('theme-display')).toHaveTextContent('dark')

  // Click toggle
  await user.click(screen.getByRole('button'))

  // Both the DOM and the separate consumer component should reflect the change
  expect(document.documentElement.dataset.theme).toBe('light')
  expect(screen.getByTestId('theme-display')).toHaveTextContent('light')
})
