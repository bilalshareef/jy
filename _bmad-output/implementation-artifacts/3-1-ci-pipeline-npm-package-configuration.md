# Story 3.1: CI Pipeline & npm Package Configuration

Status: done

## Story

As a **developer contributing to cjy**,
I want **automated CI that runs lint, build, and tests on PRs and merges to main, and a properly configured npm package**,
so that **code quality is enforced automatically and users can install cjy via `npm install -g cjy`**.

## Acceptance Criteria

1. **Given** a pull request is opened or updated against the repository, **when** the CI workflow triggers, **then** it runs `npm run lint` (ESLint + Prettier check), `npm run build` (tsc), and `npm test` (unit + integration tests)

2. **Given** a pull request is merged to the `main` branch, **when** the push-to-main event fires, **then** the same CI workflow triggers and runs the full lint, build, and test suite

3. **Given** a push to any branch other than `main`, **when** evaluating CI triggers, **then** no CI workflow is triggered

4. **Given** the CI workflow, **when** it executes, **then** tests run on Node.js 22.x on **ubuntu-latest only** (macOS and Windows runners added to the matrix after the repository is made public to avoid minute multiplier costs on a private repo)

5. **Given** a pull request from a fork or outside contributor, **when** the PR is created, **then** the CI workflow requires manual approval before running, using GitHub's built-in fork pull request approval setting (Settings > Actions > General > "Require approval for all outside collaborators")

6. **Given** any lint, build, or test failure, **when** the CI workflow completes, **then** the workflow fails with a clear indication of which step failed

7. **Given** the `package.json` configuration, **when** a user runs `npm install -g cjy`, **then** the `cjy` command is available globally, resolving to `bin/run.js`, and `cjy --help` displays usage information

8. **Given** the `package.json` metadata, **when** reviewed for npm publishing readiness, **then** it includes correct `name`, `version`, `description`, `license`, `bin`, `files`, and `engines` fields

9. **Given** the project test suite, **when** `npm test` is run locally, **then** the same lint, build, and test steps that CI runs also pass locally

## Tasks / Subtasks

