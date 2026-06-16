# Tasks: jy Landing Page

**Input**: Design documents from `specs/001-jy-landing-page/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Status**: All tasks DONE — implementation complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `public/` at repository root
- Component co-location: `src/components/ComponentName/ComponentName.tsx` + `.module.css`
- Hooks: `src/hooks/hookName.ts`
- Styles: `src/styles/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling configuration, and base structure

- [x] T001 Scaffold Vite + React + TypeScript project using `npm create vite@latest . -- --template react-ts` and verify it builds
- [x] T002 Configure vite.config.ts with `base: '/jy/'`, `@vitejs/plugin-react`, and `build.target: 'ES2020'` in vite.config.ts
- [x] T003 Configure TypeScript strict mode with `"strict": true`, `"jsx": "react-jsx"`, target `ES2020` in tsconfig.json, tsconfig.app.json, and tsconfig.node.json
- [x] T004 [P] Configure ESLint flat config with React and TypeScript rules in eslint.config.js
- [x] T005 [P] Add npm scripts for `dev`, `build`, `preview`, and `lint` in package.json
- [x] T006 Remove Vite template boilerplate (default App.tsx content, App.css, assets/) and create clean App.tsx in src/App.tsx
- [x] T007 Create CSS reset, system font stacks (sans-serif + monospace), base focus styles, and `prefers-reduced-motion` support in src/styles/global.css
- [x] T008 [P] Add SEO meta tags (title, description, Open Graph, favicon link) in index.html
- [x] T009 [P] Create favicon as a simple "jy" text SVG in public/favicon.svg

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared hooks and reusable components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Implement `useCopyToClipboard` custom hook with native Clipboard API, `copied` boolean state, and configurable timeout (default 2000ms) in src/hooks/useCopyToClipboard.ts
- [x] T011 Implement reusable CodeBlock component with flex layout (`.inner` wrapper, `pre` with `flex:1`, copy button with `flex-shrink:0`), monospace styling, copy-to-clipboard button using `useCopyToClipboard`, and "Copied!" feedback in src/components/CodeBlock/CodeBlock.tsx and src/components/CodeBlock/CodeBlock.module.css

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Install jy from the Website (Priority: P1) 🎯 MVP

**Goal**: A visitor lands on the site and can immediately copy an install command (npm or curl). Windows users see a Releases link. Platform support is visible at a glance.

**Independent Test**: Visit the page → see tagline + install tabs → switch tabs → copy command → verify Windows note → verify platform icons

### Implementation for User Story 1

