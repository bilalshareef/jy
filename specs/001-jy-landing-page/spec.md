# Feature Specification: jy Landing Page

**Feature Branch**: `gh-pages-speckit`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Build a single-page website for the jy CLI tool. Hero/install fold with npm and curl install methods, usage fold, GitHub icon link, footer with author credit. Additional sections: Why jy?, Features at a Glance, Supported Platforms. Auto dark/light theme."

**Page Section Order**: Navigation → Hero/Install (Fold 1) → Why jy? → Features at a Glance → Usage → Footer

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Install jy from the Website (Priority: P1)

A developer discovers jy and visits the website. They land on the hero section, immediately see what jy does, and copy an install command to get started. They can choose between npm global install or curl one-liner (Linux/macOS), copy the command with one click, and paste it into their terminal. For Windows standalone binary users, a clear note below the install tabs directs them to the GitHub Releases page. A compact row of OS icons with architecture labels shows supported platforms at a glance. They have jy installed and running in under 60 seconds.

**Why this priority**: The primary purpose of the website is to convert visitors into users. If someone can't quickly find and copy the install command, the site fails its core mission.

**Independent Test**: Can be fully tested by visiting the page, reading the hero content, switching between install methods, copying commands, and verifying the Windows Releases link. Delivers the "install jy" value without any other section.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the website, **When** the page loads, **Then** they see a clear tagline explaining what jy does, two install methods (npm and curl), and supported platform icons without scrolling
2. **Given** a visitor is viewing the hero section, **When** they see the install commands, **Then** each command has a visible copy-to-clipboard button
3. **Given** a visitor clicks the copy button for an install command, **When** the command is copied, **Then** a brief visual confirmation (e.g., "Copied!" tooltip or icon change) appears
4. **Given** a visitor is viewing the install section, **When** they switch between npm and Script tabs, **Then** the corresponding install command is displayed and the active tab is visually highlighted
5. **Given** a visitor is on a mobile device, **When** they view the hero section, **Then** install commands are fully visible without horizontal scrolling and copy buttons are tappable
6. **Given** a Windows user views the hero section, **When** they look below the install tabs, **Then** they see a note explaining they can download the standalone binary from the Releases page with a clickable link
7. **Given** a visitor views the hero section, **When** they look below the install area, **Then** they see OS icons (Linux, macOS, Windows) with architecture labels (x64, arm64) in a compact horizontal row

---

### User Story 2 - Learn How to Use jy (Priority: P2)

A developer has installed jy and wants to learn how to use it. They scroll to the usage section (after Why jy? and Features sections) and see practical examples showing common conversion tasks: JSON to YAML, YAML to JSON, stdin piping, multiple files, output directory, validation, and formatting options. Each code block has a copy-to-clipboard button for quick command copying.

**Why this priority**: After installation, the immediate next step is learning usage. Without clear usage examples, users cannot derive value from the tool.

**Independent Test**: Can be tested by scrolling to the usage section and verifying all usage categories (basic conversion, stdin/stdout, multiple files, output directory, validation, formatting) are displayed with copy-friendly code snippets and copy buttons.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls past the Why jy? and Features sections, **When** the usage section enters the viewport, **Then** they see categorized code examples for basic conversion, stdin/stdout, multiple files, output directory, validation, and formatting options
2. **Given** a visitor views a code example, **When** they read the snippet, **Then** each example shows both the command and a brief description of what it does
3. **Given** a visitor views a code example, **When** they hover over or focus on the code block, **Then** a copy-to-clipboard button is visible and functional
4. **Given** a visitor is on a mobile device, **When** they view code examples, **Then** the code blocks are horizontally scrollable within their container and text is readable

---

### User Story 3 - Navigate to GitHub and Docs (Priority: P3)

A developer wants to view the source code, file an issue, read full documentation, or contribute to jy. The sticky navigation bar contains a GitHub icon that opens the repository and a "Docs" button that opens the README — both in new tabs. A theme toggle button allows switching between light and dark modes.

**Why this priority**: Providing direct access to the source code and documentation builds trust and enables community engagement. The theme toggle and sticky nav improve usability across a longer page.

**Independent Test**: Can be tested by verifying the GitHub icon, Docs button, and theme toggle are visible in the sticky navigation at all scroll positions, and that clicking GitHub/Docs opens the correct URLs in new tabs.

