import styles from './PlatformIcons.module.css'

const PLATFORMS = [
  { os: 'Linux', icon: '🐧', arches: ['x64', 'arm64'] },
  { os: 'macOS', icon: '🍎', arches: ['Intel (x64)', 'Apple Silicon (arm64)'] },
  { os: 'Windows', icon: '🪟', arches: ['x64'] },
]

export function PlatformIcons() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.platforms}>
        {PLATFORMS.map((p) => (
          <div key={p.os} className={styles.platform}>
            <span className={styles.icon} aria-hidden="true">
              {p.icon}
            </span>
            <span className={styles.os}>{p.os}</span>
            <span className={styles.arches}>{p.arches.join(', ')}</span>
          </div>
        ))}
      </div>
      <p className={styles.note}>
        npm install works on any platform with Node.js &ge; 22
      </p>
    </div>
  )
}
