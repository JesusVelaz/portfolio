import experience, { education } from '../data/experience.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <section id="experience" className={`${styles.section} container`}>
      <Reveal className="section-heading">
        <div>
          <p className={styles.eyebrow}>Experience</p>
          <h2 className={styles.heading}>Building across product and platform.</h2>
        </div>
        <p className={styles.lede}>
          My experience spans public-sector software, early-stage product ownership, and operational
          web systems. The common thread is turning complexity into dependable tools.
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
                <div className={styles.metric}>{role.metric}</div>
                <ul className={styles.bullets}>
                  {role.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <ul className={styles.focus} aria-label={`${role.company} focus areas`}>
                  {role.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <aside className={styles.education}>
          <div>
            <p className={styles.eyebrow}>Education</p>
            <h3>{education.degree}</h3>
          </div>
          <div>
            <p>{education.school}</p>
            <span>
              Graduated {education.graduated} · {education.detail}
            </span>
          </div>
        </aside>
      </Reveal>
    </section>
  )
}
