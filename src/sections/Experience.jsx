import experience from '../data/experience.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <section id="experience" className={`${styles.section} container-wide`}>
      <Reveal className="section-heading">
        <div>
          <p className={styles.eyebrow}>03 — Experience</p>
          <h2 className={styles.heading}>Building across product and platform.</h2>
        </div>
        <p className={styles.lede}>
          Three environments, one consistent focus: understanding what the software needs to make
          easier for the people relying on it.
        </p>
      </Reveal>

      <div className={styles.roles}>
        {experience.map((role, index) => (
          <Reveal key={`${role.company}-${role.role}`}>
            <article className={styles.entry}>
              <header className={styles.entryHeader}>
                <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <p className={styles.dates}>
                    {role.start} — {role.end ?? 'Present'}
                  </p>
                  <h3 className={styles.role}>{role.role}</h3>
                  {role.url ? (
                    <a className={styles.company} href={role.url} target="_blank" rel="noreferrer">
                      {role.company} ↗
                    </a>
                  ) : (
                    <span className={styles.company}>{role.company}</span>
                  )}
                </div>
              </header>

              <div className={styles.entryBody}>
                <p className={styles.summary}>{role.summary}</p>
                <ul className={styles.focus} aria-label={`${role.company} focus areas`}>
                  <li className={styles.metric}>{role.metric}</li>
                  {role.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
