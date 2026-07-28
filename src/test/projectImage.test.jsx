import { fireEvent, render, screen } from '@testing-library/react'
import { ProjectImage } from '../components/ProjectImage.jsx'

test('renders the image when a source is provided', () => {
  render(<ProjectImage src="/projects/demo/thumb.jpg" alt="Demo screenshot" label="Demo" />)
  const img = screen.getByAltText('Demo screenshot')
  expect(img).toHaveAttribute('src', '/projects/demo/thumb.jpg')
})

// A missing asset does not 404 in this app: GitHub Pages serves 404.html (the SPA shell) for
// any unmatched path, so the browser receives 200 text/html and the <img> fires `error`.
// That error is the only signal the file is absent, so the fallback must hang off it.
test('swaps to the labelled placeholder when the file is missing', () => {
  render(<ProjectImage src="/projects/demo/thumb.jpg" alt="Demo screenshot" label="Demo" />)
  fireEvent.error(screen.getByAltText('Demo screenshot'))

  expect(screen.queryByAltText('Demo screenshot')).toBeNull()
  expect(screen.getByText('Demo')).toBeInTheDocument()
})

test('renders the placeholder immediately when no source is configured', () => {
  render(<ProjectImage src={null} alt="Demo screenshot" label="Demo" />)
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.getByText('Demo')).toBeInTheDocument()
})

test('falls back to the alt text when no label is given', () => {
  render(<ProjectImage src={null} alt="Demo screenshot" />)
  expect(screen.getByText('Demo screenshot')).toBeInTheDocument()
})
