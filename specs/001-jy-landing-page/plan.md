# Implementation Plan: jy Landing Page

**Branch**: `gh-pages-speckit` | **Date**: 2026-06-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-jy-landing-page/spec.md`

## Summary

Build a single-page static website for the jy CLI tool using React 18+ and Vite. The site has five visual sections (Hero/Install → Why jy? → Features → Usage → Footer) with a sticky navigation bar containing a Docs link, theme toggle, and GitHub icon. The site supports automatic and manual dark/light theme switching with localStorage persistence. Deployment targets GitHub Pages via GitHub Actions on push to the `gh-pages` branch. CSS Modules for styling, system fonts, and native browser APIs (Clipboard, prefers-color-scheme) keep the bundle under 200KB gzipped with zero external runtime dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)

**Primary Dependencies**: React 19+, Vite 6+, @vitejs/plugin-react

**Storage**: N/A (no backend; localStorage for theme preference only)

**Testing**: Vitest + @testing-library/react + jsdom

**Target Platform**: Static website deployed to GitHub Pages (`bilalshareef.github.io/jy`)

**Project Type**: Static single-page website (SPA without routing)

**Performance Goals**: Lighthouse Performance >= 90 (mobile), JS bundle < 200KB gzipped

**Constraints**: WCAG 2.1 AA, 320px–2560px responsive, no external fonts, no analytics/tracking

**Scale/Scope**: Single page, 6 user stories, ~10 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Pre-Design Gate | Post-Design Gate |
|---|-----------|----------------|-----------------|
| I | Static-First Delivery | ✅ Vite produces static HTML/CSS/JS. No SSR. Deployed to GH Pages. | ✅ No server runtime in any design artifact |
| II | Performance Budget | ✅ System fonts, CSS Modules (zero runtime), no syntax highlighting lib | ✅ Minimal dependencies. Bundle analysis recommended in CI |
| III | Accessibility (NON-NEGOTIABLE) | ✅ ARIA roles specified in FR-035–039. eslint-plugin-jsx-a11y in tooling | ✅ Tab interface uses tablist/tab/tabpanel roles. All links labeled |
| IV | Component-Driven | ✅ Components < 150 LOC. Hooks separate logic from presentation | ✅ 10 components, each single-responsibility. See data-model.md |
| V | Content Accuracy | ✅ Commands match canonical README (FR-009, FR-010) | ✅ Commands hardcoded to match README v1.0.0 |
| VI | Simplicity & Minimalism | ✅ No analytics, no tracking. Native APIs preferred | ✅ 0 runtime utility libraries. Only React + Vite |
| VII | Responsive Design | ✅ Mobile-first CSS. 320px–2560px range. 44px tap targets | ✅ CSS Modules use mobile-first media queries |

**Gate result**: All 7 principles PASS. No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-jy-landing-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (component tree)
├── quickstart.md        # Phase 1 output (validation guide)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Navbar/
│   │   ├── Navbar.tsx
│   │   └── Navbar.module.css
│   ├── Hero/
│   │   ├── Hero.tsx
│   │   └── Hero.module.css
│   ├── InstallTabs/
│   │   ├── InstallTabs.tsx
│   │   └── InstallTabs.module.css
│   ├── PlatformIcons/
│   │   ├── PlatformIcons.tsx
│   │   └── PlatformIcons.module.css
│   ├── WhyJy/
│   │   ├── WhyJy.tsx
│   │   └── WhyJy.module.css
│   ├── Features/
│   │   ├── Features.tsx
│   │   ├── FeatureCard.tsx
│   │   └── Features.module.css
│   ├── Usage/
│   │   ├── Usage.tsx
│   │   └── Usage.module.css
│   ├── CodeBlock/
│   │   ├── CodeBlock.tsx
│   │   └── CodeBlock.module.css
│   ├── Footer/
│   │   ├── Footer.tsx
│   │   └── Footer.module.css
│   └── ThemeToggle/
│       ├── ThemeToggle.tsx
│       └── ThemeToggle.module.css
├── hooks/
│   ├── useCopyToClipboard.ts
│   └── useTheme.ts
├── styles/
│   ├── global.css          # CSS reset, font stacks, CSS custom properties
│   └── theme.css           # Light/dark theme variables
├── App.tsx                 # Root component composing all sections
├── App.module.css          # App-level layout styles
└── main.tsx                # Vite entry point

public/
├── favicon.svg             # Simple "jy" text favicon
└── og-image.png            # Open Graph preview image

index.html                  # Vite entry HTML with inline theme script
vite.config.ts              # Vite configuration (base: '/jy/')
tsconfig.json               # TypeScript strict configuration
tsconfig.node.json          # TypeScript config for Vite/Node files
eslint.config.mjs           # ESLint flat config with React + a11y
.prettierrc.json            # Prettier configuration
package.json                # Dependencies and scripts
.github/
└── workflows/
    └── deploy.yml          # GitHub Actions: build + deploy to Pages
```

**Structure Decision**: Single project structure (no backend). All source code under `src/` with co-located component styles. Custom hooks in `hooks/`. Global styles and theme variables in `styles/`.

## Complexity Tracking

No constitution violations detected. No complexity justifications needed.
