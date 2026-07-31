import { render, screen } from '@testing-library/react'
import { Experience } from '../sections/Experience.jsx'
import experience from '../data/experience.js'

test('renders every role with its company, purpose, and focus chips', () => {
  render(<Experience />)
  experience.forEach((role) => {
    expect(screen.getByText(role.role)).toBeInTheDocument()
    expect(screen.getAllByText(new RegExp(role.company, 'i')).length).toBeGreaterThan(0)
    expect(screen.getByText(role.summary)).toBeInTheDocument()
    expect(screen.getByText(role.metric)).toBeInTheDocument()
    role.focus.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })
})

test('renders "Present" for a role with no end date', () => {
  render(<Experience />)
  expect(screen.getAllByText(/Present/).length).toBeGreaterThan(0)
})

test('the experience section carries the id the nav targets', () => {
  const { container } = render(<Experience />)
  expect(container.querySelector('#experience')).not.toBeNull()
})
