import styles from './StackChips.module.css'

export function StackChips({ items }) {
  return (
    <ul className={styles.list}>
      {items.map((tech) => (
        <li key={tech} className={styles.chip}>
          {tech}
        </li>
      ))}
    </ul>
  )
}
