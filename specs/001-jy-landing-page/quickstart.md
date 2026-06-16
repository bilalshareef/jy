# Quickstart Validation Guide: jy Landing Page

**Feature**: specs/001-jy-landing-page
**Date**: 2026-06-08
**Updated**: 2026-06-16
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
2. Verify the right side contains: "Docs" button and GitHub icon (no theme toggle)
3. Verify the navbar has a glass-effect appearance (translucent background with blur)
4. Scroll down the page — verify the navbar stays fixed at the top
5. Click "Docs" — should open `https://github.com/bilalshareef/jy/blob/main/README.md` in a new tab
6. Click the GitHub icon — should open `https://github.com/bilalshareef/jy` in a new tab
7. Tab through all nav elements with keyboard — all should be focusable and actionable

**Expected**: Sticky navigation with glass effect. All links open correct URLs in new tabs. Keyboard navigable.

### Scenario 3: Visual Design (Single Color Scheme)

**Steps**:
1. Verify the hero section has a dark gradient background with light text
2. Verify the navbar has a dark translucent glass-effect background
3. Verify content sections (Why jy?, Features, Usage) have light backgrounds with dark text
4. Verify the footer has a dark gradient background matching the hero
5. Verify the accent color (#6366f1 indigo) is used for interactive elements and focus rings
6. Verify install tabs use pill-style design with gradient active state
7. Verify there is NO theme toggle button anywhere on the page

**Expected**: Consistent single color scheme throughout. No theme switching UI.

### Scenario 4: Why jy? Section (US4)

**Steps**:
1. Scroll past the hero section
2. Verify the "Why jy?" section is visible
3. Verify it mentions the Unix philosophy and contrasts with yq/jq
4. Verify it explains what jy intentionally omits
5. Verify cards are white on light (#fafafa) background with indigo accent bars

**Expected**: Clear value proposition content visible with correct visual styling.

### Scenario 5: Features at a Glance (US5)

**Steps**:
1. Scroll to the features section
2. Verify four feature cards are visible: Zero Friction, Zero Config, Zero Dependencies, CI-Ready
3. Each card should have a title and brief description
4. Verify each card has a unique accent color on the top border (amber, indigo, emerald, pink)
5. On desktop (>900px): verify 4-column grid layout
6. Resize to tablet (641–900px): verify 2-column grid
7. Resize to mobile (≤640px): verify single-column stack

**Expected**: 4 cards with correct content and accent colors. Responsive grid layout.

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
5. Verify the footer has a dark gradient background

**Expected**: Centered footer with working link and dark styling.

### Scenario 9: Mobile Responsiveness

**Steps**:
1. Open browser DevTools and toggle device toolbar (Ctrl/Cmd + Shift + M)
2. Set viewport to 375×667 (iPhone SE)
3. Verify: no horizontal scrolling, all content readable
4. Verify: feature cards stack vertically (single column at ≤640px)
5. Verify: code blocks are horizontally scrollable within their container
6. Verify: platform icons row wraps gracefully
7. Verify: install tabs and copy buttons are tappable (>= 44px targets)
8. Set viewport to 320px width — verify no layout breakage
9. Set viewport to 800px width — verify feature cards show 2-column grid

**Expected**: Fully functional at 375px and 320px widths. 2-column grid at tablet widths.

### Scenario 10: Accessibility

**Steps**:
1. Navigate the entire page using only the keyboard (Tab, Shift+Tab, Enter, Arrow keys)
2. Verify all interactive elements (tabs, copy buttons, links) are reachable
3. Verify install tabs can be switched with arrow keys
4. Verify focus rings use indigo (#6366f1) accent color
5. Open browser DevTools → Lighthouse → run Accessibility audit
6. Verify score >= 95

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

**Expected**: Total JS (gzipped) ~64KB (well under 200KB constitution limit).

### Lighthouse Full Audit

```bash
# Using Chrome DevTools or Lighthouse CLI
npx lighthouse http://localhost:4173/jy/ --output=json --output-path=./lighthouse-report.json
```

**Expected**: Performance >= 90, Accessibility >= 95.