**Acceptance Scenarios**:

1. **Given** a visitor is on any part of the page, **When** they look at the navigation area, **Then** the navigation bar is sticky (fixed at the top of the viewport) and contains the tool name "jy", a "Docs" button, a theme toggle, and a GitHub icon
2. **Given** a visitor clicks the GitHub icon, **When** the browser processes the click, **Then** the jy repository (`https://github.com/bilalshareef/jy`) opens in a new tab
3. **Given** a visitor clicks the "Docs" button, **When** the browser processes the click, **Then** the jy README (`https://github.com/bilalshareef/jy/blob/main/README.md`) opens in a new tab
4. **Given** a visitor clicks the theme toggle, **When** the theme switches, **Then** the page immediately re-renders in the opposite color scheme and the choice is persisted in localStorage
5. **Given** a visitor uses keyboard navigation, **When** they tab to any navigation element and press Enter, **Then** the corresponding action (link opens in new tab, or theme toggles) executes

---

### User Story 4 - Understand Why jy Exists (Priority: P4)

A developer is evaluating jy against alternatives like yq or jq. They scroll to the "Why jy?" section and immediately understand the value proposition: jy does one thing well — format conversion — without the overhead of query languages, transformation pipelines, or dozens of flags.

**Why this priority**: Differentiation helps users decide whether jy fits their use case. This reduces abandoned evaluations and clarifies scope expectations.

**Independent Test**: Can be tested by reading the "Why jy?" section and verifying it communicates the Unix philosophy positioning and contrast with alternatives.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the "Why jy?" section, **When** they read the content, **Then** the section explains what makes jy different from tools like yq and jq
2. **Given** a visitor reads the section, **When** they finish, **Then** they understand jy's scope (format conversion only) and philosophy (do one thing well)

---

### User Story 5 - Scan Key Features at a Glance (Priority: P5)

A developer wants a quick summary of jy's key qualities without reading paragraphs of text. They see a visually distinct features section with four key selling points: Zero Friction, Zero Config, Zero Dependencies, and CI-Ready.

**Why this priority**: Feature cards provide scannable information for visitors who are evaluating quickly. They reinforce the value proposition visually.

**Independent Test**: Can be tested by verifying four feature cards are displayed with titles and brief descriptions.

**Acceptance Scenarios**:

1. **Given** a visitor scrolls to the features section, **When** they view the content, **Then** four distinct feature cards are visible with clear titles and brief descriptions
2. **Given** a visitor is on a narrow screen, **When** they view the features section, **Then** the cards stack vertically and remain fully readable

---

### User Story 6 - View Page with Preferred Color Scheme (Priority: P6)

A developer visits the website and the page automatically matches their operating system's light or dark mode preference. They can also manually toggle the theme via a button in the navigation bar. Their manual choice is persisted in localStorage so it is remembered on subsequent visits. The site is readable and visually consistent in both modes.

**Why this priority**: Respecting user preferences is a quality-of-life detail. Developers frequently work in dark mode and a bright page can be jarring. Manual override gives users full control.

**Independent Test**: Can be tested by toggling the OS color scheme preference and verifying the website updates accordingly. Then testing the manual toggle and verifying persistence across page reloads.

**Acceptance Scenarios**:

1. **Given** a first-time visitor's OS is set to dark mode, **When** they load the website, **Then** the page renders with a dark color scheme
2. **Given** a first-time visitor's OS is set to light mode, **When** they load the website, **Then** the page renders with a light color scheme
3. **Given** a visitor clicks the theme toggle in the navigation, **When** the theme switches, **Then** the page re-renders in the opposite scheme and the choice is saved to localStorage
4. **Given** a visitor previously toggled the theme manually, **When** they revisit the website, **Then** the page renders with their previously chosen theme (overriding OS preference)
5. **Given** a visitor clears their browser storage, **When** they revisit the website, **Then** the page falls back to the OS color scheme preference

---

### Edge Cases

