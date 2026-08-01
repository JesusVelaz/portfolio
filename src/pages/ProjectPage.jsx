import { Link, useParams } from 'react-router-dom'
import { getProject } from '../data/projects.js'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import { Reveal } from '../components/Reveal.jsx'
import NotFound from './NotFound.jsx'
import styles from './ProjectPage.module.css'

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <NotFound />

  return (
    <article className={`${styles.page} container`}>
      <Reveal>
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
              className={`${styles.linkBtn} ${styles.linkGhost}`}
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
            >
              View source ↗
            </a>
          )}
        </div>
      </Reveal>

      {project.story ? (
        <>
          <Reveal>
            <section className={styles.story} aria-labelledby="project-story-title">
              <p className={styles.storyEyebrow}>{project.story.eyebrow}</p>
              <h2 id="project-story-title" className={styles.storyHeadline}>
                {project.story.headline}
              </h2>
              <p className={styles.storySummary}>{project.story.summary}</p>

              <div className={styles.pillars}>
                {project.story.pillars.map((pillar) => (
                  <div className={styles.pillar} key={pillar.number}>
                    <span className={styles.pillarNumber}>{pillar.number}</span>
                    <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                    <p className={styles.pillarText}>{pillar.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <section className={styles.product} aria-labelledby="product-title">
            <Reveal>
              <p className={styles.storyEyebrow}>Inside the product</p>
              <h2 id="product-title" className={styles.productTitle}>
                One connected workflow, from signature to follow-up.
              </h2>
            </Reveal>

            <div className={styles.compactShots}>
              {project.screenshots.map((shot, i) => (
                <Reveal key={shot.src} delay={(i % 2) * 0.06}>
                  <ProjectImage
                    src={shot.src}
                    alt={shot.alt}
                    label={project.title}
                    captionTitle={shot.title}
                    caption={shot.caption}
                    contain
                    compact
                  />
                </Reveal>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <Reveal>
            <ProjectImage
              src={project.screenshots[0]?.src ?? project.thumb}
              alt={project.screenshots[0]?.alt ?? `${project.title} screenshot`}
              label={project.title}
              captionTitle={project.screenshots[0]?.title}
              caption={project.screenshots[0]?.caption}
              natural
              className={styles.hero}
            />
          </Reveal>

          <div className={styles.body}>
            <Reveal>
              <h2 className={styles.blockTitle}>The problem</h2>
              <p className={styles.prose}>{project.problem}</p>
            </Reveal>

            <Reveal>
              <h2 className={styles.blockTitle}>What I built</h2>
              <p className={styles.prose}>{project.whatIBuilt}</p>
            </Reveal>

            <Reveal>
              <h2 className={styles.blockTitle}>Highlights</h2>
              <ul className={styles.highlights}>
                {project.highlights.map((h) => (
                  <li key={h} className={styles.highlight}>
                    {h}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {project.screenshots.length > 1 && (
            <div className={styles.shots}>
              {project.screenshots.slice(1).map((shot, i) => (
                <Reveal key={shot.src} delay={i * 0.06}>
                  <ProjectImage
                    src={shot.src}
                    alt={shot.alt}
                    label={project.title}
                    captionTitle={shot.title}
                    caption={shot.caption}
                    natural
                    className={styles.shot}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </>
      )}

      <Reveal className={styles.next}>
        <Link to="/#work" className={styles.back}>
          ← Back to all work
        </Link>
      </Reveal>
    </article>
  )
}
