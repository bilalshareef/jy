# Data Model: jy Landing Page

**Feature**: specs/001-jy-landing-page
**Date**: 2026-06-08
**Purpose**: Define component entities, their props, relationships, and state

## Component Entity Map

This project has no backend data model. The "entities" are React components and their props/state contracts.

### 1. App (Root)

- **Role**: Composes all page sections in order
- **Children**: Navbar, Hero, WhyJy, Features, Usage, Footer
- **State**: Receives `theme` and `toggleTheme` from `useTheme` hook, passes to Navbar

### 2. Navbar

- **Role**: Sticky navigation bar with branding, links, and theme toggle
- **Props**: `theme: 'light' | 'dark'`, `onToggleTheme: () => void`
- **Children**: ThemeToggle (inline)
- **Elements**: "jy" brand text (left), "Docs" link, ThemeToggle, GitHub icon (right)
- **Links**:
  - Docs → `https://github.com/bilalshareef/jy/blob/main/README.md` (new tab)
  - GitHub → `https://github.com/bilalshareef/jy` (new tab)
- **Accessibility**: All links have `aria-label`. Sticky via CSS `position: fixed`

### 3. Hero

- **Role**: Above-the-fold section with tagline, description, install tabs, Windows note, platform icons
- **Children**: InstallTabs, PlatformIcons
- **Content**:
  - Tagline: "Convert between JSON and YAML — fast, correct, zero config."
  - Description: Brief one-liner about jy

### 4. InstallTabs

- **Role**: Tabbed interface for install commands with copy-to-clipboard
- **State**: `activeTab: 'npm' | 'script'` (internal state)
- **Children**: CodeBlock (one per tab)
- **Tabs**:
  - npm: `npm install -g @bilalshareef/jy`
  - Script: `curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh`
- **Windows note**: Text below tabs with link to `https://github.com/bilalshareef/jy/releases`
- **Accessibility**: Uses `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`

### 5. PlatformIcons

- **Role**: Compact horizontal row of OS icons with architecture labels
- **Props**: None (static content)
- **Content**:
  - Linux: x64, arm64
  - macOS: Intel (x64), Apple Silicon (arm64)
  - Windows: x64
  - Note: "npm works on any platform with Node.js >= 22"
- **Responsiveness**: Wraps on narrow viewports

### 6. CodeBlock

- **Role**: Reusable styled code block with copy-to-clipboard button
- **Props**: `code: string`, `label?: string`
- **State**: Uses `useCopyToClipboard` hook
- **Elements**: `<pre><code>` with monospace font, copy button with icon/text toggle
- **Accessibility**: Copy button has `aria-label="Copy code"`

### 7. WhyJy

- **Role**: Value proposition section explaining Unix philosophy positioning
- **Props**: None (static content)
- **Content**: Contrasts jy with yq/jq, highlights what jy omits

### 8. Features

- **Role**: Grid of four feature cards
- **Children**: FeatureCard (×4)
- **Content**:
  - Zero Friction: "Install and convert your first file in under 60 seconds"
  - Zero Config: "No .jyrc, no environment variables, no config files"
  - Zero Dependencies: "Standalone binary, no runtime required"
  - CI-Ready: "Deterministic exit codes, stdout/stderr separation, script-safe defaults"
- **Responsiveness**: 2×2 grid on desktop, single column on mobile

### 9. FeatureCard

- **Role**: Individual feature card with title and description
- **Props**: `title: string`, `description: string`, `icon?: string`
- **Elements**: Card container with title, description, optional icon/emoji

### 10. Usage

- **Role**: Categorized CLI usage examples with copy buttons
- **Children**: CodeBlock (multiple)
- **Categories**:
  - Basic conversion (JSON → YAML, YAML → JSON)
  - stdin/stdout piping
  - Multiple files
  - Output directory (`--out`)
  - Validation (`--validate`)
  - Formatting options (`--indent-size`, `--indent-style`, `--eol`)

### 11. Footer

- **Role**: Centered author credit with link
- **Content**: "Made with ❤️ by Mohammed Bilal Shareef"
- **Link**: "Mohammed Bilal Shareef" → `https://bilalshareef.github.io/` (new tab)

### 12. ThemeToggle

- **Role**: Button that toggles light/dark theme
- **Props**: `theme: 'light' | 'dark'`, `onToggle: () => void`
- **Elements**: Button with sun/moon icon
- **Accessibility**: `aria-label="Switch to dark mode"` / `"Switch to light mode"`

## Custom Hooks

### useCopyToClipboard

- **Input**: `timeout?: number` (default 2000ms)
- **Output**: `{ copied: boolean, copyToClipboard: (text: string) => Promise<boolean> }`
- **Behavior**: Copies text via Clipboard API, sets `copied` to true for `timeout` ms

### useTheme

- **Input**: None
- **Output**: `{ theme: 'light' | 'dark', toggleTheme: () => void }`
- **Behavior**:
  1. On init: check localStorage → fallback to OS preference
  2. On toggle: update state, set `data-theme` on `<html>`, persist to localStorage
  3. Listen for OS `prefers-color-scheme` changes (only auto-switch if user hasn't manually toggled)

## State Transitions

### Theme State

```
[First Visit] → Check localStorage
  ├── Found → Use stored value ('light' | 'dark')
  └── Not found → Check prefers-color-scheme
        ├── Dark → theme = 'dark'
        └── Light → theme = 'light'

[Toggle Click] → Flip theme → Save to localStorage → Update data-theme attribute

[OS Preference Change] → Check if user manually set theme
  ├── Yes (localStorage has value) → Ignore OS change
  └── No → Follow OS preference
```

### Install Tab State

```
[Page Load] → activeTab = 'npm' (default)
[Click 'Script' tab] → activeTab = 'script'
[Click 'npm' tab] → activeTab = 'npm'
```

### Copy Button State

```
[Idle] → Show copy icon
[Click] → Copy to clipboard
  ├── Success → Show "Copied!" (2s) → Return to idle
  └── Failure → Show error state → Return to idle
```

## Validation Rules

- All external links MUST use `target="_blank"` with `rel="noopener noreferrer"`
- Theme value in localStorage MUST only be `'light'` or `'dark'` (validate on read; fall back to OS preference if invalid)
- Install commands are static strings — no user input, no XSS surface