- [x] T012 [US1] Implement Hero component with gradient text tagline, description text, dark gradient background (#0f172a → #1e1b4b → #312e81), radial color glows (purple, blue, pink), and `children` prop for composing InstallTabs + PlatformIcons in src/components/Hero/Hero.tsx and src/components/Hero/Hero.module.css
- [x] T013 [US1] Implement InstallTabs component with npm/Script pill-style tab switching (gradient active state #6366f1 → #8b5cf6 with glowing box-shadow), ARIA tablist/tab/tabpanel roles, CodeBlock integration, and Windows note with Releases link in src/components/InstallTabs/InstallTabs.tsx and src/components/InstallTabs/InstallTabs.module.css
- [x] T014 [US1] Implement PlatformIcons component with inline SVG OS icons (Linux, macOS, Windows), architecture labels (x64, arm64), npm note, and responsive wrapping in src/components/PlatformIcons/PlatformIcons.tsx and src/components/PlatformIcons/PlatformIcons.module.css
- [x] T015 [US1] Compose Hero section in App.tsx: Hero wrapping InstallTabs and PlatformIcons as children, verify above-the-fold layout on 1920×1080 in src/App.tsx and src/App.module.css
- [x] T016 [US1] Add responsive styles for Hero, InstallTabs, and PlatformIcons: tappable copy buttons (≥44px), wrapping platform icons row on narrow viewports in src/components/Hero/Hero.module.css, src/components/InstallTabs/InstallTabs.module.css, and src/components/PlatformIcons/PlatformIcons.module.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 — Navigate to GitHub and Docs (Priority: P3)

**Goal**: Sticky navigation bar with "jy" brand, Docs link, and GitHub icon. Glass-effect translucent background.

**Independent Test**: Scroll page → navbar stays fixed with glass effect → click Docs → opens README in new tab → click GitHub icon → opens repo in new tab → keyboard navigate all elements

> **Note**: US3 is prioritized before US4/US5/US2 because the Navbar is a foundational UI element needed for all subsequent stories to look complete.

### Implementation for User Story 3

- [x] T017 [US3] Implement Navbar component with "jy" brand (left), Docs link (README URL, new tab) and GitHub SVG icon (repo URL, new tab) on right, sticky positioning via `position: fixed`, glass-effect background (`rgba(15,23,42,0.85)` with `backdrop-filter: blur()`), and aria-labels on all links in src/components/Navbar/Navbar.tsx and src/components/Navbar/Navbar.module.css
- [x] T018 [US3] Integrate Navbar in App.tsx, ensure sticky nav doesn't obscure content (add top padding to main content) in src/App.tsx
- [x] T019 [US3] Add responsive styles for Navbar: compact layout on mobile, touch-friendly targets (≥44px), ensure all elements remain accessible on 320px viewport in src/components/Navbar/Navbar.module.css

**Checkpoint**: At this point, User Stories 1 AND 3 should both work independently

---

## Phase 5: User Story 4 — Understand Why jy Exists (Priority: P4)

**Goal**: A "Why jy?" section explains the Unix philosophy positioning, contrasts with yq/jq, and highlights what jy intentionally omits.

**Independent Test**: Scroll to "Why jy?" section → read content → verify it mentions Unix philosophy, yq/jq contrast, and what jy omits

### Implementation for User Story 4

- [x] T020 [US4] Implement WhyJy component with section heading, value proposition content (Unix philosophy, yq/jq contrast, intentional omissions), white cards on #fafafa background with indigo accent bars, and semantic HTML in src/components/WhyJy/WhyJy.tsx and src/components/WhyJy/WhyJy.module.css
- [x] T021 [US4] Add WhyJy to App.tsx section composition after Hero in src/App.tsx

**Checkpoint**: User Stories 1, 3, AND 4 should all work independently

---

## Phase 6: User Story 5 — Scan Key Features at a Glance (Priority: P5)

**Goal**: Four feature cards (Zero Friction, Zero Config, Zero Dependencies, CI-Ready) displayed in a responsive 4-column grid with unique accent colors.

**Independent Test**: Scroll to features section → verify 4 cards with correct titles, descriptions, and unique top-border accent colors → resize to tablet (2 columns) → resize to mobile (1 column)

### Implementation for User Story 5

- [x] T022 [US5] Implement Features component with 4 inline feature cards (no separate FeatureCard component), unique top-border accent colors (amber, indigo, emerald, pink), 4-column CSS Grid on desktop (>900px, container 1100px), 2 columns on tablet (641–900px), 1 column on mobile (≤640px) in src/components/Features/Features.tsx and src/components/Features/Features.module.css
- [x] T023 [US5] Add Features to App.tsx section composition after WhyJy in src/App.tsx

**Checkpoint**: User Stories 1, 3, 4, AND 5 should all work independently

---

## Phase 7: User Story 2 — Learn How to Use jy (Priority: P2)

**Goal**: Categorized CLI usage examples with copy buttons covering basic conversion, stdin/stdout, multiple files, --out, --validate, and formatting options.

**Independent Test**: Scroll to usage section → verify all 6 categories → copy a command → verify clipboard content

### Implementation for User Story 2

- [x] T024 [US2] Implement Usage component with categorized code examples (basic conversion, stdin/stdout, multiple files, --out, --validate, formatting), each using CodeBlock with copy button, short descriptions, and light background with dark text (#1e293b) in src/components/Usage/Usage.tsx and src/components/Usage/Usage.module.css
- [x] T025 [US2] Add Usage to App.tsx section composition after Features in src/App.tsx
- [x] T026 [US2] Add responsive styles for Usage: horizontally scrollable code blocks on mobile, readable text at 320px in src/components/Usage/Usage.module.css

**Checkpoint**: User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: Footer

**Goal**: Footer with centered author credit (linked name) and dark gradient background matching hero/navbar.

**Independent Test**: Scroll to bottom → verify footer text centered → click name link → opens personal site in new tab

### Implementation

- [x] T027 Implement Footer component with "Made with ❤️ by Mohammed Bilal Shareef" centered text, author name as link to personal website (new tab, rel="noopener noreferrer"), dark gradient background, and visual separator in src/components/Footer/Footer.tsx and src/components/Footer/Footer.module.css
- [x] T028 Add Footer to App.tsx as the final section in src/App.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinement, deployment, and final validation

- [x] T029 [P] Review and refine visual polish: consistent spacing, typography hierarchy, section transitions, gradient text effects, and visual rhythm across all sections in src/App.module.css and individual component CSS files
- [x] T030 [P] Verify all CSS uses hardcoded values only — no CSS custom properties (var(--*)) anywhere per FR-045. Colors like #6366f1, #0f172a, #e2e8f0 repeated directly in each .module.css file
- [x] T031 [P] Create GitHub Actions workflow for build + deploy to GitHub Pages on push to `gh-pages` branch (Node.js 22, npm ci, npm run build, upload-pages-artifact, deploy-pages) in .github/workflows/deploy.yml
- [x] T032 [P] Add .gitignore entries for node_modules/, dist/, and other build artifacts in .gitignore
- [x] T033 Verify production build: run `npm run build && npm run preview`, check bundle size ~64KB gzipped (under 200KB limit), test all sections in built output
- [x] T034 Run quickstart.md validation scenarios against the production build to confirm all acceptance criteria pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P3 → P4 → P5 → P2)
  - US3 (Navbar) before US4/US5/US2 because it provides the page shell
- **Footer (Phase 8)**: Depends on all content sections being complete
- **Polish (Phase 9)**: Depends on all user stories and footer being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Standalone Navbar, no theme system
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) — Static content, no component dependencies
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) — Static content, inline feature cards
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Depends on CodeBlock from Phase 2

