---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: [prd.md, product-brief.md]
workflowType: 'architecture'
project_name: 'jy'
user_name: 'Bilal Shareef'
date: '2026-05-14'
lastStep: 8
status: 'complete'
completedAt: '2026-05-14'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
28 FRs across 7 categories. The core conversion pipeline (FR1–FR4) is straightforward — the architectural weight lies in format detection logic (FR5–FR7), multi-file orchestration (FR8–FR11), and the distribution/packaging story (FR24–FR28). Output formatting (FR15–FR18) is a post-processing concern that cuts across all output paths.

**Non-Functional Requirements:**
- **Performance:** <100ms single-file conversion, <200ms startup, proportional scaling for large files
- **Data integrity:** Round-trip fidelity is non-negotiable — zero data loss, no silent mutation
- **Portability:** Identical behavior across 5 platforms, no runtime dependencies for binary installs
- **Reliability:** Malformed input never produces partial output; clean success or clean failure

**Scale & Complexity:**
- Primary domain: CLI tool / developer tooling
- Complexity level: Low
- Estimated architectural components: ~5 (CLI parser, format detector, converter engine, output formatter, file I/O handler)

### Technical Constraints & Dependencies

- **Runtime:** TypeScript on Node.js, oclif CLI framework
- **Serialization:** Native `JSON.parse()`/`JSON.stringify()` for JSON; `yaml` npm package for YAML
- **Packaging:** oclif pack for standalone binaries (bundles Node.js runtime); npm publish for global package
- **No configuration surface:** No `.jyrc`, no env vars, no config files. All behavior via flags only.
- **Phased delivery:** MVP (Phase 1) excludes `--in-place`, `--continue-on-error`, shell completions, and structural validation

### Cross-Cutting Concerns Identified

- **Error handling contract:** Exit codes 0–4 must be consistently applied across all code paths (conversion, validation, I/O, detection)
- **Output routing:** stdout for content, stderr for errors — every output path must respect this
- **Formatting pipeline:** EOL and indentation settings apply post-serialization to both JSON and YAML, regardless of output target (stdout or file)
- **Format detection consistency:** Extension-based for files, content-inspection for stdin, mixed-format rejection across multi-file — must be centralized
- **Platform parity:** Binary behavior must be identical across all 5 targets — no platform-specific code paths for core logic

## Starter Template Evaluation

### Primary Technology Domain

CLI tool / developer tooling — based on project requirements for a single-command JSON↔YAML converter with standalone binary distribution.

### Starter Options Considered

| Option | Pros | Cons |
|---|---|---|
| `oclif generate` (official) | Canonical, maintained by Salesforce, handles packaging/distribution, TypeScript-first, ESM support | Includes example commands that need cleanup; mocha default (adequate but not the only choice) |
| Manual `@oclif/core` setup | Full control over project structure | Reinvents scaffolding; no packaging support without oclif CLI |

### Selected Starter: `oclif generate`

**Rationale for Selection:**
The official oclif generator is the only sensible choice. It provides the TypeScript + ESM foundation, bin scripts for dev/production, and — critically — access to `oclif pack tarballs` for standalone binary distribution across all 5 target platforms. Binary packaging is the PRD's most complex requirement, and oclif's packaging toolchain is the reason oclif was chosen in the first place.

**Initialization Command:**

