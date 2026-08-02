import { useRef } from 'react'
import { useScrollProgress } from '../hooks/useScrollProgress.js'
import SoftwareLifecycleCanvas from './SoftwareLifecycleCanvas.jsx'
import styles from './HeroStage.module.css'

export function HeroStage({ trackRef, completionRef }) {
  const stageRef = useRef(null)
  const progressRef = useScrollProgress(trackRef, { completionRef, stageRef })

  return (
    <div ref={stageRef} className={styles.stage} aria-hidden="true">
      <SoftwareLifecycleCanvas progressRef={progressRef} />
    </div>
  )
}
