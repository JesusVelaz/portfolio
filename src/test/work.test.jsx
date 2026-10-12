import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Work } from '../sections/Work.jsx'
import projects, { cardSlides, getProject } from '../data/projects.js'

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

test('the first project leads at full width and the rest pair up', () => {
  const { container } = renderWork()
  const layouts = [...container.querySelectorAll('#work li')].map((li) => li.dataset.layout)
  expect(layouts[0]).toBe('wide')
  expect(layouts.slice(1, 3)).toEqual(['pair', 'pair'])
})

test('each card has a carousel of its thumbnail and gallery screenshots', () => {
  renderWork()
  projects.forEach((p) => {
    const carousel = screen.getByRole('group', { name: `${p.title} screenshots` })
    expect(carousel.querySelectorAll('img')).toHaveLength(cardSlides(p).length)
  })
})

test('the carousel arrows and dots move between screenshots and wrap around', () => {
  renderWork()
  const carousel = within(screen.getByRole('group', { name: 'Waiver Director screenshots' }))
  const slides = cardSlides(getProject('waiver-director'))

  expect(carousel.getByText(slides[0].title)).toBeInTheDocument()
  fireEvent.click(carousel.getByRole('button', { name: 'Next screenshot' }))
  expect(carousel.getByText(slides[1].title)).toBeInTheDocument()

  fireEvent.click(carousel.getByRole('button', { name: `Show ${slides[5].title}` }))
  expect(carousel.getByRole('button', { name: `Show ${slides[5].title}` })).toHaveAttribute(
    'aria-current',
    'true'
  )

  fireEvent.click(carousel.getByRole('button', { name: `Show ${slides[0].title}` }))
  fireEvent.click(carousel.getByRole('button', { name: 'Previous screenshot' }))
  expect(carousel.getByText(slides[slides.length - 1].title)).toBeInTheDocument()
})

test('screenshot links stay out of the tab order so each card is one tab stop', () => {
  const { container } = renderWork()
  container.querySelectorAll('[aria-roledescription="carousel"] a').forEach((a) => {
    expect(a).toHaveAttribute('tabindex', '-1')
    expect(a).toHaveAttribute('aria-hidden', 'true')
  })
})
