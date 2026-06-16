import { useState } from 'react'
import { CodeBlock } from '../CodeBlock/CodeBlock'
import styles from './InstallTabs.module.css'

type Tab = 'npm' | 'script'

const INSTALL_COMMANDS: Record<Tab, string> = {
  npm: 'npm install -g @bilalshareef/jy',
  script:
    'curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh',
}

export function InstallTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('npm')

  return (
    <div className={styles.wrapper}>
      <div role="tablist" aria-label="Install methods" className={styles.tabList}>
        <button
          role="tab"
          aria-selected={activeTab === 'npm'}
          aria-controls="panel-npm"
          id="tab-npm"
          className={`${styles.tab} ${activeTab === 'npm' ? styles.active : ''}`}
          onClick={() => setActiveTab('npm')}
          type="button"
        >
          npm
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'script'}
          aria-controls="panel-script"
          id="tab-script"
          className={`${styles.tab} ${activeTab === 'script' ? styles.active : ''}`}
          onClick={() => setActiveTab('script')}
          type="button"
        >
          Script
        </button>
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={styles.panel}
      >
        <CodeBlock code={INSTALL_COMMANDS[activeTab]} />
      </div>

      <p className={styles.windowsNote}>
        <strong>Windows:</strong> The install script does not support Windows.
        Download the latest <code>.tar.gz</code> for <code>win32-x64</code> from
        the{' '}
        <a
          href="https://github.com/bilalshareef/jy/releases"
          target="_blank"
          rel="noopener noreferrer"
        >
          Releases page
        </a>
        {' '}and extract it to a directory on your <code>PATH</code>.
      </p>
    </div>
  )
}
