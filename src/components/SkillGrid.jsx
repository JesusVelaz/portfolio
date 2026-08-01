import { useMemo, useRef, useState } from 'react'
import profile from '../data/profile.js'
import { skillIcons } from '../data/skillIcons.js'
import {
  legibleBrandColor,
  DARK_SURFACE_LUMINANCE,
  LIGHT_SURFACE_LUMINANCE,
} from '../lib/legibleBrandColor.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { useTheme } from '../hooks/useTheme.js'
import styles from './SkillGrid.module.css'

const ALL = 'All'

const STEP = { ArrowRight: 1, ArrowLeft: -1 }

function slug(category) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function monogram(name) {
  const words = name.split(/[\s.]+/).filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)
  return letters.toUpperCase()
}

export function SkillGrid({ compact = false }) {
  const [active, setActive] = useState(ALL)
  const reduced = useReducedMotion()
  const { theme } = useTheme()
  const surface = theme === 'dark' ? DARK_SURFACE_LUMINANCE : LIGHT_SURFACE_LUMINANCE
  const chipRefs = useRef([])

  const categories = useMemo(() => [ALL, ...profile.skills.map((group) => group.group)], [])

  const visible = useMemo(() => {
    const groups = active === ALL ? profile.skills : profile.skills.filter((g) => g.group === active)
    return groups.flatMap((group) => group.items)
  }, [active])

  function onKeyDown(event) {
    const current = categories.indexOf(active)
    let next = null

    if (event.key in STEP) next = (current + STEP[event.key] + categories.length) % categories.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = categories.length - 1
    if (next === null) return

    event.preventDefault()
    setActive(categories[next])
    chipRefs.current[next]?.focus()
  }

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <div
        className={styles.chips}
        role="tablist"
        aria-label="Filter skills by category"
        onKeyDown={onKeyDown}
      >
        {categories.map((category, index) => (
          <button
            key={category}
            ref={(node) => {
              chipRefs.current[index] = node
            }}
            type="button"
            role="tab"
            id={`skill-tab-${slug(category)}`}
            aria-selected={category === active}
            aria-controls="skill-panel"
            tabIndex={category === active ? 0 : -1}
            className={category === active ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => setActive(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div
        id="skill-panel"
        role="tabpanel"
        aria-labelledby={`skill-tab-${slug(active)}`}
        tabIndex={0}
        className={styles.grid}
      >
        {visible.map((name, index) => {
          const icon = skillIcons[name]
          return (
            // Keying on the filter remounts every card so the entrance animation
            // replays across the whole grid instead of the leftovers jumping.
            <article
              key={`${active}-${name}`}
              className={styles.card}
              style={reduced ? undefined : { '--i': index }}
            >
              {icon ? (
                <svg
                  className={styles.icon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ fill: legibleBrandColor(icon.hex, surface) }}
                >
                  <path d={icon.path} />
                </svg>
              ) : (
                <span className={styles.monogram} aria-hidden="true">
                  {monogram(name)}
                </span>
              )}
              <span className={styles.name}>{name}</span>
            </article>
          )
        })}
      </div>
    </div>
  )
}
