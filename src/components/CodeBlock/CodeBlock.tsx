import { useCopyToClipboard } from '../../hooks/useCopyToClipboard'
import styles from './CodeBlock.module.css'

interface CodeBlockProps {
  code: string
  label?: string
}

export function CodeBlock({ code, label }: CodeBlockProps) {
  const { copied, copyToClipboard } = useCopyToClipboard()

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <pre className={styles.pre}>
        <code>{code}</code>
      </pre>
      <button
        className={styles.copyBtn}
        onClick={() => copyToClipboard(code)}
        aria-label="Copy code"
        type="button"
      >
        {copied ? (
          <span className={styles.copied}>Copied!</span>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  )
}
