import { Component, Suspense, lazy, useState } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress.js'
import styles from './HeroStage.module.css'

const RoadScene = lazy(() => import('./RoadScene.jsx'))

// Probed once during initial render. Where WebGL is unavailable the scene
// chunk is never fetched at all, so those visitors do not pay for a library
// they cannot run.
export function supportsWebGL() {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!context) return false

    // The probe owns a real WebGL context. Release it immediately so route
    // changes do not slowly exhaust the browser's context limit before the
    // actual Three.js renderer is even created.
    context.getExtension?.('WEBGL_lose_context')?.loseContext()
    return true
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
  const [enabled] = useState(supportsWebGL)

  const placeholder = <div className={styles.placeholder} />

  return (
    <div className={styles.stage} aria-hidden="true">
      {enabled ? (
        <SceneBoundary fallback={placeholder}>
          <Suspense fallback={placeholder}>
            <RoadScene progressRef={progressRef} />
          </Suspense>
        </SceneBoundary>
      ) : (
        placeholder
      )}
    </div>
  )
}