- What happens when a visitor has JavaScript disabled? The page should still display all static content (text, install commands, platform icons) since it is statically generated. The theme toggle and copy buttons will not function, but content remains readable in the OS-default color scheme.
- How does the copy-to-clipboard button behave on browsers that don't support the Clipboard API? A graceful fallback should be provided (e.g., selecting the text for manual copying).
- What happens on extremely narrow viewports (< 320px)? Content should remain readable with no layout breakage. Platform icons row should wrap.
- What happens if a visitor uses a screen reader? All content, including install command tabs, code blocks, theme toggle, and navigation links, must be accessible with proper ARIA labels.
- How does the page handle the `prefers-reduced-motion` media query? Animations (if any) should be suppressed.
- What happens if a visitor's localStorage is full or blocked (e.g., private browsing)? Theme toggle should still function for the current session but gracefully degrade without persistence.

## Clarifications

### Session 2026-06-08

- Q: How should the three install paths (npm, curl, Windows download) be structured? → A: Two primary tabs (npm / Script) + a note below for Windows standalone binary with a link to the Releases page
- Q: Should the user's manual theme choice persist across page visits? → A: Yes, persist in localStorage; defaults to OS preference on first visit
- Q: How should supported platforms be displayed in the hero? → A: OS icons (Linux, macOS, Windows) with architecture labels in a compact horizontal row beneath the install area
- Q: Should usage section code examples also have copy-to-clipboard buttons? → A: Yes, every code block has a copy-to-clipboard button
- Q: Should the navigation bar be sticky or static? → A: Sticky — fixed at the top of the viewport while scrolling

## Requirements *(mandatory)*

### Functional Requirements

#### Navigation

- **FR-001**: The page MUST display a sticky navigation bar fixed at the top of the viewport. The left side MUST show the tool name "jy". The right side MUST contain (in order): a "Docs" button, a theme toggle button, and a GitHub icon
- **FR-002**: The GitHub icon MUST link to `https://github.com/bilalshareef/jy` and MUST open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`)
- **FR-003**: The "Docs" button MUST link to `https://github.com/bilalshareef/jy/blob/main/README.md` and MUST open in a new tab
- **FR-004**: The theme toggle button MUST switch between light and dark color schemes. It MUST persist the user's choice in localStorage. On first visit, the default theme MUST match the user's OS preference (`prefers-color-scheme`)
- **FR-005**: The navigation bar MUST remain sticky (fixed at top) on all viewports and MUST not overlap or obscure page content

#### Hero / Install Section (Fold 1)

- **FR-006**: The hero section MUST display a tagline that conveys what jy does (e.g., "Convert between JSON and YAML — fast, correct, zero config.")
- **FR-007**: The hero section MUST display a brief one-liner explaining jy (cross-platform CLI, zero configuration, zero runtime dependencies, ships as a single binary)
- **FR-008**: The install area MUST present two install methods as switchable tabs: "npm" and "Script"
- **FR-009**: The npm tab MUST display the command: `npm install -g @bilalshareef/jy`
- **FR-010**: The Script tab MUST display the command: `curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh`
- **FR-011**: Each install command MUST have a copy-to-clipboard button that copies the command text
- **FR-012**: The copy button MUST provide visual feedback upon successful copy (e.g., icon change, "Copied!" text)
- **FR-013**: Below the install tabs, a note MUST inform Windows users that the curl script does not support Windows. The note MUST explain that Windows users can download the latest `.tar.gz` for `win32-x64` from the Releases page and extract it to a directory on their `PATH`. The note MUST include a link to `https://github.com/bilalshareef/jy/releases` that opens in a new tab
- **FR-014**: Below the install area, a compact horizontal row MUST display OS icons (Linux, macOS, Windows) with architecture labels (x64, arm64) showing supported standalone binary platforms. A note MUST indicate that npm install works on any platform with Node.js >= 22
- **FR-015**: The hero section MUST be visible without scrolling on standard desktop viewport sizes (above the fold)

#### Why jy? Section (Fold 2)

- **FR-016**: The section MUST explain jy's positioning: a tool that applies the Unix philosophy to JSON ↔ YAML conversion, contrasted with feature-heavy alternatives (yq, jq)
- **FR-017**: The section MUST highlight what jy intentionally omits (no query language, no transformation pipelines, no schema validation)

#### Features at a Glance Section (Fold 3)

- **FR-018**: The section MUST display four feature cards with the following content:
  - **Zero Friction**: Install and convert your first file in under 60 seconds
  - **Zero Config**: No `.jyrc`, no environment variables, no config files
  - **Zero Dependencies**: Standalone binary, no runtime required
  - **CI-Ready**: Deterministic exit codes, stdout/stderr separation, script-safe defaults

