import { useScrollProgress } from '../hooks/useScrollProgress.js'
import SoftwareLifecycleCanvas from './SoftwareLifecycleCanvas.jsx'
import styles from './HeroStage.module.css'

export function HeroStage({ trackRef }) {
  const progressRef = useScrollProgress(trackRef)

  return (
    <div className={styles.stage} aria-hidden="true">
      <SoftwareLifecycleCanvas progressRef={progressRef} />
    </div>
  )
}
