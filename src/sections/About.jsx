import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={`${styles.section} container`}>
      <div className={styles.grid}>
        <Reveal>
          <p className={styles.eyebrow}>About</p>
          <h2 className={styles.heading}>Who I am</h2>
          <p className={styles.blurb}>{profile.blurb}</p>
          {profile.resumeUrl && (
            <a className={styles.resume} href={profile.resumeUrl} target="_blank" rel="noreferrer">
              View resume ↗
            </a>
          )}
        </Reveal>

        <div className={styles.skills}>
          {profile.skills.map((group, i) => (
            <Reveal key={group.group} delay={i * 0.06}>
              <p className={styles.groupName}>{group.group}</p>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li key={item} className={styles.item}>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
