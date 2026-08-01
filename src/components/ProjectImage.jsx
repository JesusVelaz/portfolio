import { useState } from 'react'
import styles from './ProjectImage.module.css'

export function ProjectImage({
  src,
  alt,
  label,
  captionTitle,
  caption,
  natural = false,
  contain = false,
  compact = false,
  className = '',
}) {
  const [failed, setFailed] = useState(false)
  const CaptionHeading = compact ? 'h4' : 'h3'

  return (
    <figure className={`${styles.figure} ${compact ? styles.compact : ''} ${className}`}>
      <div
        className={`${styles.frame} ${natural ? styles.natural : ''} ${contain ? styles.contain : ''}`}
      >
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
      {(captionTitle || caption) && (
        <figcaption className={styles.caption}>
          {captionTitle && (
            <CaptionHeading className={styles.captionTitle}>{captionTitle}</CaptionHeading>
          )}
          {caption && <p className={styles.captionText}>{caption}</p>}
        </figcaption>
      )}
    </figure>
  )
}
