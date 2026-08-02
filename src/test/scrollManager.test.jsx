import { act, fireEvent, render, screen } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { ScrollManager } from '../components/ScrollManager.jsx'

let scrollIntoView
let sectionTop

function mountSection(id, top) {
  const section = document.createElement('section')
  section.id = id
  // jsdom has no layout, so the position is whatever the test says it is.
  section.getBoundingClientRect = () => ({ top: sectionTop - window.scrollY, left: 0 })
  section.scrollIntoView = (...args) => {
    scrollIntoView(...args)
    window.scrollY = sectionTop
  }
  sectionTop = top
  document.body.append(section)
  return section
}

function renderAt(route) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <ScrollManager />
    </MemoryRouter>
  )
}

function frames(count) {
  act(() => {
    for (let i = 0; i < count; i += 1) vi.advanceTimersByTime(17)
  })
}

// Same, but with the page still travelling — a smooth scroll mid-flight.
function framesInFlight(count) {
  act(() => {
    for (let i = 0; i < count; i += 1) {
      window.scrollY += 30
      vi.advanceTimersByTime(17)
    }
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  scrollIntoView = vi.fn()
  window.scrollY = 0
  window.scrollTo = vi.fn(({ top }) => {
    window.scrollY = top
  })
})

afterEach(() => {
  vi.useRealTimers()
  document.body.innerHTML = ''
})

test('a route with no hash goes to the top of the page', () => {
  renderAt('/work/waiver-director')
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  expect(scrollIntoView).not.toHaveBeenCalled()
})

test('a hash pointing at nothing falls back to the top of the page', () => {
  renderAt('/#nowhere')
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
})

test('scrolls the hash target into view', () => {
  mountSection('about', 2229)
  renderAt('/#about')

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
})

test('scrolls again when the current hash link is selected again', () => {
  mountSection('contact', 4670)
  render(
    <MemoryRouter initialEntries={['/#contact']}>
      <ScrollManager />
      <Link to="/#contact">Contact</Link>
    </MemoryRouter>
  )

  expect(scrollIntoView).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('link', { name: 'Contact' }))
  expect(scrollIntoView).toHaveBeenCalledTimes(2)
})

// The regression: `content-visibility: auto` means every offset below the
// first unrendered section is an estimate, so the first aim lands short —
// far enough to leave you in the previous section.
test('re-aims when the target moves as the page renders', () => {
  mountSection('about', 2229)
  renderAt('/#about')
  expect(scrollIntoView).toHaveBeenCalledTimes(1)

  // Sections above it render and push the real target down the page.
  sectionTop = 2541
  frames(2)
  expect(scrollIntoView).toHaveBeenCalledTimes(2)
  expect(window.scrollY).toBe(2541)
})

test('stops re-aiming once the target holds still', () => {
  mountSection('about', 2229)
  renderAt('/#about')

  frames(60)
  expect(scrollIntoView).toHaveBeenCalledTimes(1)
})

// Contact is the furthest target, so its smooth scroll crosses long stretches
// of already-rendered page where nothing shifts. Treating that stillness as an
// arrival ended the watch mid-flight, and the sections that rendered afterwards
// pushed Contact a further 979px down with nobody left to follow it.
test('keeps watching while the page is still travelling', () => {
  mountSection('contact', 4670)
  renderAt('/#contact')
  expect(scrollIntoView).toHaveBeenCalledTimes(1)

  framesInFlight(30)
  expect(scrollIntoView).toHaveBeenCalledTimes(1)

  // The sections above finally render and push the real target down.
  sectionTop = 5649
  framesInFlight(2)
  expect(scrollIntoView).toHaveBeenCalledTimes(2)
  // Past the old estimate, which is where the watch used to give up.
  expect(window.scrollY).toBeGreaterThanOrEqual(5649)
})

test('leaves the page alone once someone scrolls for themselves', () => {
  mountSection('about', 2229)
  renderAt('/#about')
  expect(scrollIntoView).toHaveBeenCalledTimes(1)

  act(() => {
    window.dispatchEvent(new Event('wheel'))
  })
  sectionTop = 2541
  frames(10)

  expect(scrollIntoView).toHaveBeenCalledTimes(1)
})

test('jumps instantly when motion is reduced', () => {
  window.matchMedia = (query) => ({
    matches: query.includes('reduced-motion'),
    addEventListener() {},
    removeEventListener() {},
  })
  mountSection('about', 2229)
  renderAt('/#about')

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
})
