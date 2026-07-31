import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SkillGrid } from '../components/SkillGrid.jsx'
import { legibleBrandColor } from '../lib/legibleBrandColor.js'
import profile from '../data/profile.js'

const [first, second] = profile.skills

test('shows every skill from every group before any filter is applied', () => {
  render(<SkillGrid />)
  profile.skills.forEach((group) => {
    group.items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })
})

test('selecting a category renders only that group and hides the others', async () => {
  const user = userEvent.setup()
  render(<SkillGrid />)

  await user.click(screen.getByRole('tab', { name: first.group }))

  first.items.forEach((item) => expect(screen.getByText(item)).toBeInTheDocument())
  second.items
    .filter((item) => !first.items.includes(item))
    .forEach((item) => expect(screen.queryByText(item)).toBeNull())
})

test('aria-selected follows the active chip, starting on All', async () => {
  const user = userEvent.setup()
  render(<SkillGrid />)

  expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')

  await user.click(screen.getByRole('tab', { name: first.group }))

  expect(screen.getByRole('tab', { name: first.group })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'false')
})

test('arrow keys move between chips and change the filter', async () => {
  const user = userEvent.setup()
  render(<SkillGrid />)

  const all = screen.getByRole('tab', { name: 'All' })
  all.focus()
  await user.keyboard('{ArrowRight}')

  const next = screen.getByRole('tab', { name: first.group })
  expect(next).toHaveAttribute('aria-selected', 'true')
  expect(next).toHaveFocus()
})

test('a skill with no simple-icons mark falls back to a monogram', () => {
  render(<SkillGrid />)
  // Java's mark was pulled from simple-icons over trademark.
  expect(screen.getByText('Java').closest('article')).toHaveTextContent('JA')
})

test('brand colours too dark for the surface are lifted to a legible one', () => {
  expect(legibleBrandColor('#61DAFB')).toBe('#61dafb')
  expect(legibleBrandColor('#0F0F11')).not.toBe('#0f0f11')
})
