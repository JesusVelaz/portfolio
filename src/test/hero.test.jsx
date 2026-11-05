import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Hero } from '../sections/Hero.jsx'
import profile from '../data/profile.js'

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

test('primary CTA targets contact and secondary opens the résumé', () => {
  renderHero()
  expect(screen.getByRole('link', { name: /get in touch/i }).getAttribute('href')).toBe('/#contact')
  const resume = screen.getByRole('link', { name: /view my résumé/i })
  expect(resume).toHaveAttribute('href', profile.resumeUrl)
  expect(resume).toHaveAttribute('target', '_blank')
  expect(screen.queryByRole('link', { name: /view my work/i })).not.toBeInTheDocument()
})

test('no longer carries the What I bring block', () => {
  renderHero()
  expect(
    screen.queryByRole('heading', { name: /ambiguous workflow to a durable product/i })
  ).not.toBeInTheDocument()
  expect(screen.queryByText(/what i bring/i)).not.toBeInTheDocument()
})

test('offers a visible cue that continues into the work section', () => {
  renderHero()
  expect(screen.getByRole('link', { name: /scroll to selected work/i })).toHaveAttribute(
    'href',
    '/#work'
  )
})
