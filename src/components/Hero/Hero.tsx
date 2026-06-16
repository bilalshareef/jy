import styles from './Hero.module.css'

export function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.content}>
        <h1 className={styles.tagline}>
          Convert between JSON and YAML — fast, correct, zero config.
        </h1>
        <p className={styles.description}>
          A cross-platform CLI tool with zero configuration, zero runtime
          dependencies, and ships as a single binary.
        </p>
        {children}
      </div>
    </section>
  )
}