```bash
npx oclif generate jy
# Prompts:
#   Module type: ESM
#   Package name: jy
#   Command bin name: jy
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- TypeScript with recommended tsconfig
- ESM module system
- Node.js (LTS) runtime, bundled into standalone binaries via `oclif pack`

**Build Tooling:**
- TypeScript compiler (`tsc`) for production builds
- `ts-node` (or `tsx`) for development runtime
- `bin/dev.js` for development, `bin/run.js` for production

**Testing Framework:**
- Mocha + `@oclif/test` (default from generator)
- Test files under `test/` directory

**Code Quality:**
- ESLint with oclif-recommended plugins
- Prettier with `@oclif/prettier-config`

**Code Organization:**
- `src/commands/` — command files (file-based routing)
- `src/` — shared modules and utilities
- `test/` — test files mirroring src structure
- `bin/` — entry point scripts (dev/run for macOS/Linux/Windows)

**Development Experience:**
- Hot-transpilation via `bin/dev.js` (no manual compile during development)
- Verbose error output in dev mode

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Conversion pipeline architecture (discrete stages)
- Node.js version target (22+)
- YAML library version (`yaml` ^2.9.0)

**Important Decisions (Shape Architecture):**
- Testing strategy (unit + CLI integration)
- CI/CD pipeline (GitHub Actions, tag-triggered releases)
- Curl installer approach (custom `install.sh`)

**Deferred Decisions (Post-MVP):**
- Plugin system architecture (Phase 3)
- Watch mode implementation (Phase 3)
- Shell completion generation (Phase 2)

### Conversion Pipeline Architecture

**Decision:** Discrete pipeline stages with separate modules for each concern.

**Rationale:** The PRD's cross-cutting concerns (format detection, output formatting, error codes) map cleanly to separate responsibilities. Each stage is independently testable.

**Pipeline Stages:**
1. **Input Resolution** — Resolve file paths, expand globs, handle stdin (`-`)
2. **Format Detection** — Determine input format from extension or content inspection
3. **Parsing** — Parse input content to in-memory data structure
4. **Serialization** — Serialize data structure to target format
5. **Output Formatting** — Apply EOL and indentation settings post-serialization
6. **Output Writing** — Route to stdout or `--out-dir` file

**Modules:**
- `src/detector.ts` — Format detection logic (extension-based + content inspection)
- `src/converter.ts` — Parse + serialize orchestration
- `src/formatter.ts` — EOL and indentation post-processing
- `src/io.ts` — File reading, glob resolution, output writing
- `src/errors.ts` — Error types mapped to exit codes 0–4
- `src/commands/index.ts` — oclif command (single root command wiring the pipeline)

### Dependencies & Versions

| Dependency | Version | Purpose |
|---|---|---|
| `@oclif/core` | ^4.9.0 | CLI framework |
| `yaml` | ^2.9.0 | YAML parse/stringify |
| Node.js | ≥22 | Runtime (LTS, active until April 2027) |
| TypeScript | (from oclif starter) | Language |

**Note:** `JSON.parse()` / `JSON.stringify()` are native — no additional JSON dependency.

### Testing Strategy

**Decision:** Unit tests + CLI integration tests.

**Unit Tests:**
- Format detection logic (extension mapping, stdin content inspection, mixed-format rejection)
- Converter round-trip fidelity (JSON→YAML→JSON identity)
- Output formatter (EOL conversion, indentation application)
- Error classification (correct exit codes for each failure type)

**CLI Integration Tests:**
- Full command execution via `@oclif/test`
- Single file conversion (stdout output verification)
- Multi-file and glob handling
- `--out-dir` file writing
- `--validate` mode
- Exit code verification for all 5 codes
- stdin workflows
- Flag combinations (`--to`, `--eol`, `--indent-style`, `--indent-size`, `--quiet`)

**Framework:** Mocha + `@oclif/test` (provided by starter)

### CI/CD & Release Pipeline

**Decision:** GitHub Actions — automated testing + tag-triggered releases.

**CI Workflow (on push/PR):**
- Install dependencies
- Lint (ESLint + Prettier check)
- Build (`tsc`)
- Run tests (unit + integration)
- Matrix: Node.js 22.x on ubuntu-latest only (expand to macos-latest and windows-latest after the repository is made public, to avoid runner minute multiplier costs on a private repo)

**Release Workflow (on tag push `v*`):**
- Run full CI
- `oclif pack tarballs` for all 5 targets (linux-x64, linux-arm64, darwin-x64, darwin-arm64, win32-x64)
- Create GitHub Release with tarballs attached
- `npm publish` to npm registry

### Distribution Strategy

**Decision:** Custom `install.sh` script in repository root.

**Installer Logic:**
1. Detect OS via `uname -s` (Linux, Darwin)
2. Detect architecture via `uname -m` (x86_64, arm64/aarch64)
3. Download appropriate tarball from GitHub Releases
4. Extract to `/usr/local/bin` (or user-specified location)
5. Verify binary execution

**Windows:** Not covered by curl installer — users install via npm (`npm install -g jy`) or download binary directly from GitHub Releases.

**Install command:** `curl -fsSL https://raw.githubusercontent.com/<owner>/jy/main/install.sh | sh`

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (`oclif generate`)
2. Core pipeline modules (detector → converter → formatter → io → errors)
3. Root command wiring
4. Unit tests for each module
5. CLI integration tests
6. CI/CD GitHub Actions setup
7. `oclif pack` configuration and release workflow
8. `install.sh` script

