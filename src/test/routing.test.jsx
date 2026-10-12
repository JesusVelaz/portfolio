import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import projects from '../data/projects.js'

// App code-splits the case-study routes with React.lazy. Warming the modules here means
// lazy() resolves on the next microtask instead of paying a module-compile cost inside the
// first findBy* call, which otherwise flakes past its timeout under full-suite load.
beforeAll(async () => {
  await Promise.all([import('../pages/ProjectPage.jsx'), import('../pages/NotFound.jsx')])
})

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}

test('the home route renders every section the nav targets', () => {
  const { container } = renderAt('/')
  ;['work', 'about', 'experience', 'contact'].forEach((id) => {
    expect(container.querySelector(`#${id}`)).not.toBeNull()
  })
})

test.each(projects.map((p) => [p.slug, p.title]))(
  'the route for %s renders its case study',
  async (slug, title) => {
    renderAt(`/work/${slug}`)
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
  }
)

test('a case study links to its source only when the project has a repo', async () => {
  const { unmount } = renderAt('/work/agents-cafe')
  expect(await screen.findByRole('link', { name: /view source/i })).toHaveAttribute(
    'href',
    'https://github.com/JesusVelaz/agent-cafe'
  )
  unmount()

  renderAt('/work/waiver-director')
  await screen.findByRole('heading', { level: 1, name: 'Waiver Director' })
  expect(screen.queryByRole('link', { name: /view source/i })).toBeNull()
})

test('a case study lists its sections in the rail, each linking to that section', async () => {
  const { container } = renderAt('/work/agents-cafe')
  const toc = await screen.findByRole('navigation', { name: 'Sections' })
  const links = within(toc).getAllByRole('link')
  const sections = projects.find((p) => p.slug === 'agents-cafe').gallerySections

  expect(links.map((a) => a.textContent)).toEqual(
    sections.map((s, i) => `${String(i + 1).padStart(2, '0')}${s.name}`)
  )
  links.forEach((a, i) => {
    const target = container.querySelector(a.getAttribute('href'))
    expect(target).not.toBeNull()
    expect(within(target).getByRole('heading', { level: 2 })).toHaveTextContent(sections[i].name)
  })
})

test('an unknown project slug renders the not-found page', async () => {
  renderAt('/work/not-a-real-project')
  expect(await screen.findByText(/lost in space/i)).toBeInTheDocument()
})

test('an unknown route renders the not-found page', async () => {
  renderAt('/nope')
  expect(await screen.findByText(/lost in space/i)).toBeInTheDocument()
})
