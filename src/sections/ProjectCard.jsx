import { Link } from 'react-router-dom'
import { CardCarousel } from '../components/CardCarousel.jsx'
import { cardSlides } from '../data/projects.js'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index, featured = false }) {
  const number = String(index + 1).padStart(2, '0')
  const to = `/work/${project.slug}`

  return (
    <article className={`${styles.card} ${featured ? '' : styles.compact}`}>
      <div>
        <span className={styles.number}>{number}</span>
        {/* The card's only link, so it is named by the project rather than by
            a CTA that reads identically on every card. Its ::after covers the
            whole panel, which is what makes the card clickable. */}
        <h3 className={styles.title}>
          <Link to={to} className={styles.titleLink}>
            {project.title}
          </Link>
        </h3>
        <p className={styles.role}>
          {project.role} · {project.year}
        </p>
        <p className={styles.tagline}>{project.tagline}</p>
      </div>

      <div className={styles.mediaWrap}>
        <CardCarousel
          slides={cardSlides(project)}
          to={to}
          title={project.title}
          trackClassName={styles.media}
        />
      </div>

      <div className={styles.footer}>
        <span className={styles.cta}>
          Explore the project
          <span className={styles.ctaArrow} aria-hidden="true">
            →
          </span>
        </span>
      </div>
    </article>
  )
}
