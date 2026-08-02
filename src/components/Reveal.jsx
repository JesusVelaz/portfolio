import { useEffect, useRef, useState } from 'react'

// Wraps content that should fade and rise as it scrolls into view.
//
// This uses IntersectionObserver rather than a CSS scroll timeline. Scroll
// timelines are cheaper on paper, but animation-timeline has no support in
// Firefox at all, and a reveal that silently does nothing in a whole browser
// is worse than one that costs a single observer callback. IntersectionObserver
// fires once per element and then disconnects — there is no per-frame work,
// which is the cost the Framer Motion removal was actually avoiding.
//
// The hidden state is applied by data-reveal, which only ever appears once this
// component has mounted and decided to animate. Nothing is hidden by a bare
// class, so a failure to observe leaves content visible rather than blank.
export function Reveal({ children, as = 'div', delay = 0, className, style, ...rest }) {
  const Tag = as
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Anything that would keep the element hidden forever resolves to shown.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }

    let responded = false

    const observer = new IntersectionObserver(
      ([entry]) => {
        responded = true
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      // Bottom margin holds the reveal until the element is properly in view
      // rather than firing on the first pixel to cross the edge.
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )

    observer.observe(el)

    // An observer always reports on its first pass, intersecting or not. If
    // nothing comes back at all, it is not running in this environment — reveal
    // the content rather than leave the page blank. Silence is the only signal
    // checked here, so a working observer still controls when things appear.
    const failsafe = setTimeout(() => {
      if (!responded) setShown(true)
    }, 600)

    return () => {
      clearTimeout(failsafe)
      observer.disconnect()
    }
  }, [])

  const classes = className ? `reveal ${className}` : 'reveal'
  const merged = delay ? { ...style, transitionDelay: `${delay}s` } : style

  return (
    <Tag ref={ref} className={classes} data-reveal={shown ? 'shown' : 'pending'} style={merged} {...rest}>
      {children}
    </Tag>
  )
}
