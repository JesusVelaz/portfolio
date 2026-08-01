import { Link } from 'react-router-dom'
import profile from '../data/profile.js'
import { Starfield } from '../components/Starfield.jsx'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section id="hero" className={`${styles.hero} container-wide`}>
      <div className={styles.primary}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{profile.role} · Full-Stack </p>
          <h1 className={styles.name}>
            <span>{profile.name}</span>
            {profile.headline}
          </h1>
          <p className={styles.intro}>{profile.intro}</p>

          <div className={styles.ctas}>
            <Link to="/#work" className={`${styles.btn} ${styles.btnPrimary}`}>
              View my work
            </Link>
            <Link to="/#contact" className={`${styles.btn} ${styles.btnGhost}`}>
              Get in touch
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <Starfield />
          <p className={styles.visualCaption}>
            I design the interface and the systems underneath it.
          </p>
        </div>
      </div>

      <div className={styles.proof} aria-label="Selected career highlights">
        {profile.highlights.map((highlight) => (
          <article className={styles.proofCard} key={highlight.label}>
            <strong>{highlight.value}</strong>
            <span>{highlight.label}</span>
            <p>{highlight.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
