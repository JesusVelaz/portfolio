import { useState } from 'react'
import styles from './ProjectImage.module.css'

export function ProjectImage({
  src,
  alt,
  label,
  captionTitle,
  caption,
  width,
  height,
  ratio,
  natural = false,
  contain = false,
  compact = false,
  split = false,
  className = '',
}) {
  const [failed, setFailed] = useState(false)
  const CaptionHeading = compact ? 'h4' : 'h3'
  const frameRatio = ratio ?? (width && height ? width / height : null)

  return (
    <figure
      className={[styles.figure, compact && styles.compact, split && styles.split, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={`${styles.frame} ${natural ? styles.natural : ''} ${contain ? styles.contain : ''}`}
        style={
          frameRatio ? { aspectRatio: String(frameRatio), '--ratio': String(frameRatio) } : undefined
        }
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
            width={width}
            height={height}
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
