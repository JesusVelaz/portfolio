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
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jesus Velazquez')
})

test('primary CTA targets the work section and secondary targets contact', () => {
  renderHero()
  expect(screen.getByRole('link', { name: /view my work/i }).getAttribute('href')).toBe('/#work')
  expect(screen.getByRole('link', { name: /get in touch/i }).getAttribute('href')).toBe('/#contact')
})
