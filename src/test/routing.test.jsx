import { render, screen } from '@testing-library/react'
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

test('a project with a null repoUrl renders without a repo link', async () => {
  const closed = projects.find((p) => p.repoUrl === null)
  expect(closed).toBeDefined()
  renderAt(`/work/${closed.slug}`)
  await screen.findByRole('heading', { level: 1, name: closed.title })
  expect(screen.queryByRole('link', { name: /source|repo|github/i })).toBeNull()
})

test('an unknown project slug renders the not-found page', async () => {
  renderAt('/work/not-a-real-project')
  expect(await screen.findByText(/lost in space/i)).toBeInTheDocument()
})

test('an unknown route renders the not-found page', async () => {
  renderAt('/nope')
  expect(await screen.findByText(/lost in space/i)).toBeInTheDocument()
})
