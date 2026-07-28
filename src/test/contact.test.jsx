import { render, screen } from '@testing-library/react'
import { Contact } from '../sections/Contact.jsx'
import profile from '../data/profile.js'

test('shows the email address as text', () => {
  render(<Contact />)
  expect(screen.getByText(profile.email)).toBeInTheDocument()
})

test('the go button opens a mail client addressed to the email', () => {
  render(<Contact />)
  const link = screen.getByRole('link', { name: /send an email/i })
  expect(link.getAttribute('href')).toBe(`mailto:${profile.email}`)
})

test('renders every configured social link', () => {
  render(<Contact />)
  profile.socials.forEach((s) => {
    expect(screen.getByRole('link', { name: new RegExp(s.label, 'i') })).toHaveAttribute(
      'href',
      s.url
    )
  })
})

test('the contact section carries the id the nav targets', () => {
  const { container } = render(<Contact />)
  expect(container.querySelector('#contact')).not.toBeNull()
})
