import styles from './GridFrame.module.css'

// Two hairlines the page is drawn against. Fixed rather than per-section, so
// they read as one continuous pair down the whole scroll with no seams — and
// so scrolling costs no repaint. Section starts mark themselves against these
// with crosshairs; see .section-mark in global.css.
export function GridFrame() {
  return (
    <div className={styles.frame} aria-hidden="true">
      <div className={styles.track}>
        <div className={styles.rails} />
      </div>
    </div>
  )
}
