import { render, screen } from '@testing-library/react'
import { About } from '../sections/About.jsx'
import profile from '../data/profile.js'

test('renders the blurb and every skill group with its items', () => {
  render(<About />)
  expect(screen.getByText(/product design and systems engineering/i)).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /jesus velazquez/i })).toHaveAttribute(
    'src',
    '/profile/jesus-velazquez.png'
  )
  profile.skills.forEach((group) => {
    expect(screen.getByText(group.group)).toBeInTheDocument()
    group.items.forEach((item) => {
      expect(screen.getAllByText(item).length).toBeGreaterThan(0)
    })
  })
})

test('links to the configured résumé', () => {
  render(<About />)
  expect(screen.getByRole('link', { name: /résumé/i })).toHaveAttribute('href', profile.resumeUrl)
})

test('the about section carries the id the nav targets', () => {
  const { container } = render(<About />)
  expect(container.querySelector('#about')).not.toBeNull()
})
