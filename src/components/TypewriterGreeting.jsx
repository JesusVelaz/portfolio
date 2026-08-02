import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './TypewriterGreeting.module.css'

export const GREETINGS = ['Hello,', 'Hola,', 'Bonjour,', 'こんにちは,', 'Olá,']

const HOLD_MS = 1450
const DELETE_MS = 70
const TYPE_MS = 105
const BETWEEN_MS = 280

export function TypewriterGreeting() {
  const reducedMotion = useReducedMotion()
  const [greetingIndex, setGreetingIndex] = useState(0)
  const [characterCount, setCharacterCount] = useState(Array.from(GREETINGS[0]).length)
  const [phase, setPhase] = useState('holding')
  const characters = useMemo(() => Array.from(GREETINGS[greetingIndex]), [greetingIndex])

  useEffect(() => {
    if (reducedMotion) return undefined

    let delay = HOLD_MS
    let next = () => setPhase('deleting')

    if (phase === 'deleting') {
      delay = characterCount > 0 ? DELETE_MS : BETWEEN_MS
      next = () => {
        if (characterCount > 0) {
          setCharacterCount((count) => count - 1)
          return
        }

        setGreetingIndex((index) => (index + 1) % GREETINGS.length)
        setPhase('typing')
      }
    }

    if (phase === 'typing') {
      delay = TYPE_MS
      next = () => {
        const nextCount = characterCount + 1
        setCharacterCount(nextCount)
        if (nextCount >= characters.length) setPhase('holding')
      }
    }

    const timer = window.setTimeout(next, delay)
    return () => window.clearTimeout(timer)
  }, [characterCount, characters.length, phase, reducedMotion])

  const visibleGreeting = reducedMotion
    ? GREETINGS[0]
    : characters.slice(0, characterCount).join('')

  return (
    <span className={styles.typewriter} data-testid="typed-greeting" aria-hidden="true">
      <span>{visibleGreeting}</span>
      {!reducedMotion && <span className={styles.cursor} aria-hidden="true" />}
    </span>
  )
}
