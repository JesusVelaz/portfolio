import { useEffect, useState } from 'react'
import { mostVisible } from '../lib/mostVisible.js'

/**
 * The id of the section currently filling most of the reading band, or null
 * when nothing qualifies yet.
 *
 * `enabled` exists because the nav outlives the route: on a project page the
 * sections aren't in the document at all, so an observer set up there would
 * find nothing to watch and — with only `ids` in the dependencies — would
 * never be rebuilt when the home page mounted underneath it. Passing the route
 * in means the observer is torn down and re-established as sections come and
 * go, instead of reporting whatever it last knew forever.
 */
export function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (!enabled) {
      // Coming back should re-measure, not restore a stale highlight.
      setActive(null)
      return
    }
    if (typeof IntersectionObserver === 'undefined') return

    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (elements.length === 0) return

    const seen = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e))
        const next = mostVisible([...seen.values()])
        if (next) setActive(next)
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-20% 0px -35% 0px' }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids, enabled])

  return enabled ? active : null
}
