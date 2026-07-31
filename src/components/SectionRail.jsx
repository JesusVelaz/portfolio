import { Link } from 'react-router-dom'
import { SECTIONS } from './Nav.jsx'
import { useActiveSection } from '../hooks/useActiveSection.js'
import styles from './SectionRail.module.css'

// The hero is observed but gets no tick of its own: reporting it as active is
// what keeps the rail hidden until you reach the sections it speaks for.
const OBSERVED_IDS = ['hero', ...SECTIONS.map((section) => section.id)]

export function SectionRail() {
  const active = useActiveSection(OBSERVED_IDS)

  return (
    <nav
      aria-label="Sections"
      className={active === 'hero' ? styles.rail : `${styles.rail} ${styles.railVisible}`}
    >
      <ul className={styles.list}>
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <Link
              to={`/#${section.id}`}
              className={active === section.id ? `${styles.tick} ${styles.tickActive}` : styles.tick}
              aria-current={active === section.id ? 'true' : undefined}
            >
              <span className={styles.label}>{section.label}</span>
              <span className={styles.line} />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
