import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <div className={`${styles.wrap} container`}>
      <p className={styles.code}>404</p>
      <h1 className={styles.heading}>Lost in space</h1>
      <p className={styles.text}>
        That page drifted out of orbit. Everything worth seeing is back on the main page.
      </p>
      <Link to="/" className={styles.back}>
        Back to home
      </Link>
    </div>
  )
}
