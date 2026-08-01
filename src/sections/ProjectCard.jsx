import { Link } from 'react-router-dom'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')
  const href = `/work/${project.slug}`

  return (
    <article className={styles.card}>
      {/* Two groups so the panel can distribute them against the image's
          height: identity at the top, stack and CTA anchored to the bottom. */}
      <Link to={href} className={styles.copy}>
        <div>
          <span className={styles.number}>{number}</span>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.role}>
            {project.role} · {project.year}
          </p>
          <p className={styles.tagline}>{project.tagline}</p>
        </div>

        <div className={styles.copyFooter}>
          <StackChips items={project.stack} />
          <span className={styles.cta}>Explore the project →</span>
        </div>
      </Link>

      {/* The screenshot is its own link so the copy beside it is free to size
          to its own content instead of stretching to the image's height. It
          points at the same place as the link above, so it stays out of the
          tab order and the accessibility tree rather than duplicating it. */}
      <Link
        to={href}
        className={`${styles.mediaWrap} ${styles.mediaOrder}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProjectImage
          src={project.thumb}
          alt={`${project.title} screenshot`}
          label={project.title}
          className={styles.media}
        />
      </Link>
    </article>
  )
}
