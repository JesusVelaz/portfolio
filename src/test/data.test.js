import profile from '../data/profile.js'
import projects, { getProject } from '../data/projects.js'
import experience from '../data/experience.js'

test('profile has the fields the UI reads', () => {
  expect(profile.name).toBe('Jesus Velazquez')
  expect(profile.email).toMatch(/@/)
  expect(profile.skills.length).toBeGreaterThan(0)
  profile.skills.forEach((g) => {
    expect(typeof g.group).toBe('string')
    expect(Array.isArray(g.items)).toBe(true)
  })
})

test('every project has a unique slug and the required fields', () => {
  const slugs = projects.map((p) => p.slug)
  expect(new Set(slugs).size).toBe(slugs.length)

  projects.forEach((p) => {
    expect(p.slug).toMatch(/^[a-z0-9-]+$/)
    expect(p.title).toBeTruthy()
    expect(p.tagline).toBeTruthy()
    expect(p.problem).toBeTruthy()
    expect(p.whatIBuilt).toBeTruthy()
    expect(Array.isArray(p.stack)).toBe(true)
    expect(p.highlights.length).toBeGreaterThanOrEqual(3)
    expect(p).toHaveProperty('repoUrl')
    expect(p).toHaveProperty('liveUrl')
  })
})

test('featured projects sort first', () => {
  const firstUnfeatured = projects.findIndex((p) => !p.featured)
  if (firstUnfeatured !== -1) {
    expect(projects.slice(firstUnfeatured).every((p) => !p.featured)).toBe(true)
  }
})

test('getProject finds by slug and returns undefined otherwise', () => {
  expect(getProject('waiver-director').title).toBe('Waiver Director')
  expect(getProject('does-not-exist')).toBeUndefined()
})

test('Waiver Director includes the complete product walkthrough', () => {
  const waiverDirector = getProject('waiver-director')

  expect(waiverDirector.screenshots).toHaveLength(7)
  expect(waiverDirector.gallerySections.map((section) => section.id)).toEqual([
    'overview',
    'capture',
    'follow-ups',
    'measure',
  ])
  expect(waiverDirector.screenshots.map((screenshot) => screenshot.title)).toEqual([
    'Workspace Dashboard',
    'Waiver Builder',
    'Integrations Settings',
    'Follow-Up Email Editor',
    'AI Email Review',
    'Follow-Up Queue',
    'Analytics Dashboard',
  ])
  waiverDirector.screenshots.forEach((screenshot) => {
    expect(screenshot.src).toMatch(/\.png$/)
    // The gallery sizes every frame from these, so a missing pair letterboxes the shot.
    expect(screenshot.width).toBeGreaterThan(0)
    expect(screenshot.height).toBeGreaterThan(0)
    expect(screenshot.alt).toBeTruthy()
    expect(screenshot.title).toBeTruthy()
    expect(screenshot.caption).toBeTruthy()
    expect(waiverDirector.gallerySections.some((section) => section.id === screenshot.group)).toBe(
      true
    )
  })
})

test('PokeDex includes the complete three-screen product walkthrough', () => {
  const pokedex = getProject('pokedex')

  expect(pokedex.thumb).toBe('/projects/pokedex/01-trainer-field-desk.png')
  expect(pokedex.screenshots).toHaveLength(3)
  expect(pokedex.gallerySections.map((section) => section.id)).toEqual([
    'field-desk',
    'pokedex',
    'teams',
  ])
  expect(pokedex.screenshots.map((screenshot) => screenshot.title)).toEqual([
    'Trainer Field Desk',
    'Searchable Pokédex',
    'Pokémon Team Builder',
  ])
  pokedex.screenshots.forEach((screenshot) => {
    expect(screenshot.src).toMatch(/\.png$/)
    expect(screenshot.width).toBeGreaterThan(0)
    expect(screenshot.height).toBeGreaterThan(0)
    expect(screenshot.alt).toBeTruthy()
    expect(screenshot.caption).toBeTruthy()
    expect(pokedex.gallerySections.some((section) => section.id === screenshot.group)).toBe(true)
  })
  expect(pokedex.screenshots[0].caption).toContain('three-step research checklist')
  expect(pokedex.screenshots[1].caption).toContain('Debounced search')
  expect(pokedex.screenshots[2].caption).toContain('localStorage')
})

test('experience is ordered most recent first and every role is complete', () => {
  expect(experience[0].end).toBeNull()
  experience.forEach((role) => {
    expect(role.company).toBeTruthy()
    expect(role.role).toBeTruthy()
    expect(role.summary).toBeTruthy()
    expect(role.metric).toBeTruthy()
    expect(role.focus.length).toBeGreaterThan(0)
  })
})
