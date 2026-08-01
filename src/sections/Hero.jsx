import { Link } from 'react-router-dom'
import profile from '../data/profile.js'
import { FlowCanvas } from '../components/FlowCanvas.jsx'
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
          <FlowCanvas />
        </div>
      </div>

      <div className={styles.capabilities} aria-label="Engineering capabilities">
        <div className={styles.capabilitiesIntro}>
          <p className={styles.capabilitiesEyebrow}>What I bring</p>
          <h2 className={styles.capabilitiesTitle}>From an ambiguous workflow to a durable product.</h2>
        </div>

        <div className={styles.capabilityList}>
          {profile.capabilities.map((capability, index) => (
            <article className={styles.capabilityCard} key={capability.label}>
              <span className={styles.capabilityNumber}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className={styles.capabilityLabel}>{capability.label}</p>
                <h3 className={styles.capabilityTitle}>{capability.title}</h3>
                <p className={styles.capabilityDetail}>{capability.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
