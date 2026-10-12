import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getProject } from '../data/projects.js'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { useActiveSection } from '../hooks/useActiveSection.js'
import NotFound from './NotFound.jsx'
import styles from './ProjectPage.module.css'

const aspectRatio = (shot) => (shot.width && shot.height ? shot.width / shot.height : null)
const sectionId = (section) => `gallery-${section.id}`
const number = (i) => String(i + 1).padStart(2, '0')

// A side rail holds the project's details and a list of its sections, and
// stays put while the screenshots scroll beside it — so the gallery starts at
// the top of the page instead of under a cover. On narrow screens the rail
// becomes a short header and the section list is dropped.
export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)
  const ids = useMemo(() => (project ? project.gallerySections.map(sectionId) : []), [project])
  const active = useActiveSection(ids, Boolean(project))

  if (!project) return <NotFound />

  return (
    <article className={`${styles.page} container-wide`}>
      <div className={styles.layout}>
        <aside className={styles.rail}>
          <Link to="/#work" className={styles.back}>
            ← All work
          </Link>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.tagline}>{project.tagline}</p>
          <div className={styles.meta}>
            <span>{project.role}</span>
            <span>{project.year}</span>
          </div>
          <StackChips items={project.stack} />
          <div className={styles.links}>
            {project.liveUrl && (
              <a
                className={`${styles.linkBtn} ${styles.linkPrimary}`}
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
              >
                Visit live site ↗
              </a>
            )}
            {project.repoUrl && (
              <a
                className={`${styles.linkBtn} ${styles.linkSecondary}`}
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
              >
                View source ↗
              </a>
            )}
          </div>

          <nav className={styles.toc} aria-label="Sections">
            <ol>
              {project.gallerySections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${sectionId(section)}`}
                    aria-current={active === sectionId(section) ? 'true' : undefined}
                  >
                    <span className={styles.tocNumber}>{number(i)}</span>
                    {section.name}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <div className={styles.gallery}>
          {project.gallerySections.map((section, i) => (
            <section
              key={section.id}
              id={sectionId(section)}
              className={styles.gallerySection}
              aria-labelledby={`${sectionId(section)}-title`}
            >
              <header className={styles.sectionHeader}>
                <h2 id={`${sectionId(section)}-title`} className={styles.sectionTitle}>
                  <span className={styles.sectionNumber}>{number(i)}</span>
                  {section.name}
                </h2>
                <p className={styles.sectionDescription}>{section.description}</p>
              </header>

              <div className={styles.shots}>
                {project.screenshots
                  .filter((shot) => shot.group === section.id)
                  .map((shot) => (
                    <Reveal key={shot.src}>
                      <ProjectImage
                        src={shot.src}
                        alt={shot.alt}
                        label={project.title}
                        captionTitle={shot.title}
                        caption={shot.caption}
                        captionAs="h3"
                        width={shot.width}
                        height={shot.height}
                        ratio={aspectRatio(shot)}
                        contain
                        compact
                        split
                      />
                    </Reveal>
                  ))}
              </div>
            </section>
          ))}

          <Link to="/#work" className={`${styles.back} ${styles.next}`}>
            ← Back to all work
          </Link>
        </div>
      </div>
    </article>
  )
}
