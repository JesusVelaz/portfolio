import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import experience, { education } from '../data/experience.js'
import { Reveal } from '../components/Reveal.jsx'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Experience.module.css'

export function Experience() {
  const timelineRef = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 80%', 'end 60%'],
  })
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 })

  return (
    <section id="experience" className={`${styles.section} container`}>
      <Reveal>
        <p className={styles.eyebrow}>Experience</p>
        <h2 className={styles.heading}>Where I&rsquo;ve worked</h2>
      </Reveal>

      <div className={styles.timeline} ref={timelineRef}>
        <motion.div className={styles.rail} style={reduced ? { scaleY: 1 } : { scaleY }} />

        {experience.map((role, i) => (
          <Reveal key={`${role.company}-${role.role}`} delay={i * 0.06}>
            <article className={styles.entry}>
              <span className={`${styles.dot} ${role.end === null ? styles.dotCurrent : ''}`} />
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
              <ul className={styles.bullets}>
                {role.bullets.map((b) => (
                  <li key={b} className={styles.bullet}>
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}

        <Reveal delay={experience.length * 0.06}>
          <article className={styles.entry}>
            <span className={styles.dot} />
            <p className={styles.dates}>Graduated {education.graduated}</p>
            <h3 className={styles.role}>{education.degree}</h3>
            <span className={styles.company}>{education.school}</span>
            <p className={styles.eduDetail}>{education.detail}</p>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
