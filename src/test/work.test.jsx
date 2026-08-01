import { fireEvent, render, screen, within } from '@testing-library/react'
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

test('renders stack chips for each project', () => {
  renderWork()
  projects[0].stack.forEach((tech) => {
    expect(screen.getAllByText(tech).length).toBeGreaterThan(0)
  })
})

test('the work section carries the id the nav targets', () => {
  const { container } = renderWork()
  expect(container.querySelector('#work')).not.toBeNull()
})

test('shows one secondary screenshot as a hover teaser', () => {
  renderWork()
  const projectLink = screen.getByRole('link', { name: /waiver director/i })
  const card = projectLink.closest('article')

  expect(within(card).getByText('Workspace Dashboard')).toBeInTheDocument()

  fireEvent.mouseEnter(card)
  expect(within(card).getByText('Waiver Builder')).toBeInTheDocument()
  expect(within(card).getByText(/view full case study/i)).toBeInTheDocument()

  fireEvent.mouseLeave(card)
  expect(within(card).getByText('Workspace Dashboard')).toBeInTheDocument()
})
