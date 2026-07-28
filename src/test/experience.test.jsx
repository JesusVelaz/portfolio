import { render, screen } from '@testing-library/react'
import { Experience } from '../sections/Experience.jsx'
import experience, { education } from '../data/experience.js'

test('renders every role with its company and bullets', () => {
  render(<Experience />)
  experience.forEach((role) => {
    expect(screen.getByText(role.role)).toBeInTheDocument()
    expect(screen.getAllByText(new RegExp(role.company, 'i')).length).toBeGreaterThan(0)
    role.bullets.forEach((b) => {
      expect(screen.getByText(b)).toBeInTheDocument()
    })
  })
})

test('renders "Present" for a role with no end date', () => {
  render(<Experience />)
  expect(screen.getAllByText(/Present/).length).toBeGreaterThan(0)
})

test('ends the timeline with the education node', () => {
  render(<Experience />)
  expect(screen.getByText(education.school)).toBeInTheDocument()
  expect(screen.getByText(education.degree)).toBeInTheDocument()
})

test('the experience section carries the id the nav targets', () => {
  const { container } = render(<Experience />)
  expect(container.querySelector('#experience')).not.toBeNull()
})
