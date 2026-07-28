import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'

test('renders the name in the hero', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  )
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jesus Velazquez')
})
