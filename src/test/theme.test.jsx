import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, test } from 'vitest'
import { ThemeToggle } from '../components/ThemeToggle.jsx'

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
