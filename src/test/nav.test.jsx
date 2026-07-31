import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Nav, SECTIONS } from '../components/Nav.jsx'

function renderNav(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Nav />
    </MemoryRouter>
  )
}

test('renders the full name and every section link', () => {
  renderNav()
  expect(screen.getByRole('link', { name: /Jesus Velazquez/ })).toBeInTheDocument()
  SECTIONS.forEach((s) => {
    expect(screen.getByRole('link', { name: s.label })).toBeInTheDocument()
  })
})

test('section links point at hash routes so they work from a project page', () => {
  renderNav('/work/pokedex')
  const work = screen.getByRole('link', { name: 'Work' })
  expect(work.getAttribute('href')).toBe('/#work')
})

test('marks no section as current while a project page is open', () => {
  renderNav('/work/pokedex')
  const current = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current'))
  expect(current).toHaveLength(0)
})

test('exposes a labelled navigation landmark', () => {
  renderNav()
  expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
})
