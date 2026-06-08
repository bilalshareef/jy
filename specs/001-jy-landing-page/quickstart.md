# Quickstart Validation Guide: jy Landing Page

**Feature**: specs/001-jy-landing-page
**Date**: 2026-06-08
**Purpose**: Runnable validation scenarios to prove the feature works end-to-end

## Prerequisites

- Node.js >= 22.0.0
- npm (comes with Node.js)
- A modern browser (Chrome, Firefox, Safari, or Edge — last 2 versions)

## Setup

```bash
# Clone and switch to the website branch
git clone https://github.com/bilalshareef/jy.git
cd jy
git checkout gh-pages

# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173/jy/`).

## Validation Scenarios

### Scenario 1: Hero Section & Install Commands (US1)

**Steps**:
1. Open the site in a browser
2. Verify the tagline and description are visible without scrolling
3. Verify two tabs are visible: "npm" and "Script"
4. The "npm" tab should be active by default showing: `npm install -g @bilalshareef/jy`
5. Click the "Script" tab — should show: `curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh`
6. Click the copy button on either command — should show "Copied!" feedback
7. Paste into a text editor to verify the correct command was copied
8. Verify a Windows note with a link to the Releases page is visible below the tabs
9. Click the Releases link — should open `https://github.com/bilalshareef/jy/releases` in a new tab
10. Verify OS icons (Linux, macOS, Windows) with architecture labels are visible below the install area

**Expected**: All elements visible above the fold on a 1920×1080 viewport. Copy works. Links open in new tabs.

### Scenario 2: Navigation Bar (US3)

**Steps**:
1. Verify the navigation bar shows "jy" on the left
2. Verify the right side contains: "Docs" button, theme toggle, GitHub icon
3. Scroll down the page — verify the navbar stays fixed at the top
4. Click "Docs" — should open `https://github.com/bilalshareef/jy/blob/main/README.md` in a new tab
5. Click the GitHub icon — should open `https://github.com/bilalshareef/jy` in a new tab
6. Tab through all nav elements with keyboard — all should be focusable and actionable

**Expected**: Sticky navigation. All links open correct URLs in new tabs. Keyboard navigable.

### Scenario 3: Theme Toggle (US6)

**Steps**:
1. Note the current theme (should match your OS preference on first visit)
2. Click the theme toggle — page should switch to the opposite theme
3. Verify all text remains readable (contrast is maintained)
4. Reload the page — the manually chosen theme should persist
5. Open browser DevTools → Application → Local Storage — verify a `theme` key exists with value `'light'` or `'dark'`
6. Delete the `theme` key from localStorage and reload — should fall back to OS preference
7. Change your OS dark/light mode setting — page should follow (only if no manual override in localStorage)

**Expected**: Theme toggles smoothly. Persists across reloads. Falls back to OS on cleared storage.

### Scenario 4: Theme Flash Prevention

**Steps**:
1. Set theme to dark mode via the toggle
2. Hard reload the page (Ctrl/Cmd + Shift + R)
3. Watch carefully — the page should NOT flash white before rendering dark

**Expected**: No flash of wrong theme on page load.

### Scenario 5: Why jy? Section (US4)

**Steps**:
1. Scroll past the hero section
2. Verify the "Why jy?" section is visible
3. Verify it mentions the Unix philosophy and contrasts with yq/jq
4. Verify it explains what jy intentionally omits

**Expected**: Clear value proposition content visible.

### Scenario 6: Features at a Glance (US5)

**Steps**:
1. Scroll to the features section
2. Verify four feature cards are visible: Zero Friction, Zero Config, Zero Dependencies, CI-Ready
3. Each card should have a title and brief description

**Expected**: 4 cards with correct content. 2×2 grid on desktop.

### Scenario 7: Usage Section (US2)

**Steps**:
1. Scroll to the usage section
2. Verify code examples exist for: basic conversion, stdin/stdout, multiple files, --out, --validate, formatting options
3. Each code block should have a copy-to-clipboard button
4. Click a copy button — verify "Copied!" feedback and correct text in clipboard
5. Verify each example has a short description

**Expected**: All usage categories present with working copy buttons.

### Scenario 8: Footer (US1 partial)

**Steps**:
1. Scroll to the bottom of the page
2. Verify "Made with ❤️ by Mohammed Bilal Shareef" is centered
3. Click "Mohammed Bilal Shareef" — should open `https://bilalshareef.github.io/` in a new tab
4. Verify the footer is visually separated from the content above

**Expected**: Centered footer with working link.

### Scenario 9: Mobile Responsiveness

**Steps**:
1. Open browser DevTools and toggle device toolbar (Ctrl/Cmd + Shift + M)
2. Set viewport to 375×667 (iPhone SE)
3. Verify: no horizontal scrolling, all content readable
4. Verify: feature cards stack vertically
5. Verify: code blocks are horizontally scrollable within their container
6. Verify: platform icons row wraps gracefully
7. Verify: install tabs and copy buttons are tappable (>= 44px targets)
8. Set viewport to 320px width — verify no layout breakage

**Expected**: Fully functional at 375px and 320px widths.

### Scenario 10: Accessibility

**Steps**:
1. Navigate the entire page using only the keyboard (Tab, Shift+Tab, Enter, Arrow keys)
2. Verify all interactive elements (tabs, copy buttons, links, theme toggle) are reachable
3. Verify install tabs can be switched with arrow keys
4. Open browser DevTools → Lighthouse → run Accessibility audit
5. Verify score >= 95

**Expected**: Full keyboard navigation. Lighthouse Accessibility >= 95.

## Production Build Validation

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

Open the preview URL and repeat Scenarios 1–10 above.

### Bundle Size Check

```bash
# After building, check the output size
du -sh dist/
ls -la dist/assets/*.js | awk '{print $5, $9}'
```

**Expected**: Total JS (gzipped) < 200KB.

### Lighthouse Full Audit

```bash
# Using Chrome DevTools or Lighthouse CLI
npx lighthouse http://localhost:4173/jy/ --output=json --output-path=./lighthouse-report.json
```

**Expected**: Performance >= 90, Accessibility >= 95.
