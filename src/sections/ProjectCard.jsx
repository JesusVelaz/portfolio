import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StackChips } from '../components/StackChips.jsx'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')
  const reducedMotion = useReducedMotion()
  const [isCycling, setIsCycling] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
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

    return ordered.filter(
      (image, imageIndex) =>
        ordered.findIndex((candidate) => candidate.src === image.src) === imageIndex
    )
  }, [project])

  useEffect(() => {
    if (!isCycling || reducedMotion || previewImages.length < 2) return undefined

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % previewImages.length)
    }, 1500)

    return () => window.clearInterval(interval)
  }, [isCycling, previewImages.length, reducedMotion])

  const startCarousel = () => {
    if (!reducedMotion && previewImages.length > 1) setIsCycling(true)
  }

  const resetCarousel = () => {
    setIsCycling(false)
    setActiveIndex(0)
  }

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) resetCarousel()
  }

  const activeImage = previewImages[activeIndex]

  return (
    <article
      className={styles.card}
      onMouseEnter={startCarousel}
      onMouseLeave={resetCarousel}
      onFocusCapture={startCarousel}
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
          <div className={styles.carouselHud} aria-hidden="true">
            <span className={styles.carouselTitle}>{activeImage.title}</span>
            <span className={styles.carouselProgress}>
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(previewImages.length).padStart(2, '0')}
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
