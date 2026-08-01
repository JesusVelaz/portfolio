import { useState } from 'react'
import styles from './ProjectImage.module.css'

export function ProjectImage({ src, alt, label, caption, natural = false, className = '' }) {
  const [failed, setFailed] = useState(false)

  return (
    <figure className={`${styles.figure} ${className}`}>
      <div className={`${styles.frame} ${natural ? styles.natural : ''}`}>
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
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  )
}