#### Usage Section (Fold 4)

- **FR-019**: The usage section MUST display categorized code examples covering: basic conversion (JSON → YAML, YAML → JSON), stdin/stdout piping, multiple file conversion, output directory (`--out`), validation (`--validate`), and formatting options (`--indent-size`, `--indent-style`, `--eol`)
- **FR-020**: Each code example MUST include the command and a short description of what it does
- **FR-021**: Code examples MUST use syntax-highlighted, monospaced text in styled code blocks
- **FR-022**: Every code block in the usage section MUST have a copy-to-clipboard button with visual feedback on copy

#### Footer

- **FR-023**: The page MUST display a footer with the text "Made with ❤️ by Mohammed Bilal Shareef" horizontally centered. The name "Mohammed Bilal Shareef" MUST be a link to `https://bilalshareef.github.io/` that opens in a new tab (`target="_blank"` with `rel="noopener noreferrer"`)
- **FR-024**: The footer MUST be visually separated from the content above it

#### Theme / Visual

- **FR-025**: The website MUST default to the user's OS color scheme preference (`prefers-color-scheme` media query) on first visit
- **FR-026**: A theme toggle button in the navigation MUST allow manual switching between light and dark modes
- **FR-027**: The user's manual theme choice MUST be persisted in localStorage and take precedence over OS preference on subsequent visits
- **FR-028**: Both light and dark themes MUST maintain WCAG 2.1 AA contrast ratios
- **FR-029**: The website MUST suppress or reduce animations when the user has `prefers-reduced-motion` enabled

#### Visual Polish

- **FR-030**: The overall UI MUST appear polished and professional with consistent spacing, typography hierarchy, and visual rhythm across all sections
- **FR-031**: Section transitions MUST feel cohesive — each fold should visually connect to the next through consistent use of color, spacing, or subtle separators
- **FR-032**: Code blocks, feature cards, and the install area MUST have a visually distinct, refined appearance (e.g., subtle borders, rounded corners, appropriate shadows for depth)

#### Responsiveness

- **FR-033**: The website MUST be fully functional and visually coherent across viewport widths from 320px to 2560px
- **FR-034**: On narrow viewports, feature cards MUST stack vertically, code blocks MUST be horizontally scrollable within their container, and the platform icons row MUST wrap gracefully

#### Accessibility

- **FR-035**: All interactive elements (tabs, copy buttons, links, theme toggle) MUST be keyboard navigable
- **FR-036**: Install method tabs MUST use appropriate ARIA roles (`tablist`, `tab`, `tabpanel`) for screen reader compatibility
- **FR-037**: The GitHub icon link MUST have an accessible label (e.g., `aria-label="View jy on GitHub"`)
- **FR-038**: The Docs button MUST have an accessible label (e.g., `aria-label="View documentation"`)
- **FR-039**: The theme toggle MUST have an accessible label indicating the current state (e.g., `aria-label="Switch to dark mode"`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can identify what jy does, choose an install method, and copy the install command within 15 seconds of page load
- **SC-002**: The page achieves a Lighthouse Performance score of 90 or above on mobile
- **SC-003**: The page achieves a Lighthouse Accessibility score of 95 or above
- **SC-004**: Total JavaScript bundle size is under 200 KB (gzipped) for initial page load
- **SC-005**: All code examples on the page match the install commands and usage patterns documented in the canonical jy repository README
- **SC-006**: The page is fully readable and navigable with JavaScript disabled (static content renders)
- **SC-007**: Both light and dark themes pass WCAG 2.1 AA contrast checks for all text and interactive elements
- **SC-008**: The page renders without horizontal scrolling on viewports as narrow as 320px

## Assumptions

- The website is a single-page application with no routing — all content is on one scrollable page
- The target audience is developers who are comfortable with terminals, CLI tools, npm, and curl
- Content (install commands, usage examples, platform matrix) is derived from the canonical jy repository README at `https://github.com/bilalshareef/jy` and will be kept manually in sync
- No backend, API, or database is needed — this is a purely static site
- No analytics, tracking scripts, or cookie banners are included (per constitution principle VI)
- The website does not include a search feature, blog, changelog, or documentation site — it is a focused landing page
- The favicon will use a simple text-based or minimal icon representing "jy"
- SEO meta tags (title, description, Open Graph) will be included for discoverability
