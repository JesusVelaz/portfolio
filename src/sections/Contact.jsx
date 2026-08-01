import profile from '../data/profile.js'
import { Reveal } from '../components/Reveal.jsx'
import styles from './Contact.module.css'

export function Contact() {
  return (
    <section id="contact" className={`${styles.section} container-wide`}>
      <Reveal>
        <p className={styles.eyebrow}>04 — Contact</p>
        <h2 className={styles.heading}>Let&rsquo;s talk</h2>
        <p className={styles.lede}>
          Open to interesting engineering work and always happy to talk shop. The fastest way to
          reach me is email.
        </p>

        <div className={styles.card}>
          <span className={styles.email}>{profile.email}</span>
          <a className={styles.go} href={`mailto:${profile.email}`}>
            Send an email
          </a>
        </div>

        <div className={styles.socials}>
          {profile.socials.map((s) => (
            <a
              key={s.label}
              className={styles.social}
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              {s.label} ↗
            </a>
          ))}
        </div>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} {profile.name}
        </footer>
      </Reveal>
    </section>
  )
}
