import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useActiveSection } from '../hooks/useActiveSection.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import { useScrolled } from '../hooks/useScrolled.js'
import { useScrollDirection } from '../hooks/useScrollDirection.js'
import styles from './Nav.module.css'

export const SECTIONS = [
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

const SECTION_IDS = SECTIONS.map((s) => s.id)

// How far the highlight stretches at most while it travels, and how long it
// holds that stretch before relaxing back to its resting shape.
const MAX_STRETCH = 0.09
const STRETCH_RELEASE_MS = 120

export function Nav() {
  const scrolled = useScrolled(40)
  const direction = useScrollDirection()
  const reducedMotion = useReducedMotion()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const active = useActiveSection(SECTION_IDS, isHome)

  const barRef = useRef(null)
  const listRef = useRef(null)
  const pillRef = useRef(null)
  const previousLeft = useRef(null)
  const [pill, setPill] = useState(null)

  // Glass reflects the light around it, so the sheen follows the pointer
  // instead of sitting in a fixed spot. Written straight to the element:
  // a state update per mousemove would re-render the whole bar.
  const trackLight = useCallback((event) => {
    if (event.pointerType !== 'mouse') return
    const bar = barRef.current
    if (!bar) return
    const rect = bar.getBoundingClientRect()
    bar.style.setProperty('--gx', `${event.clientX - rect.left}px`)
    bar.style.setProperty('--gy', `${event.clientY - rect.top}px`)
    bar.style.setProperty('--glow', '1')
  }, [])

  const releaseLight = useCallback(() => {
    barRef.current?.style.setProperty('--glow', '0')
  }, [])

  // One pill slides between the links instead of each link drawing its own.
  // A gradient background cannot be interpolated, so per-link highlights can
  // only ever pop; a single element can move, and moving is what reads as
  // smooth. Measured in a layout effect so the first paint is already correct.
  useLayoutEffect(() => {
    const list = listRef.current
    const target = active && list?.querySelector(`[data-section="${active}"]`)
    if (!target) {
      previousLeft.current = null
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

  // Surface tension: the highlight stretches along the direction of travel and
  // relaxes once it lands, the way a drop of liquid does. Longer hops stretch
  // further. Skipped entirely when the pill is only being re-measured in place.
  const pillLeft = pill?.left ?? null
  useLayoutEffect(() => {
    const element = pillRef.current
    const from = previousLeft.current
    previousLeft.current = pillLeft

    if (!element || pillLeft == null || from == null || reducedMotion) return
    const distance = Math.abs(pillLeft - from)
    if (distance < 4) return

    element.style.setProperty('--stretch', String(1 + Math.min(distance / 900, MAX_STRETCH)))
    const timer = setTimeout(
      () => element.style.setProperty('--stretch', '1'),
      STRETCH_RELEASE_MS
    )
    return () => clearTimeout(timer)
  }, [pillLeft, reducedMotion])

  const minimized = scrolled && direction === 'down'
  const barClass = [
    styles.bar,
    scrolled ? styles.barScrolled : '',
    minimized ? styles.barMinimized : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={`${styles.wrap} ${scrolled ? styles.wrapScrolled : ''}`}>
      <nav
        aria-label="Main"
        ref={barRef}
        className={barClass}
        onPointerMove={trackLight}
        onPointerLeave={releaseLight}
      >
        <Link to="/" className={styles.brand} aria-label="Jesus Velazquez, back to top">
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
              ref={pillRef}
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
