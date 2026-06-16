import { CodeBlock } from '../CodeBlock/CodeBlock'
import styles from './Usage.module.css'

const USAGE_CATEGORIES = [
  {
    title: 'Basic Conversion',
    description: 'Convert between JSON and YAML with a single command.',
    examples: [
      'jy config.json              # JSON → YAML (config.yaml)',
      'jy config.yaml              # YAML → JSON (config.json)',
    ],
  },
  {
    title: 'stdin / stdout',
    description: 'Pipe data through jy for use in shell pipelines.',
    examples: [
      'cat config.json | jy        # stdin JSON → stdout YAML',
      'cat config.yaml | jy        # stdin YAML → stdout JSON',
    ],
  },
  {
    title: 'Multiple Files',
    description: 'Convert multiple files in a single invocation.',
    examples: ['jy a.json b.json c.json     # Converts all to YAML'],
  },
  {
    title: 'Output Directory',
    description: 'Write converted files to a specific directory.',
    examples: ['jy --out dist/ src/*.json    # Output to dist/'],
  },
  {
    title: 'Validation',
    description: 'Validate files without writing output.',
    examples: ['jy --validate config.json    # Exit 0 if valid, 1 if not'],
  },
  {
    title: 'Formatting Options',
    description: 'Control indentation and line endings.',
    examples: [
      'jy --indent-size 4 config.yaml',
      'jy --indent-style tab config.json',
      'jy --eol crlf config.yaml',
    ],
  },
]

export function Usage() {
  return (
    <section className={styles.section} id="usage">
      <div className={styles.container}>
        <h2 className={styles.heading}>Usage</h2>
        <div className={styles.categories}>
          {USAGE_CATEGORIES.map((category) => (
            <div key={category.title} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category.title}</h3>
              <p className={styles.categoryDescription}>
                {category.description}
              </p>
              <CodeBlock code={category.examples.join('\n')} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
