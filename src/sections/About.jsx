import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import { SkillGrid } from '../components/SkillGrid.jsx'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={`${styles.section} container-wide`}>
      <Reveal className="section-heading">
        <div>
          <p className={styles.eyebrow}>02 — About</p>
          <h2 className={styles.heading}>How I approach the work.</h2>
        </div>
        <p className={styles.blurb}>{profile.blurb}</p>
      </Reveal>

      <div className={styles.storyGrid}>
        <Reveal className={styles.portraitColumn}>
          <p className={styles.storyLabel}>Background</p>
          <figure className={styles.portraitFrame}>
            <img
              className={styles.portrait}
              src="/profile/jesus-velazquez.png"
              alt="Jesus Velazquez"
              width="1290"
              height="1243"
              loading="lazy"
            />
          </figure>
        </Reveal>
        <div className={styles.story}>
          {profile.story.map((paragraph) => (
            <Reveal key={paragraph}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
          {profile.resumeUrl && (
            <a className={styles.resume} href={profile.resumeUrl} target="_blank" rel="noreferrer">
              View résumé ↗
            </a>
          )}
        </div>
      </div>

      <Reveal>
        <div className={styles.skillsHeader}>
          <p className={styles.storyLabel}>Technical skills</p>
        </div>
      </Reveal>

      <SkillGrid />
    </section>
  )
}
