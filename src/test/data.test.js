import profile from '../data/profile.js'
import projects, { getProject } from '../data/projects.js'
import experience, { education } from '../data/experience.js'

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

test('experience is ordered most recent first and ends at education', () => {
  expect(experience[0].end).toBeNull()
  experience.forEach((role) => {
    expect(role.company).toBeTruthy()
    expect(role.role).toBeTruthy()
    expect(role.summary).toBeTruthy()
    expect(role.metric).toBeTruthy()
    expect(role.focus.length).toBeGreaterThan(0)
  })
  expect(education.school).toMatch(/Florida International/)
})
