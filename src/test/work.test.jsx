import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Work } from '../sections/Work.jsx'
import projects from '../data/projects.js'

function renderWork() {
  return render(
    <MemoryRouter>
      <Work />
    </MemoryRouter>
  )
}

test('renders a card for every project, linking to its detail page', () => {
  renderWork()
  projects.forEach((p) => {
    const link = screen.getByRole('link', { name: new RegExp(p.title, 'i') })
    expect(link.getAttribute('href')).toBe(`/work/${p.slug}`)
  })
})

test('numbers the cards in order', () => {
  renderWork()
  expect(screen.getByText('01')).toBeInTheDocument()
  expect(screen.getByText('02')).toBeInTheDocument()
})

test('keeps technology details on the project pages', () => {
  renderWork()
  expect(screen.getAllByText('Explore the project')).toHaveLength(projects.length)
  expect(screen.queryByText(projects[0].stack[0])).not.toBeInTheDocument()
})

test('the work section carries the id the nav targets', () => {
  const { container } = renderWork()
  expect(container.querySelector('#work')).not.toBeNull()
})