- [x] Task 1: Create `.github/workflows/ci.yml` GitHub Actions workflow (AC: #1, #2, #3, #4, #6)
  - [x] 1.1 Create `.github/workflows/` directory structure
  - [x] 1.2 Define workflow name `CI` and triggers: `push` on `main` branch only, `pull_request` on all branches
  - [x] 1.3 Add single job `ci` running on `ubuntu-latest` with Node.js 22.x via `actions/setup-node@v4`
  - [x] 1.4 Add steps in order: `actions/checkout@v4` → `npm ci` → `npm run build` → `npm test` (which runs mocha + posttest lint + format:check)
  - [x] 1.5 Add concurrency group to cancel in-progress runs on same PR: `group: ${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: true`

- [x] Task 2: Fix `package.json` metadata for npm publishing readiness (AC: #7, #8)
  - [x] 2.1 Update `repository` from `"cjy/cjy"` to proper object form `{"type": "git", "url": "https://github.com/bilalsheriff/cjy.git"}` (or leave as placeholder with TODO comment until actual GitHub repo URL is finalized)
  - [x] 2.2 Update `bugs` and `homepage` URLs to match the actual repository (or add TODO comment)
  - [x] 2.3 Update `keywords` from `["oclif"]` to `["json", "yaml", "converter", "cli", "oclif"]`
  - [x] 2.4 Verify `bin`, `files`, `engines`, `name`, `version`, `description`, `license` are correct (they already are — just confirm, no changes needed)

- [x] Task 3: Verify CI runs correctly by running the same steps locally (AC: #9)
  - [x] 3.1 Run `npm run build` locally and confirm clean build
  - [x] 3.2 Run `npm test` locally and confirm all tests pass (mocha + posttest lint + format:check)
  - [x] 3.3 Fix any lint or format issues discovered

- [x] Task 4: Document fork PR approval as a manual GitHub setting (AC: #5)
  - [x] 4.1 Add a comment in the CI workflow file noting that fork PR approval is configured in GitHub Settings > Actions > General, not in the workflow itself

## Dev Notes

### Critical: Workflow Trigger Configuration

The ACs specify precise trigger behavior:
- **PRs**: Trigger on ALL pull requests regardless of target branch — use `pull_request:` without branch filter
- **Push**: Trigger ONLY on `main` — use `push: branches: [main]`
- **Other pushes**: Must NOT trigger — achieved by limiting push to `main` only

```yaml
on:
  push:
    branches: [main]
  pull_request:
```

**Important:** The project currently uses `develop` as the active branch. The CI will trigger on PRs targeting `main` (or any branch) and pushes to `main`. When the team merges `develop` → `main`, the push trigger fires. Direct pushes to feature branches do NOT trigger CI — only PRs from them do.

### CI Step Order and Rationale

The workflow uses a single job with sequential steps:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: '22'
      cache: 'npm'
  - run: npm ci
  - run: npm run build
  - run: npm test
```

**Why `npm ci` instead of `npm install`?** CI should use `npm ci` for deterministic installs from lockfile. This is faster and ensures reproducibility.

**Why no separate lint step?** The existing `posttest` script in package.json already runs `npm run lint && npm run format:check` after mocha tests. So `npm test` covers lint + format checking. This matches the "same steps locally" requirement (AC #9).

**Step failure behavior:** GitHub Actions fails the workflow on any non-zero exit code. Each step (build, test/lint) runs independently, so the failure is clearly attributed to the failing step (AC #6).

### package.json Current State Analysis

**Already correct — DO NOT CHANGE these fields:**

| Field | Current Value | Status |
|-------|--------------|--------|
| `name` | `"cjy"` | Correct |
| `version` | `"0.0.0"` | Correct for pre-release |
| `description` | `"Convert between JSON and YAML formats"` | Correct |
| `license` | `"MIT"` | Correct |
| `bin` | `{"cjy": "./bin/run.js"}` | Correct |
| `files` | `["./bin", "./dist", "./oclif.manifest.json"]` | Correct |
| `engines` | `{"node": ">=22.0.0"}` | Correct |
| `type` | `"module"` | Correct (ESM) |

**Needs updating:**

| Field | Current Value | Issue |
|-------|--------------|-------|
| `repository` | `"cjy/cjy"` | Scaffold placeholder — should be proper object form |
| `bugs` | `"https://github.com/cjy/cjy/issues"` | Placeholder URL |
| `homepage` | `"https://github.com/cjy/cjy"` | Placeholder URL |
| `keywords` | `["oclif"]` | Too narrow — add json, yaml, converter, cli |

### Known Deferred Items NOT in Scope

From [deferred-work.md](../../_bmad-output/implementation-artifacts/deferred-work.md):
- `@oclif/plugin-plugins` in dependencies — noted as unnecessary but NOT removed in this story. Removing it may break `oclif manifest` or `oclif pack` commands. Defer to story 3.2 where binary packaging is tested.
- `sourceMap`/`declarationMap` in tsconfig — cosmetic debugging improvement, not blocking CI.

### Fork PR Security (AC #5)

Fork PR approval is a **GitHub repository setting**, not a workflow configuration. The developer should:
1. Go to repo Settings > Actions > General
2. Under "Fork pull request workflows", select "Require approval for all outside collaborators"

This is documented as a comment in the workflow file. No workflow code needed.

### Concurrency Strategy

Add concurrency to avoid wasted runner minutes when a PR is updated rapidly:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

This cancels in-progress CI runs when a new push arrives to the same PR. For push-to-main, each push gets its own group key (`refs/heads/main`), so the latest push cancels any in-progress main build.

### Node.js Version

Use `22` (not `22.x` or a specific patch). `actions/setup-node@v4` will resolve to the latest Node.js 22 LTS. This matches the `engines.node: ">=22.0.0"` in package.json.

### What This Story Does NOT Include

- No release workflow (`release.yml`) — that's Story 3.2
- No `oclif pack tarballs` — that's Story 3.2
- No `npm publish` step — that's Story 3.2
- No multi-OS matrix (macOS/Windows) — deferred until repo is public per AC #4
- No `install.sh` script — that's Story 3.3
- No removal of `@oclif/plugin-plugins` — deferred (see above)

### Previous Story Intelligence

From Story 2.4 (last completed story):
- All tests pass: unit tests for converter, format-detector, io, output-formatter, errors + CLI integration tests
- Test command: `mocha --forbid-only "test/**/*.test.ts"` with `posttest: npm run lint && npm run format:check`
- Build command: `tsc -b` via `npm run build`
- Dev tips: Use `npm run lint -- --fix` to auto-fix lint issues

### Git Intelligence

Recent commit pattern: `feat: implement story X.Y - description`. Branch: `develop`. All commits are on the `develop` branch. The CI workflow triggers on push to `main`, which means it will fire when `develop` is merged into `main`.

### Project Structure Notes

Files to create (NEW):
- `.github/workflows/ci.yml`

Files to modify (UPDATE):
- `package.json` — metadata fields only (repository, bugs, homepage, keywords)

No source code changes. No test changes. This is purely infrastructure.

### Workflow File Reference Implementation

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  ci:
    name: Lint, Build & Test
    runs-on: ubuntu-latest
    # Fork PRs require manual approval via GitHub Settings > Actions > General
    # "Require approval for all outside collaborators"

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#CI/CD & Release Pipeline]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1]
- [Source: _bmad-output/planning-artifacts/prd.md#Distribution & Installation]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md]
- [Source: package.json — current metadata state]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (GitHub Copilot)

### Debug Log References
None

### Completion Notes List
- Created `.github/workflows/ci.yml` with push-to-main + pull_request triggers, ubuntu-latest, Node 22, npm ci, build, test steps, and concurrency cancellation
- Fork PR approval documented as GitHub Settings comment in workflow file (AC #5)
- Updated `package.json` metadata: `repository` to object form with bilalsheriff/cjy URL, `bugs`/`homepage` to matching URLs, `keywords` expanded to [json, yaml, converter, cli, oclif]
- Verified existing fields (`name`, `version`, `description`, `license`, `bin`, `files`, `engines`) are already correct — no changes needed
- Full local verification: `npm run build` clean, `npm test` passes 134 tests, lint clean, format clean
- No source code or test changes — this story is purely infrastructure

### File List
- `.github/workflows/ci.yml` (NEW)
- `package.json` (MODIFIED — metadata fields only)

### Change Log
- 2026-05-29: Implemented CI pipeline and npm package metadata (Story 3.1)
