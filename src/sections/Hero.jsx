import { Link } from 'react-router-dom'
import profile from '../data/profile.js'
import { FlowField } from '../components/FlowField.jsx'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section id="hero" className={`${styles.hero} container-wide`}>
      <div className={styles.layout}>
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

          <Link to="/#work" className={styles.scrollCue} aria-label="Scroll to selected work">
            <span className={styles.scrollArrow} aria-hidden="true">
              {/* An SVG rather than the ↓ character: a glyph's ink sits off-centre
                  in its em box, so centring the text box does not centre the arrow. */}
              <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                <path
                  d="M12 4.5v14M5.5 12.5 12 19l6.5-6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>

        <FlowField />
      </div>
    </section>
  )
}
