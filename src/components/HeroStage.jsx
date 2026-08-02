import { Component, Suspense, lazy, useRef } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress.js'
import styles from './HeroStage.module.css'

const AssemblyScene = lazy(() => import('./AssemblyScene.jsx'))

// Probed once, before anything is imported. Where WebGL is unavailable the
// scene chunk is never fetched at all, so those visitors do not pay for a
// library they cannot run.
function supportsWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// A failed dynamic import throws, and inside Suspense that would blank the
// hero. This is the one fallback here protecting content rather than
// decoration.
class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) return this.props.fallback
    return this.props.children
  }
}

export function HeroStage({ trackRef }) {
  const progressRef = useScrollProgress(trackRef)
  const enabled = useRef(supportsWebGL()).current

  const placeholder = <div className={styles.placeholder} />

  return (
    <div className={styles.stage} aria-hidden="true">
      {enabled ? (
        <SceneBoundary fallback={placeholder}>
          <Suspense fallback={placeholder}>
            <AssemblyScene progressRef={progressRef} />
          </Suspense>
        </SceneBoundary>
      ) : (
        placeholder
      )}
    </div>
  )
}
