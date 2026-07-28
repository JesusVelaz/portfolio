import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useReducedMotion } from '../hooks/useReducedMotion.js'

export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const reduced = useReducedMotion()

  useEffect(() => {
    const behavior = reduced ? 'auto' : 'smooth'

    if (hash) {
      const id = hash.slice(1)
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({ behavior, block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, reduced])

  return null
}