**Cross-Component Dependencies:**
- Error types (`errors.ts`) are consumed by all other modules — implement first
- Format detector is consumed by the root command and by IO (for mixed-format rejection)
- Formatter is consumed after serialization — independent of parse/serialize logic
- CI/CD depends on test suite being in place

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 5 areas where AI agents could make different choices, all resolved below.

### Naming Patterns

**File Naming:** `kebab-case.ts`
- `format-detector.ts`, `jy-error.ts`, `output-formatter.ts`
- Directories also kebab-case: `src/commands/`

**Functions & Variables:** `camelCase`
- `detectFormat()`, `parseInput()`, `resolvedPaths`

**Types & Interfaces:** `PascalCase`
- `Format`, `ConvertOptions`, `ParseError`

**Constants:** `UPPER_SNAKE_CASE`
- Exit codes: `EXIT_SUCCESS`, `EXIT_VALIDATION`, `EXIT_PARSE`, `EXIT_IO`, `EXIT_AMBIGUOUS`
- Format identifiers if declared as constants

**Examples:**
```typescript
// Good
import {detectFormat} from './format-detector.js'
const inputFormat: Format = detectFormat(filePath)

// Bad
import {detectFormat} from './FormatDetector.js'  // PascalCase file
import {DetectFormat} from './format-detector.js'  // PascalCase function
```

### Error Handling Pattern

**Decision:** Single `JyError` class with a `code` property from an exit code enum.

**Structure:**
```typescript
// src/errors.ts
export const EXIT_SUCCESS = 0
export const EXIT_VALIDATION = 1
export const EXIT_PARSE = 2
export const EXIT_IO = 3
export const EXIT_AMBIGUOUS = 4

export type ExitCode = typeof EXIT_VALIDATION | typeof EXIT_PARSE | typeof EXIT_IO | typeof EXIT_AMBIGUOUS

export class JyError extends Error {
  constructor(message: string, public readonly code: ExitCode) {
    super(message)
    this.name = 'JyError'
  }
}
```

**Usage rules:**
- All error conditions throw `JyError` with the appropriate code
- The root command (`src/commands/index.ts`) catches `JyError` in a single try/catch, writes `error.message` to stderr, and calls `this.exit(error.code)`
- No module calls `process.exit()` directly — only the root command does
- Error messages always include the file path when relevant: `Parse error: config.json is not valid JSON`

### Import Organization

**Order (with blank line between groups):**
1. Node.js built-ins (`node:fs`, `node:path`)
2. External packages (`yaml`, `@oclif/core`)
3. Internal modules (`./format-detector.js`, `./errors.js`)

**Example:**
```typescript
import {readFile} from 'node:fs/promises'
import path from 'node:path'

import {parse as parseYaml, stringify as stringifyYaml} from 'yaml'

import {JyError, EXIT_PARSE} from './errors.js'
import {detectFormat} from './format-detector.js'
```

**Note:** ESM requires `.js` extensions in import paths (even for `.ts` source files).

### Test Organization & Naming

**Structure:** Separate `test/` directory mirroring `src/` structure.

```
test/
  commands/
    index.test.ts      # CLI integration tests
  format-detector.test.ts
  converter.test.ts
  output-formatter.test.ts
  io.test.ts
  errors.test.ts
```

