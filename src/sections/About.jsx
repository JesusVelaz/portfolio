import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={`${styles.section} container`}>
      <Reveal className="section-heading">
        <div>
          <p className={styles.eyebrow}>About</p>
          <h2 className={styles.heading}>How I approach the work.</h2>
        </div>
        <p className={styles.blurb}>{profile.blurb}</p>
      </Reveal>

      <div className={styles.storyGrid}>
        <Reveal>
          <p className={styles.storyLabel}>Background</p>
        </Reveal>
        <div className={styles.story}>
          {profile.story.map((paragraph) => (
            <Reveal key={paragraph}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
          {profile.resumeUrl && (
            <a className={styles.resume} href={profile.resumeUrl} target="_blank" rel="noreferrer">
              View resume ↗
            </a>
          )}
        </div>
      </div>

      <div className={styles.principles}>
        {profile.principles.map((principle) => (
          <Reveal key={principle.number}>
            <article className={styles.principle}>
              <span>{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.detail}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className={styles.skillsHeader}>
          <p className={styles.storyLabel}>Technical toolkit</p>
          <p>Technologies I use to move comfortably from interface to infrastructure.</p>
        </div>
      </Reveal>

      <div className={styles.skills}>
        {profile.skills.map((group) => (
          <Reveal key={group.group}>
            <div className={styles.skillGroup}>
              <p className={styles.groupName}>{group.group}</p>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
