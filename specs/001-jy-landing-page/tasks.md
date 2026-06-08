# Tasks: jy Landing Page

**Input**: Design documents from `specs/001-jy-landing-page/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not included — tests were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

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

- [ ] T001 Scaffold Vite + React + TypeScript project using `npm create vite@latest . -- --template react-ts` and verify it builds
- [ ] T002 Configure vite.config.ts with `base: '/jy/'`, `@vitejs/plugin-react`, and `build.target: 'ES2020'` in vite.config.ts
- [ ] T003 Configure TypeScript strict mode with `"strict": true`, `"jsx": "react-jsx"`, target `ES2020` in tsconfig.json
- [ ] T004 [P] Configure ESLint flat config with React, TypeScript, and jsx-a11y rules in eslint.config.mjs
- [ ] T005 [P] Configure Prettier with consistent formatting rules in .prettierrc.json
- [ ] T006 [P] Add npm scripts for `dev`, `build`, `preview`, `lint`, and `typecheck` in package.json
- [ ] T007 Remove Vite template boilerplate (default App.tsx content, App.css, assets/) and create clean empty App.tsx in src/App.tsx
- [ ] T008 Create CSS reset, system font stacks (sans-serif + monospace), and base CSS custom properties in src/styles/global.css
- [ ] T009 Create light/dark theme CSS custom properties (colors, backgrounds, borders, shadows) using `:root` and `[data-theme='dark']` selectors in src/styles/theme.css
- [ ] T010 Add inline theme detection script in `<head>` to prevent FOUC (read localStorage → set `data-theme` before paint) in index.html
- [ ] T011 [P] Add SEO meta tags (title, description, Open Graph, favicon link) in index.html
- [ ] T012 [P] Create favicon as a simple "jy" text SVG in public/favicon.svg

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared hooks and reusable components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T013 Implement `useCopyToClipboard` custom hook with Clipboard API, `copied` state, and configurable timeout in src/hooks/useCopyToClipboard.ts
- [ ] T014 Implement `useTheme` custom hook with localStorage persistence, OS preference fallback, and `prefers-color-scheme` change listener in src/hooks/useTheme.ts
- [ ] T015 Implement reusable CodeBlock component with `<pre><code>`, monospace styling, copy-to-clipboard button, and "Copied!" feedback in src/components/CodeBlock/CodeBlock.tsx and src/components/CodeBlock/CodeBlock.module.css

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Install jy from the Website (Priority: P1) 🎯 MVP

**Goal**: A visitor lands on the site and can immediately copy an install command (npm or curl). Windows users see a Releases link. Platform support is visible at a glance.

**Independent Test**: Visit the page → see tagline + install tabs → switch tabs → copy command → verify Windows note → verify platform icons

### Implementation for User Story 1

- [ ] T016 [US1] Implement Hero component with tagline, description text, and layout container in src/components/Hero/Hero.tsx and src/components/Hero/Hero.module.css
- [ ] T017 [US1] Implement InstallTabs component with npm/Script tab switching, ARIA tablist/tab/tabpanel roles, CodeBlock integration, and Windows note with Releases link in src/components/InstallTabs/InstallTabs.tsx and src/components/InstallTabs/InstallTabs.module.css
- [ ] T018 [US1] Implement PlatformIcons component with OS icons (Linux, macOS, Windows), architecture labels (x64, arm64), and npm note in src/components/PlatformIcons/PlatformIcons.tsx and src/components/PlatformIcons/PlatformIcons.module.css
- [ ] T019 [US1] Compose Hero section in App.tsx: Hero → InstallTabs → PlatformIcons, verify above-the-fold layout on 1920×1080 in src/App.tsx and src/App.module.css
- [ ] T020 [US1] Add responsive styles for Hero, InstallTabs, and PlatformIcons: mobile-first layout, tappable copy buttons (≥44px), wrapping platform icons row in src/components/Hero/Hero.module.css, src/components/InstallTabs/InstallTabs.module.css, and src/components/PlatformIcons/PlatformIcons.module.css

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 3 — Navigate to GitHub and Docs (Priority: P3)

**Goal**: Sticky navigation bar with "jy" brand, Docs link, theme toggle, and GitHub icon. Theme switching works with localStorage persistence.

**Independent Test**: Scroll page → navbar stays fixed → click Docs → opens README in new tab → click GitHub icon → opens repo in new tab → click theme toggle → theme switches and persists

> **Note**: US3 is prioritized before US4/US5/US2 because the Navbar + ThemeToggle are foundational UI elements needed for all subsequent stories to look complete.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Implement ThemeToggle component with sun/moon icon button, aria-label for current state, and onToggle callback in src/components/ThemeToggle/ThemeToggle.tsx and src/components/ThemeToggle/ThemeToggle.module.css
- [ ] T022 [US3] Implement Navbar component with "jy" brand, Docs link (README URL, new tab), ThemeToggle, GitHub icon (repo URL, new tab), sticky positioning, and aria-labels in src/components/Navbar/Navbar.tsx and src/components/Navbar/Navbar.module.css
- [ ] T023 [US3] Integrate Navbar and useTheme hook in App.tsx: pass theme and toggleTheme to Navbar, ensure sticky nav doesn't obscure content (add top padding to main content) in src/App.tsx
- [ ] T024 [US3] Add responsive styles for Navbar: compact layout on mobile, touch-friendly targets (≥44px), ensure all elements remain accessible on 320px viewport in src/components/Navbar/Navbar.module.css

**Checkpoint**: At this point, User Stories 1 AND 3 should both work independently

---

## Phase 5: User Story 4 — Understand Why jy Exists (Priority: P4)

**Goal**: A "Why jy?" section explains the Unix philosophy positioning, contrasts with yq/jq, and highlights what jy intentionally omits.

**Independent Test**: Scroll to "Why jy?" section → read content → verify it mentions Unix philosophy, yq/jq contrast, and what jy omits

### Implementation for User Story 4

- [ ] T025 [US4] Implement WhyJy component with section heading, value proposition content (Unix philosophy, yq/jq contrast, intentional omissions), and semantic HTML in src/components/WhyJy/WhyJy.tsx and src/components/WhyJy/WhyJy.module.css
- [ ] T026 [US4] Add WhyJy to App.tsx section composition after Hero in src/App.tsx

**Checkpoint**: User Stories 1, 3, AND 4 should all work independently

---

## Phase 6: User Story 5 — Scan Key Features at a Glance (Priority: P5)

**Goal**: Four feature cards (Zero Friction, Zero Config, Zero Dependencies, CI-Ready) displayed in a responsive grid.

**Independent Test**: Scroll to features section → verify 4 cards with correct titles and descriptions → resize to mobile → cards stack vertically

### Implementation for User Story 5

- [ ] T027 [P] [US5] Implement FeatureCard component with title, description, optional icon/emoji, and card styling (borders, rounded corners, shadows) in src/components/Features/FeatureCard.tsx (styled via Features.module.css)
- [ ] T028 [US5] Implement Features component composing 4 FeatureCard instances with correct content, 2×2 grid layout on desktop, single column on mobile in src/components/Features/Features.tsx and src/components/Features/Features.module.css
- [ ] T029 [US5] Add Features to App.tsx section composition after WhyJy in src/App.tsx

**Checkpoint**: User Stories 1, 3, 4, AND 5 should all work independently

---

## Phase 7: User Story 2 — Learn How to Use jy (Priority: P2)

**Goal**: Categorized CLI usage examples with copy buttons covering basic conversion, stdin/stdout, multiple files, --out, --validate, and formatting options.

**Independent Test**: Scroll to usage section → verify all 6 categories → copy a command → verify clipboard content

### Implementation for User Story 2

- [ ] T030 [US2] Implement Usage component with categorized code examples (basic conversion, stdin/stdout, multiple files, --out, --validate, formatting), each using CodeBlock with copy button, and short descriptions in src/components/Usage/Usage.tsx and src/components/Usage/Usage.module.css
- [ ] T031 [US2] Add Usage to App.tsx section composition after Features in src/App.tsx
- [ ] T032 [US2] Add responsive styles for Usage: horizontally scrollable code blocks on mobile, readable text at 320px in src/components/Usage/Usage.module.css

**Checkpoint**: User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: Footer & Theme Completion (Priority: P1/P6)

**Goal**: Footer with centered author credit (linked name) and final theme polish ensuring both light and dark modes have correct contrast and visual coherence.

**Independent Test**: Scroll to bottom → verify footer text centered → click name link → opens personal site in new tab → toggle theme → verify both modes look polished

### Implementation

- [ ] T033 Implement Footer component with "Made with ❤️ by Mohammed Bilal Shareef" centered text, author name as link to personal website (new tab), and visual separator in src/components/Footer/Footer.tsx and src/components/Footer/Footer.module.css
- [ ] T034 Add Footer to App.tsx as the final section in src/App.tsx
- [ ] T035 [US6] Review and polish both light and dark theme CSS variables: verify WCAG 2.1 AA contrast ratios for all text, interactive elements, code blocks, and feature cards in src/styles/theme.css
- [ ] T036 [US6] Add `prefers-reduced-motion` media query to suppress/reduce any CSS transitions in src/styles/global.css

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Visual refinement, deployment, and final validation

- [ ] T037 [P] Review and refine visual polish: consistent spacing, typography hierarchy, section separators, and visual rhythm across all sections in src/App.module.css and individual component CSS files
- [ ] T038 [P] Create GitHub Actions workflow for build + deploy to GitHub Pages on push to `gh-pages` branch (Node.js 22, npm ci, npm run build, upload-pages-artifact, deploy-pages) in .github/workflows/deploy.yml
- [ ] T039 [P] Add .gitignore entries for node_modules/, dist/, and other build artifacts in .gitignore
- [ ] T040 Verify production build: run `npm run build && npm run preview`, check bundle size < 200KB gzipped, test all sections in built output
- [ ] T041 Run quickstart.md validation scenarios 1–10 against the production build to confirm all acceptance criteria pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P3 → P4 → P5 → P2)
  - US3 (Navbar) before US4/US5/US2 because it provides the page shell
- **Footer & Theme (Phase 8)**: Depends on all content sections being complete
- **Polish (Phase 9)**: Depends on all user stories and footer being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — ThemeToggle depends on useTheme hook from Phase 2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) — Static content, no component dependencies
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) — Static content, no component dependencies
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — Depends on CodeBlock from Phase 2
- **User Story 6 (P6)**: Theme foundation set in Phase 2; final polish in Phase 8 after all sections exist

### Within Each User Story

- Components before composition in App.tsx
- Layout before responsive refinement
- Core implementation before accessibility polish

### Parallel Opportunities

- T004, T005, T006 can run in parallel (linting, formatting, scripts — different config files)
- T011, T012 can run in parallel (SEO meta, favicon — different files)
- T021 (ThemeToggle) can start in parallel with Phase 3 (US1) since it's a standalone component
- T027 (FeatureCard) can start in parallel with Phase 5 (US4) since it's a standalone component
- T037, T038, T039 can all run in parallel (polish, CI workflow, gitignore — different files)

---

## Parallel Example: User Story 1

```
T016 (Hero) ─────────┐
                      ├──→ T019 (Compose in App.tsx) ──→ T020 (Responsive)
T017 (InstallTabs) ──┤
                      │
T018 (PlatformIcons) ─┘
```

T016, T017, T018 can be built in parallel (different component directories), then T019 composes them, and T020 adds responsive polish.

## Implementation Strategy

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) delivers a functional landing page where users can install jy. This is the minimum viable deployment.

**Incremental Delivery Order**:
1. Setup + Foundational → deployable empty shell
2. US1 (Hero/Install) → MVP — users can install jy
3. US3 (Navbar) → navigation, theme toggle, links
4. US4 (Why jy?) → value proposition
5. US5 (Features) → feature cards
6. US2 (Usage) → usage examples
7. Footer + Theme Polish → final visual refinement
8. Polish + Deploy → production-ready
