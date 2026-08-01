import { Link } from 'react-router-dom'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import styles from './ProjectCard.module.css'

// The detail page's gallery sections are already a tour of what the product
// does, and their eyebrows are the short form of it — "02 / Capture" and so
// on. Reusing them here fills the card with real capability names instead of
// a second paragraph, and keeps the card and its page telling one story.
function capabilities(project) {
  return (project.gallerySections ?? []).map((section) =>
    section.eyebrow.replace(/^\s*\d+\s*\/\s*/, '')
  )
}

export function ProjectCard({ project, index }) {
  const number = String(index + 1).padStart(2, '0')
  const areas = capabilities(project)

  return (
    <Link to={`/work/${project.slug}`} className={styles.card}>
      <div className={styles.copy}>
        <div>
          <span className={styles.number}>{number}</span>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.role}>
            {project.role} · {project.year}
          </p>
          <p className={styles.tagline}>{project.tagline}</p>
        </div>

        {areas.length > 0 && (
          <div className={styles.areasBlock}>
            <p className={styles.areasLabel}>Inside</p>
            <ul className={styles.areas}>
              {areas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.footer}>
          <StackChips items={project.stack} />
          <span className={styles.cta}>Explore the project →</span>
        </div>
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
