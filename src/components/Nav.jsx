import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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

  const listRef = useRef(null)
  const [pill, setPill] = useState(null)

  // One pill slides between the links instead of each link drawing its own.
  // A gradient background cannot be interpolated, so per-link highlights can
  // only ever pop; a single element can move, and moving is what reads as
  // smooth. Measured in a layout effect so the first paint is already correct.
  useLayoutEffect(() => {
    const list = listRef.current
    const target = active && list?.querySelector(`[data-section="${active}"]`)
    if (!target) {
      setPill(null)
      return
    }

    const measure = () => setPill({ left: target.offsetLeft, width: target.offsetWidth })
    measure()

    if (typeof ResizeObserver === 'undefined') return
    // The bar narrows once the page scrolls, which shifts every link under it.
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [active])

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

        <ul className={styles.links} ref={listRef}>
          {pill && (
            <li
              aria-hidden="true"
              className={styles.pill}
              style={{ transform: `translateX(${pill.left}px)`, width: `${pill.width}px` }}
            />
          )}
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                to={`/#${s.id}`}
                data-section={s.id}
                className={`${styles.link} ${active === s.id ? styles.linkActive : ''}`}
                aria-current={active === s.id ? 'true' : undefined}
              >
                <span className={styles.label}>{s.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
