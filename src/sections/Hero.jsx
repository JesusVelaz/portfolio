import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import profile from '../data/profile.js'
import { useReducedMotion } from '../hooks/useReducedMotion.js'
import styles from './Hero.module.css'

const NAME_WORDS = profile.name.split(' ')

export function Hero() {
  const reduced = useReducedMotion()

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduced ? 0 : 0.09,
        delayChildren: reduced ? 0 : 0.15,
      },
    },
  }

  const item = reduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
        show: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
        },
      }

  return (
    <section id="hero" className={`${styles.hero} container`}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.p variants={item} className={styles.eyebrow}>
          {profile.role}
        </motion.p>

        <h1 className={styles.name}>
          {NAME_WORDS.map((word, i) => (
            <Fragment key={word}>
              <motion.span variants={item} className={styles.word}>
                {word}
              </motion.span>
              {i < NAME_WORDS.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </h1>

        <motion.p variants={item} className={styles.tagline}>
          {profile.headline}
        </motion.p>

        <motion.p variants={item} className={styles.intro}>
          Backend systems for the Department of Defense by day, co-founder of Waiver Director the
          rest of the time. REST APIs, component libraries, and products people actually use.
        </motion.p>

        <motion.div variants={item} className={styles.ctas}>
          <Link to="/#work" className={`${styles.btn} ${styles.btnPrimary}`}>
            View my work
          </Link>
          <Link to="/#contact" className={`${styles.btn} ${styles.btnGhost}`}>
            Get in touch
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
