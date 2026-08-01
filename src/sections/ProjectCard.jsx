import { Link } from 'react-router-dom'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <article className={styles.card}>
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

      <div className={styles.mediaWrap}>
        <ProjectImage
          src={project.thumb}
          alt={`${project.title} screenshot`}
          label={project.title}
          className={styles.media}
        />
      </div>

      <div className={styles.footer}>
        <StackChips items={project.stack} />
        <span className={styles.cta}>Explore the project →</span>
      </div>
    </article>
  )
}
