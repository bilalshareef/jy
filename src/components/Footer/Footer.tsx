import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.credit}>
        Made with ❤️ by{' '}
        <a
          href="https://bilalshareef.github.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Mohammed Bilal Shareef
        </a>
      </p>
    </footer>
  )
}