### Within Each User Story

- Components before composition in App.tsx
- Layout before responsive refinement
- Core implementation before accessibility polish

### Parallel Opportunities

- T004, T005 can run in parallel (linting, scripts — different config files)
- T008, T009 can run in parallel (SEO meta, favicon — different files)
- T012, T013, T014 can run in parallel (Hero, InstallTabs, PlatformIcons — different component dirs)
- T029, T030, T031, T032 can all run in parallel (polish, CSS audit, CI workflow, gitignore — different concerns)

---

## Parallel Example: User Story 1

```
T012 (Hero) ─────────┐
                      ├──→ T015 (Compose in App.tsx) ──→ T016 (Responsive)
T013 (InstallTabs) ──┤
                      │
T014 (PlatformIcons) ─┘
```

T012, T013, T014 can be built in parallel (different component directories), then T015 composes them, and T016 adds responsive polish.

## Implementation Strategy

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) delivers a functional landing page where users can install jy. This is the minimum viable deployment.

**Incremental Delivery Order**:
1. Setup + Foundational → deployable empty shell
2. US1 (Hero/Install) → MVP — users can install jy
3. US3 (Navbar) → navigation and links (no theme toggle)
4. US4 (Why jy?) → value proposition
5. US5 (Features) → 4-column feature cards
6. US2 (Usage) → usage examples
7. Footer → author credit
8. Polish + Deploy → production-ready

**Key Design Decisions Reflected**:
- No theme system: Single dark-on-light design, no useTheme hook, no ThemeToggle, no theme.css, no CSS custom properties
- CSS Modules with hardcoded color values throughout (FR-045)
- Feature cards rendered inline in Features.tsx (no separate FeatureCard component)
- 4-column features grid on desktop (>900px), 2 columns tablet, 1 column mobile
- CodeBlock uses flex layout with `.inner` wrapper
- Glass-effect Navbar with backdrop-filter blur
- ~64KB gzipped JS bundle, zero external runtime dependencies
