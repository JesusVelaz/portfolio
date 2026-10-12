import projects from '../data/projects.js'
import { Reveal } from '../components/Reveal.jsx'
import { ProjectCard } from './ProjectCard.jsx'
import styles from './Work.module.css'

export function Work() {
  return (
    <section id="work" className={`${styles.section} container-wide`}>
      <Reveal className={styles.intro}>
        <p className={styles.eyebrow}>01 — Selected work</p>
        <h2 className={styles.heading}>Products built around real constraints.</h2>
        <p className={styles.lede}>
          Products created for different audiences and stages of my career. Each case study starts
          with the person it serves and the problem it is meant to solve.
        </p>
      </Reveal>

      <ul className={styles.list}>
        {projects.map((project, i) => {
          // The first project leads at full width; the rest pair up beneath it.
          // A project left without a partner takes the full row too, rather
          // than sitting alone at half width.
          const wide = i === 0 || (i === projects.length - 1 && i % 2 === 1)
          return (
            <Reveal
              as="li"
              key={project.slug}
              delay={(wide ? 0 : (i - 1) % 2) * 0.06}
              className={wide ? styles.wide : undefined}
              data-layout={wide ? 'wide' : 'pair'}
            >
              <ProjectCard project={project} index={i} featured={wide} />
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
