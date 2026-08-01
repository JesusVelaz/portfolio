import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import { SkillGrid } from '../components/SkillGrid.jsx'
import styles from './About.module.css'

export function About() {
  return (
    <section id="about" className={`${styles.section} container-wide`}>
      <div className={styles.aboutGrid}>
        <Reveal className={styles.eyebrowBlock}>
          <p className={styles.eyebrow}>02 — About</p>
        </Reveal>

        <Reveal className={styles.titleBlock}>
          <h2 className={styles.heading}>How I approach the work.</h2>
        </Reveal>

        <Reveal className={styles.portraitBlock}>
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

        <div className={styles.detailsColumn}>
          <Reveal>
            <div className={styles.summaryBlock}>
              <p className={styles.storyLabel}>Background</p>
              <p className={styles.summary}>{profile.summary}</p>
              {profile.resumeUrl && (
                <a
                  className={styles.resume}
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View résumé ↗
                </a>
              )}
            </div>
          </Reveal>

          <Reveal>
            <div className={styles.skillsBlock}>
              <p className={styles.storyLabel}>Technical skills</p>
              <SkillGrid compact />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
