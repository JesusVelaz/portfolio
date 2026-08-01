import { Link, useParams } from 'react-router-dom'
import { getProject } from '../data/projects.js'
import { ProjectImage } from '../components/ProjectImage.jsx'
import { StackChips } from '../components/StackChips.jsx'
import { Reveal } from '../components/Reveal.jsx'
import NotFound from './NotFound.jsx'
import styles from './ProjectPage.module.css'

const aspectRatio = (shot) => (shot.width && shot.height ? shot.width / shot.height : null)

// Gallery shots pair up two to a row. A row's frames share one aspect ratio so
// they line up exactly; a shot left over at the end takes the full row on its own.
function toRows(shots) {
  const rows = []
  for (let i = 0; i < shots.length; i += 2) {
    rows.push(shots.slice(i, i + 2))
  }
  return rows
}

function rowRatio(row) {
  const ratios = row.map(aspectRatio).filter(Boolean)
  if (!ratios.length) return null
  return ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length
}

export default function ProjectPage() {
  const { slug } = useParams()
  const project = getProject(slug)

  if (!project) return <NotFound />

  return (
    <article className={`${styles.page} container-wide`}>
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

            <div className={styles.gallerySections}>
              {project.gallerySections.map((gallerySection) => {
                const sectionShots = project.screenshots.filter(
                  (shot) => shot.group === gallerySection.id
                )

                return (
                  <section
                    className={styles.gallerySection}
                    aria-labelledby={`gallery-${gallerySection.id}`}
                    key={gallerySection.id}
                  >
                    <Reveal>
                      <div className={styles.gallerySectionHeader}>
                        <div>
                          <p className={styles.storyEyebrow}>{gallerySection.eyebrow}</p>
                          <h3
                            id={`gallery-${gallerySection.id}`}
                            className={styles.gallerySectionTitle}
                          >
                            {gallerySection.title}
                          </h3>
                        </div>
                        <p className={styles.gallerySectionDescription}>
                          {gallerySection.description}
                        </p>
                      </div>
                    </Reveal>

                    <div className={styles.galleryRows}>
                      {toRows(sectionShots).map((row) => {
                        const isSolo = row.length === 1
                        const sharedRatio = rowRatio(row)

                        return (
                          <div
                            className={`${styles.galleryRow} ${isSolo ? styles.gallerySoloRow : ''}`}
                            key={row[0].src}
                          >
                            {row.map((shot, i) => (
                              <Reveal className={styles.galleryCell} key={shot.src} delay={i * 0.05}>
                                <ProjectImage
                                  src={shot.src}
                                  alt={shot.alt}
                                  label={project.title}
                                  captionTitle={shot.title}
                                  caption={shot.caption}
                                  width={shot.width}
                                  height={shot.height}
                                  ratio={isSolo ? aspectRatio(shot) : sharedRatio}
                                  contain
                                  compact
                                  split={isSolo}
                                />
                              </Reveal>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}
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
