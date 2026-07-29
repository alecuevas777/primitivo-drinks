import styles from './Loader.module.css'

export default function Loader({ label = 'Cargando...' }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
