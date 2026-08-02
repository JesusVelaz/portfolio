import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Hero } from '../sections/Hero.jsx'

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>
  )
}

test('shows the name as the page heading', () => {
  renderHero()
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    "Hello, I am Jesus Velazquez and I'm a full-stack Software Engineer."
  )
})

test('starts the animated greeting in English without repeatedly announcing it', () => {
  renderHero()
  const greeting = screen.getByTestId('typed-greeting')
  expect(greeting).toHaveTextContent('Hello,')
  expect(greeting).toHaveAttribute('aria-hidden', 'true')
})

test('moves the reliability statement into the supporting copy', () => {
  renderHero()
  expect(screen.getByText(/I build reliable software for complex work/i)).toBeInTheDocument()
  expect(screen.getByText(/secure APIs, and multi-tenant systems/i)).toBeInTheDocument()
})

test('primary CTA targets the work section and secondary targets contact', () => {
  renderHero()
  expect(screen.getByRole('link', { name: /view my work/i }).getAttribute('href')).toBe('/#work')
  expect(screen.getByRole('link', { name: /get in touch/i }).getAttribute('href')).toBe('/#contact')
})

test('shows grounded capabilities instead of the old metric cards', () => {
  renderHero()
  expect(screen.getByRole('heading', { name: /ambiguous workflow to a durable product/i })).toBeInTheDocument()
  expect(screen.getByText(/Product engineering/i)).toBeInTheDocument()
  expect(screen.queryByText('+35%')).not.toBeInTheDocument()
})

test('offers a visible cue to continue into the capabilities', () => {
  renderHero()
  expect(screen.getByRole('link', { name: /scroll to what i bring/i })).toHaveAttribute(
    'href',
    '/#capabilities'
  )
})
