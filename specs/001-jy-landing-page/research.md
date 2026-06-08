# Research: jy Landing Page

**Feature**: specs/001-jy-landing-page
**Date**: 2026-06-08
**Purpose**: Resolve all technical decisions before Phase 1 design

## 1. Vite + React Project Scaffolding

**Decision**: Use `npm create vite@latest -- --template react-ts` to scaffold the project

**Rationale**: Official Vite template provides React 19+, TypeScript strict mode, HMR with Fast Refresh, and optimized production builds out of the box. No additional boilerplate or custom webpack configuration needed.

**Alternatives considered**:
- Create React App: Deprecated, no longer maintained
- Next.js: SSR-focused, unnecessary for a static SPA
- Manual setup: More effort, no benefit over the official template

**Key configuration**:
- `@vitejs/plugin-react` for JSX transform and Fast Refresh
- `base: '/jy/'` in `vite.config.ts` for GitHub Pages project page deployment
- `build.target: 'ES2020'` for modern browser output

## 2. Styling Approach

**Decision**: CSS Modules (`.module.css` files) co-located with components

**Rationale**: CSS Modules work out of the box in Vite with zero configuration. They provide scoped class names, preventing style collisions. No runtime CSS-in-JS overhead (aligns with constitution principle II — performance budget, and principle VI — simplicity).

**Alternatives considered**:
- Tailwind CSS: Adds a build dependency and utility-class approach; overkill for a small landing page
- vanilla-extract: Zero-runtime but requires additional tooling setup; unnecessary complexity
- Styled-components: Runtime CSS-in-JS, violates constitution (no runtime CSS-in-JS)
- Plain CSS: No scoping; risk of class name collisions as project grows

**File organization**: Each component gets a co-located `ComponentName.module.css` file

## 3. Font Strategy

**Decision**: System font stack (no external fonts)

**Rationale**: Zero network requests for fonts. Matches constitution principle II (no external font service requests at page load). Renders using the user's native OS font for familiarity.

**Sans-serif stack**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`

**Monospace stack** (for code blocks): `'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace`

## 4. Copy-to-Clipboard

**Decision**: Native Clipboard API via a custom `useCopyToClipboard` React hook

**Rationale**: The Clipboard API is supported in all target browsers (last 2 versions of Chrome, Firefox, Safari, Edge). No third-party dependency needed. Aligns with constitution principle VI (prefer native browser APIs).

**Fallback**: If the Clipboard API is unavailable (rare edge case), the hook returns a failure state. The UI can degrade gracefully (e.g., show "Select and copy manually").

**Pattern**: Custom hook returns `{ copied: boolean, copyToClipboard: (text: string) => Promise<boolean> }` with a configurable timeout for the "Copied!" state.

## 5. Theme Toggle (Dark/Light)

**Decision**: CSS custom properties with `data-theme` attribute on `<html>`, localStorage persistence, inline script to prevent FOUC (Flash of Unstyled Content)

**Rationale**: This is the industry-standard approach for theme switching in static sites. CSS custom properties allow instant re-theming without re-rendering React. The inline `<script>` in `index.html` runs before React hydrates, preventing a flash of the wrong theme.

**Implementation pattern**:
1. Inline script in `<head>` of `index.html` reads localStorage → sets `data-theme` on `<html>` before paint
2. `useTheme()` hook manages React state, syncs with localStorage, listens for OS preference changes
3. CSS defines all colors as custom properties under `:root` (light) and `[data-theme='dark']`

**Alternatives considered**:
- React context only: Would cause FOUC on first load since React hasn't rendered yet
- CSS-only with `prefers-color-scheme`: No manual toggle capability
- Third-party theme libraries: Unnecessary dependency for this simple use case

## 6. Testing Strategy

**Decision**: Vitest with `@testing-library/react` and `jsdom`

**Rationale**: Vitest is the natural testing companion for Vite projects — shares the same configuration, plugins, and module resolution. `@testing-library/react` is the standard for testing React components from a user perspective.

**Alternatives considered**:
- Jest: Requires separate configuration for ESM/TypeScript; Vitest is faster and native to Vite
- Cypress component testing: Heavier; better for E2E than unit/integration

**Key dependencies**: `vitest`, `@testing-library/react`, `@testing-library/dom`, `jsdom`

## 7. GitHub Pages Deployment

**Decision**: GitHub Actions workflow triggered on push to `gh-pages` branch, deploying via `actions/deploy-pages@v4`

**Rationale**: Aligns with constitution deployment strategy. Source stays in `gh-pages`, built files are never committed to the repo. GitHub handles the CDN and SSL.

**Key configuration**:
- `base: '/jy/'` in `vite.config.ts` (project page at `bilalshareef.github.io/jy`)
- GitHub Pages source set to "GitHub Actions" in repo settings
- Workflow uses `actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`
- Triggered on push to `gh-pages` branch (not `main`)
- Node.js 22 in the workflow (matching constitution requirement)

## 8. Accessibility Tooling

**Decision**: Manual ARIA attributes + Lighthouse CI checks in the deployment pipeline

**Rationale**: For a small landing page, manual ARIA roles on interactive elements (tabs, buttons, links) is sufficient. Lighthouse in CI validates accessibility scores meet the >= 95 target.

**Alternatives considered**:
- eslint-plugin-jsx-a11y: Good addition for development-time linting of accessibility — recommend including
- axe-core with Vitest: Possible for automated accessibility unit tests, but overkill for this scope

**Recommendation**: Add `eslint-plugin-jsx-a11y` to ESLint config for development-time feedback

## 9. Code Syntax Highlighting in Code Blocks

**Decision**: CSS-only styled code blocks with no syntax highlighting library

**Rationale**: The website displays short CLI commands (1-2 lines each), not multi-line source code. Full syntax highlighting libraries (Prism.js, highlight.js, Shiki) would add 15-50KB+ to the bundle for minimal visual benefit. Styled `<code>` blocks with a monospace font, appropriate background color, and good contrast are sufficient. This aligns with constitution principle VI (simplicity) and II (performance budget).

**Alternatives considered**:
- Prism.js: ~15KB + theme CSS; unnecessary for CLI one-liners
- Shiki: High-quality but heavy (~50KB+); designed for multi-line code
- highlight.js: ~30KB; overkill

**If needed later**: Can add Shiki as a build-time transform (zero runtime cost) via a Vite plugin