**Naming convention:**
```typescript
describe('format-detector', () => {
  it('detects JSON from .json extension', () => { ... })
  it('detects YAML from .yaml extension', () => { ... })
  it('detects YAML from .yml extension', () => { ... })
  it('rejects mixed formats with EXIT_AMBIGUOUS', () => { ... })
})
```

**Rules:**
- Test file names match source file: `src/converter.ts` → `test/converter.test.ts`
- Use `describe` for the module name, `it` for specific behaviors
- Integration tests for the CLI command go in `test/commands/index.test.ts`

### Multi-File Output Separator

**Decision:**
- **YAML output:** `---\n` between files (standard YAML document separator)
- **JSON output:** `\n` (blank line) between files

**Example — multi-file YAML output:**
```yaml
key: value1
---
key: value2
```

**Example — multi-file JSON output:**
```json
{"key": "value1"}

{"key": "value2"}
```

### Enforcement Guidelines

**All AI Agents MUST:**
- Use kebab-case for all new file names
- Throw `JyError` with the correct exit code — never call `process.exit()` outside the root command
- Follow the import group ordering with blank lines between groups
- Use `.js` extensions in all ESM import paths
- Place tests in `test/` mirroring `src/` structure
- Use `describe`/`it` naming convention in tests

**Anti-Patterns:**
- Creating additional error classes beyond `JyError`
- Catching errors in intermediate modules (let them propagate to root command)
- Mixing import groups or omitting blank line separators
- Using `require()` anywhere (ESM only)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
jy/
├── README.md
├── LICENSE
├── install.sh                          # Curl installer script
├── package.json                        # oclif config, scripts, dependencies
├── tsconfig.json                       # TypeScript config (from oclif starter)
├── .eslintrc.json                      # ESLint config (from oclif starter)
├── .prettierrc.json                    # Prettier config (from oclif starter)
├── .mocharc.json                       # Mocha config (from oclif starter)
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Build + lint + test on push/PR
│       └── release.yml                 # Pack + publish on tag push
├── bin/
│   ├── dev.js                          # Development entry point (auto-transpile)
│   ├── dev.cmd                         # Windows dev entry point
│   ├── run.js                          # Production entry point
│   └── run.cmd                         # Windows production entry point
├── src/
│   ├── commands/
│   │   └── index.ts                    # Root command — single entry point, wires pipeline
│   ├── errors.ts                       # JyError class, exit code constants
│   ├── format-detector.ts              # Format detection (extension + content inspection)
│   ├── converter.ts                    # Parse + serialize orchestration
│   ├── output-formatter.ts             # EOL and indentation post-processing
│   └── io.ts                           # File reading, glob resolution, output writing
├── test/
│   ├── commands/
│   │   └── index.test.ts              # CLI integration tests (full command execution)
│   ├── errors.test.ts                  # Exit code and JyError tests
│   ├── format-detector.test.ts         # Format detection unit tests
│   ├── converter.test.ts               # Round-trip fidelity, parse/serialize tests
│   ├── output-formatter.test.ts        # EOL/indentation formatting tests
│   ├── io.test.ts                      # File I/O and glob tests
│   └── fixtures/                       # Test fixture files
│       ├── simple.json
│       ├── simple.yaml
│       ├── nested.json
│       ├── nested.yaml
│       ├── multi-doc.yaml
│       ├── malformed.json
│       └── malformed.yaml
├── dist/                               # Compiled JS output (gitignored)
└── oclif.manifest.json                 # Generated oclif command manifest
```

### Architectural Boundaries

**Pipeline Boundary:**
The root command (`src/commands/index.ts`) is the sole orchestrator. It calls modules in sequence and is the only place that handles `JyError` catch + exit code routing. No module knows about oclif — they are pure functions/utilities.

```
Root Command (index.ts)
  ├── io.ts          → reads files, resolves globs, writes output
  ├── format-detector.ts → determines input format
  ├── converter.ts   → parses input, serializes to target format
  └── output-formatter.ts → applies EOL + indentation
