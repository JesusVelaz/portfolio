import { useEffect, useState } from 'react'

/**
 * Which way the page is currently moving, so navigation can recede while
 * someone reads down and come forward the moment they head back up.
 *
 * Rubber-banding and one-pixel jitter shouldn't flip the answer, so a move
 * only counts once it clears `threshold`, and the top `offset` of the page
 * always reads as 'up' — there is nothing to recede from up there.
 */
export function useScrollDirection({ threshold = 8, offset = 120 } = {}) {
  const [direction, setDirection] = useState('up')

  useEffect(() => {
    let last = Math.max(window.scrollY || 0, 0)
    let frame = 0

    const read = () => {
      frame = 0
      const y = Math.max(window.scrollY || 0, 0)

      if (y <= offset) {
        setDirection('up')
        last = y
        return
      }
      if (Math.abs(y - last) < threshold) return

      setDirection(y > last ? 'down' : 'up')
      last = y
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [threshold, offset])

  return direction
}
