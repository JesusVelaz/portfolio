import projects from '../data/projects.js'
import { Reveal } from '../components/Reveal.jsx'
import { ProjectCard } from './ProjectCard.jsx'
import styles from './Work.module.css'

export function Work() {
  return (
    <section id="work" className={`${styles.section} container`}>
      <Reveal>
        <p className={styles.eyebrow}>Work</p>
        <h2 className={styles.heading}>Things I&rsquo;ve built</h2>
        <p className={styles.lede}>
          A shipped commercial product and the project that got me comfortable with React. Each one
          has a write-up covering the problem and what I actually built.
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
