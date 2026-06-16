# Implementation Plan: jy Landing Page

**Branch**: `gh-pages-speckit` | **Date**: 2026-06-08 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-jy-landing-page/spec.md`

**Status**: Implementation complete

## Summary

Single-page static website for the jy CLI tool built with React 19 / Vite 8 / TypeScript 6 (strict mode). The site has five visual sections (Hero/Install → Why jy? → Features → Usage → Footer) with a sticky glass-effect navigation bar containing a Docs link and GitHub icon. There is no dark/light theme switching — the site uses a single design with dark gradient backgrounds for the hero, navbar, and footer, and light backgrounds for content sections (Why jy?, Features, Usage). Deployment targets GitHub Pages via GitHub Actions on push to the `gh-pages` branch. CSS Modules with hardcoded values (no CSS custom properties), system fonts, and native Clipboard API keep the bundle at ~64KB gzipped with zero external runtime dependencies.

## Technical Context

**Language/Version**: TypeScript ~6.0.2 (strict mode enabled)

**Primary Dependencies**: React ^19.2.6, Vite ^8.0.12, @vitejs/plugin-react ^6.0.1

**Storage**: N/A (no backend, no localStorage, no theme persistence)

**Testing**: Not included in current build (Vitest + @testing-library/react planned)

**Target Platform**: Static website deployed to GitHub Pages (`bilalshareef.github.io/jy/`)

**Project Type**: Static single-page website (SPA without routing)

**Performance Goals**: Lighthouse Performance >= 90 (mobile), JS bundle ~64KB gzipped

**Constraints**: WCAG 2.1 AA, 320px–2560px responsive, no external fonts, no analytics/tracking, no CSS custom properties

**Scale/Scope**: Single page, 5 user stories, 9 React components, 1 custom hook

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Pre-Design Gate | Post-Design Gate |
|---|-----------|----------------|-----------------|
| I | Static-First Delivery | ✅ Vite produces static HTML/CSS/JS. No SSR. Deployed to GH Pages via Actions. | ✅ No server runtime. `dist/` deployed via `actions/deploy-pages@v4` |
| II | Performance Budget | ✅ System fonts, CSS Modules (zero runtime), no syntax highlighting lib | ✅ ~64KB gzipped JS. No external fonts. No runtime CSS-in-JS |
| III | Accessibility (NON-NEGOTIABLE) | ✅ ARIA roles specified in FR-041–044. eslint-plugin-jsx-a11y in tooling | ✅ Tab interface uses tablist/tab/tabpanel roles. All links have aria-labels |
| IV | Component-Driven | ✅ Components < 150 LOC. Hook separates clipboard logic from presentation | ✅ 9 components, each single-responsibility. See data-model.md |
| V | Content Accuracy | ✅ Commands match canonical README (FR-009, FR-010) | ✅ Commands hardcoded to match README |
| VI | Simplicity & Minimalism | ✅ No analytics, no tracking. Native Clipboard API only | ✅ 0 runtime utility libraries. Only React + Vite. No theme system |
| VII | Responsive Design | ✅ CSS breakpoints at 900px and 640px. 320px–2560px range | ✅ 4→2→1 column features grid. Code blocks horizontally scrollable |

**Gate result**: All 7 principles PASS. No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/001-jy-landing-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (component tree)
├── quickstart.md        # Phase 1 output (validation guide)
├── tasks.md             # Phase 2 output (/speckit.tasks command)
└── checklists/
    └── requirements.md  # Requirements checklist
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
│   │   └── Features.module.css
│   ├── Usage/
│   │   ├── Usage.tsx
│   │   └── Usage.module.css
│   ├── CodeBlock/
│   │   ├── CodeBlock.tsx
│   │   └── CodeBlock.module.css
│   └── Footer/
│       ├── Footer.tsx
│       └── Footer.module.css
├── hooks/
│   └── useCopyToClipboard.ts
├── styles/
│   └── global.css          # CSS reset, font stacks, focus styles
├── App.tsx                 # Root component composing all sections
├── App.module.css          # App-level layout styles
└── main.tsx                # Vite entry point

public/
└── favicon.svg             # Simple "jy" text favicon

index.html                  # Vite entry HTML with SEO meta tags
vite.config.ts              # Vite configuration (base: '/jy/', target: es2020)
tsconfig.json               # TypeScript project references
tsconfig.app.json           # TypeScript strict configuration for src/
tsconfig.node.json          # TypeScript config for Vite/Node files
eslint.config.js            # ESLint flat config with React + a11y
package.json                # Dependencies and scripts
.github/
└── workflows/
    └── deploy.yml          # GitHub Actions: build + deploy to Pages
```

**Structure Decision**: Single project structure (no backend). All source code under `src/` with co-located component styles (CSS Modules). Single custom hook in `hooks/`. Global CSS reset in `styles/`. No theme system (no `useTheme` hook, no `theme.css`, no `ThemeToggle` component, no `FeatureCard` sub-component).

## Key Implementation Decisions

### No Theme System (Deviation from Original Plan)

The spec (FR-025) explicitly requires a single dark-on-light design with **no theme switching capability**. The original plan included `useTheme`, `ThemeToggle`, and `theme.css` — all removed. The site uses:
- **Dark sections**: Hero, Navbar, Footer — deep indigo/purple gradients (#0f172a → #1e1b4b → #312e81) with light text (#e2e8f0)
- **Light sections**: WhyJy, Features, Usage — white/light backgrounds with dark text (#1e293b)
- **No `data-theme` attribute**, no localStorage, no inline FOUC-prevention script

### CSS Modules with Hardcoded Values (FR-045)

All styling uses CSS Modules with hardcoded color values. No CSS custom properties (`var(--*)`) are used anywhere. Colors like `#6366f1` (indigo accent), `#0f172a` (dark background), and `#e2e8f0` (light text) are repeated directly in each `.module.css` file.

### Flattened Component Structure

The original plan included a separate `FeatureCard` component. In implementation, feature cards are rendered inline within `Features.tsx` — keeping the component count at 9 rather than 10.

### Visual Design Details

- **Accent color**: #6366f1 (indigo) for interactive elements, active states, focus rings
- **Feature card accents**: Unique top-border colors (amber, indigo, emerald, pink) per FR-036
- **WhyJy cards**: White cards on #fafafa background with indigo accent bars
- **Install tabs**: Pill-style with gradient active state (#6366f1 → #8b5cf6) and glowing box-shadow
- **Code blocks**: Flex layout with `.inner` wrapper; `pre` takes `flex:1`, copy button is `flex-shrink:0`
- **Hero**: Radial color glows (purple, blue, pink) for visual depth
- **Navbar**: Glass effect via `rgba(15,23,42,0.85)` background with `backdrop-filter: blur()`

### Responsive Breakpoints

- **>900px**: 4-column features grid, features container widened to 1100px
- **641–900px**: 2-column features grid
- **≤640px**: Single-column features grid, stacked layouts

### Bundle & Deployment

- **Bundle size**: ~64KB gzipped JS (well under 200KB constitution limit)
- **Base path**: `/jy/` in `vite.config.ts` for GitHub Pages project page
- **CI**: GitHub Actions workflow on push to `gh-pages` — Node.js 22, `npm ci`, `npm run build`, deploy via `actions/deploy-pages@v4`
- **Build target**: ES2020

## Complexity Tracking

No constitution violations detected. No complexity justifications needed.
