# Story 1.1: Project Initialization & Error Foundation

Status: ready-for-dev

## Story

As a **developer contributing to jy**,
I want **the project scaffolded with oclif and a consistent error handling foundation**,
so that **all future modules build on a working CLI skeleton with standardized error types and exit codes**.

## Acceptance Criteria

1. **Given** no existing project structure
   **When** the project is initialized with `npx oclif generate jy` (ESM, package name `jy`, bin name `jy`)
   **Then** the project compiles, `./bin/dev.js --help` runs successfully, and the default hello-world command is replaced with an empty root command at `src/commands/index.ts`

2. **Given** the initialized project
   **When** `src/errors.ts` is created
   **Then** it exports exit code constants (`EXIT_SUCCESS = 0`, `EXIT_VALIDATION = 1`, `EXIT_PARSE = 2`, `EXIT_IO = 3`, `EXIT_AMBIGUOUS = 4`) and a `JyError` class extending `Error` with a `code: ExitCode` property

3. **Given** the root command exists at `src/commands/index.ts`
   **When** any unhandled `JyError` is thrown during execution
   **Then** the root command catches it, writes `error.message` to stderr, and exits with `error.code`

4. **Given** the project is scaffolded
   **When** `npm test` is run
   **Then** unit tests for `JyError` and exit code constants pass, confirming correct error class behavior and code values

5. **Given** the project structure
   **When** reviewing file naming and conventions
   **Then** all files use kebab-case naming, ESM with `.js` import extensions, and the import ordering convention (Node built-ins → external → internal with blank lines between groups)

## Tasks / Subtasks

