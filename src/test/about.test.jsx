import { render, screen } from '@testing-library/react'
import { About } from '../sections/About.jsx'
import profile from '../data/profile.js'

test('renders the blurb and every skill group with its items', () => {
  render(<About />)
  expect(screen.getByText(/co-founder of Waiver Director/i)).toBeInTheDocument()
  profile.skills.forEach((group) => {
    expect(screen.getByText(group.group)).toBeInTheDocument()
    group.items.forEach((item) => {
      expect(screen.getAllByText(item).length).toBeGreaterThan(0)
    })
  })
})

test('hides the resume button when no resume is configured', () => {
  render(<About />)
  const button = screen.queryByRole('link', { name: /resume/i })
  if (profile.resumeUrl) {
    expect(button).toBeInTheDocument()
  } else {
    expect(button).toBeNull()
  }
})

test('the about section carries the id the nav targets', () => {
  const { container } = render(<About />)
  expect(container.querySelector('#about')).not.toBeNull()
})
