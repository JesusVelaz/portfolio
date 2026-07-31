import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('../hooks/useActiveSection.js', () => ({ useActiveSection: vi.fn() }))

import { useActiveSection } from '../hooks/useActiveSection.js'
import { SectionRail } from '../components/SectionRail.jsx'
import { SECTIONS } from '../components/Nav.jsx'
import styles from '../components/SectionRail.module.css'

function renderRail(active) {
  useActiveSection.mockReturnValue(active)
  return render(
    <MemoryRouter>
      <SectionRail />
    </MemoryRouter>
  )
}

test('renders a link to every section', () => {
  renderRail('about')
  const rail = screen.getByRole('navigation', { name: 'Sections' })
  SECTIONS.forEach((section) => {
    expect(screen.getByRole('link', { name: section.label })).toHaveAttribute(
      'href',
      `/#${section.id}`
    )
  })
  expect(rail).toBeInTheDocument()
})

test('marks only the active section, and marks it for assistive tech too', () => {
  renderRail('experience')

  const current = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current'))
  expect(current).toHaveLength(1)
  expect(current[0]).toHaveAccessibleName('Experience')
  expect(current[0]).toHaveClass(styles.tickActive)
})

test('the active tick follows the section the observer reports', () => {
  const { unmount } = renderRail('work')
  expect(screen.getByRole('link', { name: 'Work' })).toHaveClass(styles.tickActive)
  unmount()

  renderRail('contact')
  expect(screen.getByRole('link', { name: 'Contact' })).toHaveClass(styles.tickActive)
  expect(screen.getByRole('link', { name: 'Work' })).not.toHaveClass(styles.tickActive)
})

test('stays hidden while the hero is on screen', () => {
  renderRail('hero')

  const rail = screen.getByRole('navigation', { name: 'Sections' })
  expect(rail).not.toHaveClass(styles.railVisible)
  expect(screen.getAllByRole('link').some((a) => a.getAttribute('aria-current'))).toBe(false)
})

test('becomes visible once a real section is active', () => {
  renderRail('about')
  expect(screen.getByRole('navigation', { name: 'Sections' })).toHaveClass(styles.railVisible)
})

test('observes the hero alongside the nav sections', () => {
  renderRail('about')
  expect(useActiveSection).toHaveBeenCalledWith([
    'hero',
    ...SECTIONS.map((section) => section.id),
  ])
})
