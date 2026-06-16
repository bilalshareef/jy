import styles from './Features.module.css'

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDescription}>{description}</p>
    </div>
  )
}

const FEATURES: FeatureCardProps[] = [
  {
    title: 'Zero Friction',
    description: 'Install and convert your first file in under 60 seconds.',
    icon: '⚡',
  },
  {
    title: 'Zero Config',
    description: 'No .jyrc, no environment variables, no config files.',
    icon: '🎯',
  },
  {
    title: 'Zero Dependencies',
    description: 'Standalone binary, no runtime required.',
    icon: '📦',
  },
  {
    title: 'CI-Ready',
    description:
      'Deterministic exit codes, stdout/stderr separation, script-safe defaults.',
    icon: '🔧',
  },
]

export function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.container}>
        <h2 className={styles.heading}>Features at a Glance</h2>
        <div className={styles.grid}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