```

**Module Independence:**
- `errors.ts` — zero dependencies, consumed by all modules
- `format-detector.ts` — depends only on `errors.ts`
- `converter.ts` — depends on `yaml` package + `errors.ts`
- `output-formatter.ts` — depends only on `errors.ts`
- `io.ts` — depends on `node:fs`, `node:path`, `errors.ts`
- `commands/index.ts` — depends on `@oclif/core` + all internal modules

### Requirements to Structure Mapping

**FR Category → File Mapping:**

| FR Category | Primary File | Related Files |
|---|---|---|
| Format Conversion (FR1–FR4) | `src/converter.ts` | `src/commands/index.ts` |
| Format Detection (FR5–FR7) | `src/format-detector.ts` | `src/commands/index.ts` |
| Multi-File Processing (FR8–FR11) | `src/io.ts` | `src/commands/index.ts` |
| Input Validation (FR12–FR14) | `src/converter.ts` | `src/commands/index.ts` |
| Output Formatting (FR15–FR18) | `src/output-formatter.ts` | `src/commands/index.ts` |
| Error Handling (FR19–FR21) | `src/errors.ts` | All modules |
| Output Control (FR22–FR23) | `src/commands/index.ts` | `src/io.ts` |
| Distribution (FR24–FR28) | `install.sh`, `.github/workflows/release.yml` | `package.json` |

### Data Flow

```
Input (files/stdin/globs)
  │
  ▼
io.ts: resolve paths, read content
  │
  ▼
format-detector.ts: determine input format (json|yaml)
  │
  ▼
converter.ts: parse(content, format) → data → serialize(data, targetFormat)
  │
  ▼
output-formatter.ts: apply EOL + indentation settings
  │
  ▼
io.ts: write to stdout or --out-dir files
```

### Development Workflow

**Development:** `./bin/dev.js [args]` — auto-transpiles TypeScript, verbose errors
**Production test:** `./bin/run.js [args]` — uses compiled JS from `dist/`
**Build:** `npm run build` → `tsc` → `dist/`
**Test:** `npm test` → Mocha runs `test/**/*.test.ts`
**Lint:** `npm run lint` → ESLint + Prettier
**Pack:** `oclif pack tarballs` → standalone binaries in `dist/`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible. oclif v4.x with @oclif/core v4.9.0, TypeScript ESM, `yaml` v2.9.0, and Node.js 22 form a stable, tested stack with no version conflicts.

**Pattern Consistency:**
Implementation patterns (naming, error handling, imports, testing) align with oclif conventions and TypeScript ESM best practices. No contradictions between patterns and technology choices.

**Structure Alignment:**
Project structure directly maps to the pipeline architecture. Each module has a clear boundary, the root command is the sole orchestrator, and no module depends on oclif internals.

### Requirements Coverage Validation ✅

**Functional Requirements:** All 28 FRs across 7 categories have explicit architectural support mapped to specific source files.

**Non-Functional Requirements:** Performance targets achievable with the lightweight pipeline design. Data integrity ensured by direct parse→serialize flow. Platform portability handled by oclif pack. Reliability enforced by JyError + fail-fast pattern.

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with verified versions. No ambiguous choices remain for MVP scope.

**Structure Completeness:** Full directory tree with every file specified. Module dependencies and data flow documented.

**Pattern Completeness:** All identified conflict points resolved with concrete examples and anti-patterns.

### Gap Analysis Results

**Critical Gaps:** None

**Minor Observations:**
- Multi-document YAML handling (multiple `---`-separated documents in one file) is unspecified. Can be decided during implementation — default to treating multi-document YAML as valid input, converting each document separately.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all 16 checklist items verified, no critical gaps, low-complexity project with well-understood problem space.

**Key Strengths:**
- Radically simple architecture matching a radically simple product
- Clean module boundaries with zero circular dependencies
- Every FR explicitly mapped to a source file
- Consistent error handling contract across all code paths

**Areas for Future Enhancement:**
- Multi-document YAML handling strategy
- Phase 2 features (`--in-place`, `--continue-on-error`) will need architectural additions
- Phase 3 plugin system will require a more extensible converter design

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
```bash
npx oclif generate jy
# Module type: ESM | Package name: jy | Command bin name: jy
```
