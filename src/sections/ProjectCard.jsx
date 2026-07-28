import { Link } from 'react-router-dom'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import styles from './ProjectCard.module.css'

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')

  return (
    <Link to={`/work/${project.slug}`} className={styles.card}>
      <div>
        <span className={styles.number}>{number}</span>
        <h3 className={styles.title}>{project.title}</h3>
        <p className={styles.role}>
          {project.role} · {project.year}
        </p>
        <p className={styles.tagline}>{project.tagline}</p>
        <StackChips items={project.stack} />
        <span className={styles.cta}>Explore the problem →</span>
      </div>

      <div className={`${styles.mediaWrap} ${styles.mediaOrder}`}>
        <ProjectImage
          src={project.thumb}
          alt={`${project.title} screenshot`}
          label={project.title}
          className={styles.media}
        />
      </div>
    </Link>
  )
}
