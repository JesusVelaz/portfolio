import { useState } from 'react'
import styles from './ProjectImage.module.css'

export function ProjectImage({ src, alt, label, className = '' }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`${styles.frame} ${className}`}>
      {failed || !src ? (
        <div className={styles.fallback}>
          <span className={styles.fallbackLabel}>{label ?? alt}</span>
        </div>
      ) : (
        <img
          className={styles.img}
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
