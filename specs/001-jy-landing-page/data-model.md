# Data Model: jy Landing Page

**Feature**: specs/001-jy-landing-page
**Date**: 2026-06-08
**Updated**: 2026-06-16
**Purpose**: Define component entities, their props, relationships, and state

## Component Entity Map

This project has no backend data model. The "entities" are React components and their props/state contracts.

### 1. App (Root)

- **Role**: Composes all page sections in order
- **Children**: Navbar, Hero (with InstallTabs + PlatformIcons as children), WhyJy, Features, Usage, Footer
- **State**: None — no theme management, no global state
- **File**: `src/App.tsx`

### 2. Navbar

- **Role**: Sticky navigation bar with branding and links
- **Props**: None
- **Elements**: "jy" brand text (left), "Docs" link and GitHub icon (right)
- **Links**:
  - Docs → `https://github.com/bilalshareef/jy/blob/main/README.md` (new tab)
  - GitHub → `https://github.com/bilalshareef/jy` (new tab)
- **Accessibility**: All links have `aria-label`. Sticky via CSS `position: fixed`
- **Visual**: Glass-effect via `rgba(15,23,42,0.85)` background with `backdrop-filter: blur()`
- **File**: `src/components/Navbar/Navbar.tsx`

### 3. Hero

- **Role**: Above-the-fold section with tagline, description, and child components
- **Props**: `children: React.ReactNode` (receives InstallTabs and PlatformIcons)
- **Content**:
  - Tagline: "Convert between JSON and YAML — fast, correct, zero config."
  - Description: Brief one-liner about jy
- **Visual**: Dark gradient background (#0f172a → #1e1b4b → #312e81) with radial color glows
- **File**: `src/components/Hero/Hero.tsx`

### 4. InstallTabs

- **Role**: Tabbed interface for install commands with copy-to-clipboard
- **State**: `activeTab: 'npm' | 'script'` (internal state)
- **Children**: CodeBlock (one per tab)
- **Tabs**:
  - npm: `npm install -g @bilalshareef/jy`
  - Script: `curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh`
- **Windows note**: Text below tabs with link to `https://github.com/bilalshareef/jy/releases`
- **Visual**: Pill-style tabs with gradient active state (#6366f1 → #8b5cf6) and glowing box-shadow
- **Accessibility**: Uses `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`
- **File**: `src/components/InstallTabs/InstallTabs.tsx`

### 5. PlatformIcons

- **Role**: Compact horizontal row of OS icons with architecture labels
- **Props**: None (static content)
- **Content**:
  - Linux: x64, arm64
  - macOS: Intel (x64), Apple Silicon (arm64)
  - Windows: x64
  - Note: "npm works on any platform with Node.js >= 22"
- **Responsiveness**: Wraps on narrow viewports
- **File**: `src/components/PlatformIcons/PlatformIcons.tsx`

### 6. CodeBlock

- **Role**: Reusable styled code block with copy-to-clipboard button
- **Props**: `code: string`, `label?: string`
- **State**: Uses `useCopyToClipboard` hook
- **Layout**: Flex with `.inner` wrapper; `pre` takes `flex:1`, copy button is `flex-shrink:0`
- **Accessibility**: Copy button has `aria-label="Copy code"`
- **File**: `src/components/CodeBlock/CodeBlock.tsx`

### 7. WhyJy

- **Role**: Value proposition section explaining Unix philosophy positioning
- **Props**: None (static content)
- **Content**: Contrasts jy with yq/jq, highlights what jy omits
- **Visual**: White cards on #fafafa background with indigo accent bars
- **File**: `src/components/WhyJy/WhyJy.tsx`

### 8. Features

- **Role**: Grid of four feature cards (rendered inline, no separate FeatureCard component)
- **Props**: None (static content)
- **Content**:
  - Zero Friction: "Install and convert your first file in under 60 seconds"
  - Zero Config: "No .jyrc, no environment variables, no config files"
  - Zero Dependencies: "Standalone binary, no runtime required"
  - CI-Ready: "Deterministic exit codes, stdout/stderr separation, script-safe defaults"
- **Visual**: Each card has a unique accent top-border color (amber, indigo, emerald, pink)
- **Responsiveness**: 4 columns on desktop (>900px), 2 columns on tablet (641–900px), 1 column on mobile (≤640px). Container widened to 1100px
- **File**: `src/components/Features/Features.tsx`

### 9. Usage

- **Role**: Categorized CLI usage examples with copy buttons
- **Children**: CodeBlock (multiple)
- **Categories**:
  - Basic conversion (JSON → YAML, YAML → JSON)
  - stdin/stdout piping
  - Multiple files
  - Output directory (`--out`)
  - Validation (`--validate`)
  - Formatting options (`--indent-size`, `--indent-style`, `--eol`)
- **File**: `src/components/Usage/Usage.tsx`

### 10. Footer

- **Role**: Page footer with author credit
- **Props**: None (static content)
- **Content**: "Made with ❤️ by Mohammed Bilal Shareef" with link to `https://bilalshareef.github.io/`
- **Visual**: Dark gradient background matching hero
- **File**: `src/components/Footer/Footer.tsx`

## Custom Hooks

### useCopyToClipboard

- **File**: `src/hooks/useCopyToClipboard.ts`
- **Returns**: `{ copied: boolean, copyToClipboard: (text: string) => Promise<boolean> }`
- **Behavior**: Uses native Clipboard API. `copied` state auto-resets after a configurable timeout
- **Used by**: CodeBlock component

### Removed from Original Plan

- **useTheme**: Not implemented — no theme switching per FR-025
- **ThemeToggle**: Not implemented — no theme toggle UI
- **FeatureCard**: Merged into Features component

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
