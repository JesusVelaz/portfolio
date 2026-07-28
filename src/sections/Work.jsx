import projects from '../data/projects.js'
import { Reveal } from '../components/Reveal.jsx'
import { ProjectCard } from './ProjectCard.jsx'
import styles from './Work.module.css'

export function Work() {
  return (
    <section id="work" className={`${styles.section} container`}>
      <Reveal>
        <p className={styles.eyebrow}>Selected work</p>
        <h2 className={styles.heading}>Products built around real constraints.</h2>
        <p className={styles.lede}>
          A commercial SaaS product and an earlier React application. Each case study focuses on
          the problem, the engineering decisions, and the part I owned.
        </p>
      </Reveal>

      <ul className={styles.list}>
        {projects.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 0.06}>
            <ProjectCard project={project} index={i} />
          </Reveal>
        ))}
      </ul>
    </section>
  )
}