- [ ] Task 1: Scaffold project with oclif (AC: #1)
  - [ ] 1.1: Run `npx oclif generate jy` with ESM module type, package name `jy`, bin name `jy`
  - [ ] 1.2: Verify the generated project compiles (`npm run build`) and `./bin/dev.js --help` works
  - [ ] 1.3: Delete generated example commands (`src/commands/hello/index.ts`, `src/commands/hello/world.ts`) and their tests
  - [ ] 1.4: Set Node.js engine requirement to `>=22` in `package.json`
  - [ ] 1.5: Verify `npm run lint` and `npm run build` still pass after cleanup

- [ ] Task 2: Create root command skeleton (AC: #1, #3)
  - [ ] 2.1: Create `src/commands/index.ts` as the root command (single entry point)
  - [ ] 2.2: Define the command description and usage summary for `jy`
  - [ ] 2.3: Accept variadic `args` (file paths) and define flag stubs for future stories (`--to`, `--quiet`, etc. can be omitted for now — only wire what's needed for error handling)
  - [ ] 2.4: Implement try/catch in the `run()` method to catch `JyError`, write `error.message` to stderr via `this.error()` or `process.stderr.write()`, and exit with `error.code` via `this.exit()`
  - [ ] 2.5: Verify `./bin/dev.js --help` displays the root command help

- [ ] Task 3: Create error foundation module (AC: #2)
  - [ ] 3.1: Create `src/errors.ts` with exit code constants: `EXIT_SUCCESS = 0`, `EXIT_VALIDATION = 1`, `EXIT_PARSE = 2`, `EXIT_IO = 3`, `EXIT_AMBIGUOUS = 4`
  - [ ] 3.2: Define `ExitCode` type as union of non-success exit code values
  - [ ] 3.3: Implement `JyError` class extending `Error` with `readonly code: ExitCode` property and `name = 'JyError'`
  - [ ] 3.4: Ensure `.js` extension on all imports (ESM requirement)

- [ ] Task 4: Write unit tests (AC: #4)
  - [ ] 4.1: Create `test/errors.test.ts` — test all exit code constant values, `JyError` construction, `JyError.name`, `JyError.code`, `JyError.message`, `instanceof Error`
  - [ ] 4.2: Create `test/commands/index.test.ts` — CLI integration test that verifies: (a) `--help` works, (b) running with no args doesn't crash (returns exit 0 or expected behavior for empty input)
  - [ ] 4.3: Ensure `npm test` passes with all tests green

- [ ] Task 5: Verify conventions compliance (AC: #5)
  - [ ] 5.1: Confirm all source files are kebab-case (`errors.ts`, `commands/index.ts`)
  - [ ] 5.2: Confirm ESM `.js` extensions in all import paths
  - [ ] 5.3: Confirm import ordering: Node built-ins → external packages → internal modules (blank lines between groups)
  - [ ] 5.4: Run `npm run lint` to verify code quality

## Dev Notes

### Architecture Compliance

This is the foundational story for the entire `jy` project. It establishes:

1. **Project skeleton** via `oclif generate` — this is non-negotiable, do NOT manually set up the project
2. **Error contract** — the `JyError` class and exit codes that ALL future stories depend on
3. **Root command pattern** — the single try/catch location for error handling

**CRITICAL PATTERN — Error Handling Boundary:**
```
Root Command (src/commands/index.ts)
  └── try/catch JyError → stderr + this.exit(error.code)
```
- ONLY the root command catches `JyError` and calls `this.exit()`
- NO other module should call `process.exit()` directly
- ALL modules throw `JyError` with the appropriate exit code — errors propagate up to the root command

### Technical Stack & Versions

| Dependency | Version | Notes |
|---|---|---|
| `@oclif/core` | ^4.9.0 | CLI framework — installed by `oclif generate` |
| Node.js | >=22 | Runtime — set in `engines` field of `package.json` |
| TypeScript | (from oclif starter) | Compiler — configured via generated `tsconfig.json` |
| Mocha | (from oclif starter) | Test framework |
| `@oclif/test` | (from oclif starter) | CLI test harness |

**No additional dependencies for this story.** The `yaml` package (^2.9.0) is NOT needed until Story 1.2.

### oclif Generate — Critical Setup Details

**Initialization command:**
```bash
npx oclif generate jy
```

**Interactive prompts — select these values:**
- Module type: **ESM**
- Package name: **jy**
- Command bin name: **jy**

**Post-generation cleanup required:**
- Delete `src/commands/hello/index.ts` and `src/commands/hello/world.ts` (example commands)
- Delete `test/commands/hello/index.test.ts` and `test/commands/hello/world.test.ts` (example tests)
- Delete the `src/commands/hello/` directory entirely
- The root command goes at `src/commands/index.ts` (oclif's file-based routing treats this as the default command)

**DO NOT use oclif's `"strategy": "single"` configuration.** The architecture specifies file-based command routing with `src/commands/index.ts` as the root. This is the standard oclif pattern and supports future command additions if needed.

### Error Module — Exact Implementation Pattern

From the architecture document, the error module must follow this exact structure:

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

**Key decisions baked into this pattern:**
- `EXIT_SUCCESS` is defined but NOT part of `ExitCode` type — you never construct a `JyError` for success
- `code` is `readonly` — immutable after construction
- `name` is set to `'JyError'` — useful for error identification in logs
- No additional error subclasses — this is the ONLY error class in the project

### Root Command — Error Catch Pattern

The root command at `src/commands/index.ts` must implement the JyError catch pattern. Key oclif considerations:

```typescript
import {Command} from '@oclif/core'

import {JyError} from '../errors.js'

export default class Index extends Command {
  static override description = 'Convert between JSON and YAML formats'

  async run(): Promise<void> {
    try {
      // Future stories will add pipeline logic here
      // For now, the command does nothing (no args = no-op or help)
    } catch (error) {
      if (error instanceof JyError) {
        this.logToStderr(error.message)
        this.exit(error.code)
      }

      throw error // Re-throw unexpected errors for oclif to handle
    }
  }
}
```

**IMPORTANT oclif behaviors to be aware of:**
- `this.error(message)` in oclif throws an error internally and exits — do NOT use it for JyError handling. Use `this.logToStderr()` + `this.exit()` separately to control the exit code.
- `this.exit(code)` throws an `ExitError` — it does NOT return. Code after `this.exit()` is unreachable.
- `this.log()` writes to stdout, `this.logToStderr()` writes to stderr — respect this boundary.
- Non-JyError exceptions should be re-thrown to let oclif's default error handler deal with them.

### Import Ordering Convention

**MUST follow this exact pattern in ALL files:**

```typescript
// 1. Node.js built-ins
import {readFile} from 'node:fs/promises'
import path from 'node:path'

// 2. External packages
import {Command} from '@oclif/core'

// 3. Internal modules
import {JyError, EXIT_PARSE} from './errors.js'
```

- Blank line between each group
- `.js` extensions required on ALL internal imports (ESM requirement — TypeScript compiles `.ts` → `.js` but import paths must reference the `.js` output)
- No `.ts` extensions in imports, no extensionless imports for local modules

### Naming Conventions

- **Files:** kebab-case (`errors.ts`, `format-detector.ts`)
- **Functions/Variables:** camelCase (`detectFormat`, `inputFormat`)
- **Types/Interfaces:** PascalCase (`ExitCode`, `JyError`)
- **Constants:** UPPER_SNAKE_CASE (`EXIT_SUCCESS`, `EXIT_PARSE`)

### Test Structure

```
test/
  commands/
    index.test.ts      # CLI integration tests for root command
  errors.test.ts        # Unit tests for JyError and exit codes
```

- Test file names mirror source: `src/errors.ts` → `test/errors.test.ts`
- Use `describe` for module name, `it` for specific behaviors
- Use `@oclif/test` for CLI integration tests in `test/commands/index.test.ts`
- Use standard Mocha assertions for unit tests in `test/errors.test.ts`

### What NOT to Do

- **DO NOT** install the `yaml` package yet — it's not needed until Story 1.2
- **DO NOT** add flags (`--to`, `--quiet`, `--eol`, etc.) to the root command yet — those come in later stories
- **DO NOT** create `format-detector.ts`, `converter.ts`, `output-formatter.ts`, or `io.ts` — those are for later stories
- **DO NOT** use `process.exit()` directly anywhere — only `this.exit()` in the root command
- **DO NOT** create additional error classes or subclasses — only `JyError`
- **DO NOT** add variadic file args to the command yet — the root command should accept no args in this story (args come in Story 1.2)
- **DO NOT** change the oclif command discovery strategy to `"single"` — keep the default file-based routing

### Project Structure After This Story

```
jy/
├── README.md                          # (existing, update if needed)
├── LICENSE                            # (existing)
├── package.json                       # oclif config, scripts, dependencies
├── tsconfig.json                      # TypeScript config (from oclif starter)
├── .eslintrc.json                     # ESLint config (from oclif starter)
├── .prettierrc.json                   # Prettier config (from oclif starter)
├── .mocharc.json                      # Mocha config (from oclif starter)
├── .gitignore                         # (from oclif starter)
├── bin/
│   ├── dev.js                         # Development entry point
│   ├── dev.cmd                        # Windows dev entry point
│   ├── run.js                         # Production entry point
│   └── run.cmd                        # Windows production entry point
├── src/
│   ├── commands/
│   │   └── index.ts                   # Root command — error catch boundary
│   └── errors.ts                      # JyError class, exit code constants
├── test/
│   ├── commands/
│   │   └── index.test.ts              # CLI integration tests
│   └── errors.test.ts                 # Exit code and JyError unit tests
└── dist/                              # Compiled JS output (gitignored)
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — "Conversion Pipeline Architecture" section for module structure]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Error Handling Pattern" section for JyError exact implementation]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Implementation Patterns & Consistency Rules" section for naming/import conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Complete Project Directory Structure" for file layout]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Starter Template Evaluation" for oclif generate command]
- [Source: _bmad-output/planning-artifacts/epics.md — "Story 1.1: Project Initialization & Error Foundation" for acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — "Error Handling & Exit Codes" section for exit code definitions]
- [Source: oclif.io/docs/templates — Bin scripts, config files, and example commands from oclif generate]
- [Source: oclif.io/docs/single_command_cli — Single command CLI pattern (NOT used — architecture specifies file-based routing)]

## Dev Agent Record

### Agent Model Used

<!-- To be filled by dev agent -->

### Debug Log References

### Completion Notes List

### File List
