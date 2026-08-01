import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StackChips } from '../components/StackChips.jsx'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')
  const [isPreviewing, setIsPreviewing] = useState(false)
  const previewImages = useMemo(() => {
    const screenshots = project.screenshots ?? []
    const ordered = screenshots.some((image) => image.src === project.thumb)
      ? screenshots
      : [
          {
            src: project.thumb,
            alt: `${project.title} screenshot`,
            title: 'Project overview',
          },
          ...screenshots,
        ]

    return ordered
      .filter(
        (image, imageIndex) =>
          ordered.findIndex((candidate) => candidate.src === image.src) === imageIndex
      )
      .slice(0, 2)
  }, [project])

  const showPreview = () => setIsPreviewing(previewImages.length > 1)
  const resetPreview = () => setIsPreviewing(false)

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) resetPreview()
  }

  const activeIndex = isPreviewing ? 1 : 0
  const activeImage = previewImages[activeIndex]

  return (
    <article
      className={styles.card}
      onMouseEnter={showPreview}
      onMouseLeave={resetPreview}
      onFocusCapture={showPreview}
      onBlurCapture={handleBlur}
    >
      <div className={styles.intro}>
        <span className={styles.number}>{number}</span>
        {/* The card's only link, so it is named by the project rather than by
            a CTA that reads identically on every card. Its ::after covers the
            whole panel, which is what makes the card clickable. */}
        <h3 className={styles.title}>
          <Link to={`/work/${project.slug}`} className={styles.titleLink}>
            {project.title}
          </Link>
        </h3>
        <p className={styles.role}>
          {project.role} · {project.year}
        </p>
        <p className={styles.tagline}>{project.tagline}</p>
      </div>

      <div
        className={styles.mediaWrap}
        role="img"
        aria-label={`${project.title} project screenshots`}
      >
        {previewImages.map((image, imageIndex) => (
          <img
            key={image.src}
            src={image.src}
            alt=""
            aria-hidden="true"
            loading={imageIndex === 0 ? 'eager' : 'lazy'}
            className={`${styles.media} ${
              imageIndex === activeIndex ? styles.mediaActive : ''
            }`}
          />
        ))}

        {previewImages.length > 1 && (
          <div className={styles.teaserHud} aria-hidden="true">
            <span className={styles.teaserTitle}>{activeImage.title}</span>
            <span className={styles.teaserCta}>
              View full case study <span aria-hidden="true">→</span>
            </span>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <StackChips items={project.stack} />
        <span className={styles.cta}>Explore the project →</span>
      </div>
    </article>
  )
}
