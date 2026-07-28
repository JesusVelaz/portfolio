import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useScrolled } from '../hooks/useScrolled.js'
import styles from './Nav.module.css'

export const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

const SECTION_IDS = SECTIONS.map((s) => s.id)

export function Nav() {
  const scrolled = useScrolled(40)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const activeSection = useActiveSection(SECTION_IDS)
  const active = isHome ? activeSection : null

  return (
    <div className={`${styles.wrap} ${scrolled ? styles.wrapScrolled : ''}`}>
      <nav aria-label="Main" className={`${styles.bar} ${scrolled ? styles.barScrolled : ''}`}>
        <Link to="/" className={styles.brand}>
          <svg className={styles.mark} viewBox="0 0 32 32" aria-hidden="true">
            <circle
              cx="16"
              cy="16"
              r="15"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              opacity="0.55"
            />
            <text
              x="16"
              y="21"
              textAnchor="middle"
              fill="var(--text)"
              fontFamily="var(--font-display)"
              fontSize="12"
              fontWeight="700"
            >
              JV
            </text>
          </svg>
          <span>Jesus Velazquez</span>
        </Link>

        <ul className={styles.links}>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                to={`/#${s.id}`}
                className={`${styles.link} ${active === s.id ? styles.linkActive : ''}`}
                aria-current={active === s.id ? 'true' : undefined}
              >
                {active === s.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className={styles.pill}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className={styles.label}>{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
