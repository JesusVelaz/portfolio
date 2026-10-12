import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './CardCarousel.module.css'

// A project card's screenshots, one at a time. The track is a native
// scroll-snap strip, so touch swiping needs no script; the arrows and dots
// drive the same strip.
//
// The card is one big link (its title's ::after covers the panel), which would
// swallow swipes on the images. So the carousel sits above that overlay, and
// each slide is its own link to the same page: tapping a screenshot still opens
// the case study. Those slide links stay out of the tab order and the
// accessibility tree, since the card title already is that link.
export function CardCarousel({ slides, to, title, trackClassName = '' }) {
  const trackRef = useRef(null)
  // While a button-driven scroll is in flight, the strip passes over every
  // slide in between; this holds the label on the destination instead.
  const targetRef = useRef(null)
  const [active, setActive] = useState(0)
  const reduced = useReducedMotion()
  const count = slides.length

  const go = (index) => {
    const next = (index + count) % count
    const track = trackRef.current
    targetRef.current = next
    setActive(next)
    track?.scrollTo?.({ left: next * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' })
  }

  const onScroll = () => {
    const track = trackRef.current
    if (!track?.clientWidth) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    if (targetRef.current !== null) {
      if (index === targetRef.current) targetRef.current = null
      return
    }
    setActive(index)
  }

  return (
    <div
      className={styles.carousel}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${title} screenshots`}
    >
      <div
        ref={trackRef}
        className={`${styles.track} ${trackClassName}`}
        onScroll={onScroll}
        // A swipe or trackpad scroll hands control back from any button target.
        onPointerDown={() => (targetRef.current = null)}
        onWheel={() => (targetRef.current = null)}
      >
        {slides.map((slide, i) => (
          <Link
            key={slide.src}
            to={to}
            className={styles.slide}
            tabIndex={-1}
            aria-hidden="true"
            draggable={false}
          >
            <img
              src={slide.src}
              alt=""
              loading={i === 0 ? undefined : 'lazy'}
              draggable={false}
            />
          </Link>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.prev}`}
            aria-label="Previous screenshot"
            onClick={() => go(active - 1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.next}`}
            aria-label="Next screenshot"
            onClick={() => go(active + 1)}
          >
            <span aria-hidden="true">›</span>
          </button>

          <div className={styles.footer}>
            <span className={styles.label} aria-live="polite">
              {slides[active].title}
            </span>
            <span className={styles.dots}>
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  className={styles.dot}
                  aria-label={`Show ${slide.title}`}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => go(i)}
                />
              ))}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
