<!--
  Sync Impact Report
  Version change: 1.0.1 → 1.0.2 (clarify deployment pipeline)
  Modified principles: None
  Added sections: None
  Removed sections: None
  Modified sections:
    - Development Workflow: added GitHub Actions deployment strategy
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ no changes needed (dynamic reference)
    - .specify/templates/spec-template.md ✅ no changes needed (principle-agnostic)
    - .specify/templates/tasks-template.md ✅ no changes needed (principle-agnostic)
  Follow-up TODOs: None
-->

# jy Website Constitution

## Core Principles

### I. Static-First Delivery

All pages MUST be statically generated or pre-rendered at build time.
No server-side runtime is permitted in production. The website MUST
be deployed to GitHub Pages from the `gh-pages` branch of the `jy`
repository (`github.com/bilalshareef/jy`).

**Rationale**: The `jy` CLI tool values zero configuration and zero
dependencies. Its website MUST reflect the same philosophy — fast,
simple, and hosted directly alongside the tool's source code.

### II. Performance Budget

Every page MUST achieve a Lighthouse Performance score of 90 or above
on mobile. Total JavaScript bundle size MUST NOT exceed 200 KB
(gzipped) for the initial page load. All images MUST use modern
formats (WebP/AVIF) with responsive sizing. Fonts MUST be
self-hosted or system fonts — no external font service requests at
page load.

**Rationale**: A developer tools website must load instantly. Users
arriving from a terminal context expect sub-second responsiveness.

### III. Accessibility (NON-NEGOTIABLE)

The website MUST conform to WCAG 2.1 Level AA at minimum. All
interactive elements MUST be keyboard navigable. Color contrast
ratios MUST meet AA thresholds (4.5:1 for normal text, 3:1 for
large text). Semantic HTML elements MUST be used over generic
`div`/`span` wrappers. Every image MUST have descriptive `alt` text.

**Rationale**: Developer documentation must be universally accessible.
Accessibility is not an enhancement — it is a baseline requirement.

### IV. Component-Driven Architecture

UI MUST be composed of small, single-responsibility React components.
Components MUST NOT exceed 150 lines of code. Business logic MUST be
separated from presentation via custom hooks or utility modules.
Shared components MUST reside in a `components/` directory; page-level
components MUST reside in a `pages/` directory.

**Rationale**: Small, focused components are easier to test, review,
and replace. This aligns with the Unix philosophy that `jy` itself
follows.

### V. Content Accuracy

All CLI examples, flags, exit codes, and installation instructions
displayed on the website MUST match the canonical `jy` repository
README and documentation. When the CLI tool releases a new version,
the website content MUST be reviewed and updated before deployment.

**Rationale**: Incorrect documentation is worse than no documentation.
Users copy commands directly from the website into their terminals.

### VI. Simplicity & Minimalism

No feature or dependency MUST be added without a clear, documented
justification. Prefer native browser APIs and CSS over third-party
libraries. YAGNI (You Aren't Gonna Need It) applies to all
decisions. The website MUST NOT include analytics, tracking scripts,
or cookie banners unless explicitly required and approved.

**Rationale**: The `jy` tool ships with zero runtime dependencies.
The website should demonstrate the same discipline — every dependency
is a maintenance liability.

### VII. Responsive Design

The website MUST be fully functional and visually coherent across
viewport widths from 320px (mobile) to 2560px (ultra-wide). A
mobile-first CSS approach MUST be used. No horizontal scrolling
MUST occur on any supported viewport. Interactive elements MUST
have touch-friendly tap targets (minimum 44x44px).

**Rationale**: Developers browse documentation on phones, tablets,
and wide monitors. The experience must be seamless across all of
them.

## Technology Stack

- **Framework**: React 18+ with Vite as the build tool
- **Language**: TypeScript (strict mode enabled)
- **Styling**: CSS Modules or a zero-runtime CSS solution (e.g.,
  vanilla-extract). No runtime CSS-in-JS libraries
- **Linting**: ESLint with recommended React and TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Package Manager**: npm (lockfile committed)
- **Deployment Target**: GitHub Pages (from the `gh-pages` branch)
- **Node.js**: >= 22.0.0 (matching the `jy` CLI requirement)
- **Browser Support**: Last 2 versions of Chrome, Firefox, Safari,
  and Edge

## Development Workflow

- **Branch strategy**: The `main` branch contains the `jy` CLI tool
  source code. The `gh-pages` branch contains the website source.
  Website feature branches MUST branch from and merge into `gh-pages`
- **Deployment**: A GitHub Actions workflow MUST trigger on push to
  `gh-pages`, run `npm run build`, and deploy the output to GitHub
  Pages. GitHub Pages MUST be configured to deploy via **GitHub
  Actions** (not branch-based deployment) in the repository settings.
  Built files MUST NOT be committed to the repository
- All code changes MUST go through pull requests with at least one
  approval before merging
- The `gh-pages` branch MUST always be in a deployable state
- Commits MUST follow the Conventional Commits specification
  (e.g., `feat:`, `fix:`, `docs:`, `chore:`)
- CI pipeline MUST run lint, type-check, and build on every pull
  request. Failures MUST block merge
- Production builds MUST be tested locally via `vite preview` before
  creating a pull request
- Dependencies MUST be audited for known vulnerabilities before
  addition (`npm audit`)
- No direct pushes to `gh-pages` — all changes via feature branches

## Governance

This constitution supersedes all ad-hoc practices and verbal
agreements for the jy website project. All pull requests and code
reviews MUST verify compliance with these principles.

**Amendment Process**: Any principle change MUST be documented with
rationale, reviewed, and approved before taking effect. The version
number MUST be incremented following semantic versioning:
- MAJOR: Principle removal or backward-incompatible redefinition
- MINOR: New principle or material expansion of existing guidance
- PATCH: Clarifications, wording fixes, non-semantic refinements

**Compliance Review**: Principles MUST be revisited quarterly or when
the `jy` CLI ships a major version, whichever comes first.

**Version**: 1.0.2 | **Ratified**: 2026-06-08 | **Last Amended**: 2026-06-08
