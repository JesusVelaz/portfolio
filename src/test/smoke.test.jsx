import { render, screen } from '@testing-library/react'
import App from '../App.jsx'

test('renders the name', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Jesus Velazquez' })).toBeInTheDocument()
})
