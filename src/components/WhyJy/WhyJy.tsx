import styles from './WhyJy.module.css'

export function WhyJy() {
  return (
    <section className={styles.section} id="why-jy">
      <div className={styles.container}>
        <h2 className={styles.heading}>Why jy?</h2>

        <div className={styles.content}>
          <div className={styles.block}>
            <h3 className={styles.subheading}>Do one thing well</h3>
            <p>
              Tools like <strong>yq</strong> and <strong>jq</strong> are
              powerful — they query, filter, transform, and reshape data with
              their own expression languages. But when all you need is to convert
              between JSON and YAML, that power becomes overhead.
            </p>
            <p>
              <strong>jy</strong> follows the Unix philosophy: do one thing and
              do it well. It converts between JSON and YAML — nothing more,
              nothing less.
            </p>
          </div>

          <div className={styles.block}>
            <h3 className={styles.subheading}>What jy intentionally omits</h3>
            <ul className={styles.list}>
              <li>No query language</li>
              <li>No transformation pipelines</li>
              <li>No schema validation</li>
              <li>No plugins or extensions</li>
            </ul>
            <p>
              This isn't a limitation — it's a design choice. Fewer features mean
              fewer things to learn, fewer things to break, and a tool you can
              trust in any pipeline.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
