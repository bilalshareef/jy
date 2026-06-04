---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
inputDocuments: [prd.md, architecture.md]
---

# jy - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for jy, decomposing the requirements from the PRD and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can convert a JSON file to YAML output
- FR2: User can convert a YAML file to JSON output
- FR3: User can convert stdin input to the opposite format via stdout
- FR5: System can detect input format from file extension (`.json` → JSON, `.yaml`/`.yml` → YAML)
- FR6: System can detect stdin format by inspecting content (leading `{` or `[` → JSON, otherwise YAML)
- FR7: System can reject ambiguous or mixed input formats across multiple files with exit code 4
- FR8: User can convert multiple files specified as individual paths in a single invocation
- FR9: User can convert multiple files matched by glob patterns in a single invocation
- FR10: System can output multi-file results to stdout with separators between each file's output
- FR11: User can write multi-file conversion results to a specified output directory using `--out`, with filenames preserving the original name and swapping the extension
- FR12: User can validate input files for parse-ability without producing converted output using `--validate`
- FR13: System can report validation failures with the file path and error description to stderr
- FR14: System can exit with code 1 on validation failure
- FR15: User can control line endings in output using `--eol` (lf or crlf)
- FR16: User can control indentation style using `--indent-style` (spaces or tabs; JSON output only — YAML always uses spaces)
- FR17: User can control indentation width using `--indent-size` (any positive integer)
- FR18: System can ignore `--indent-size` when `--indent-style` is set to tabs (JSON output only)
- FR19: System can report errors to stderr with file path and actionable description
- FR20: System can exit with distinct codes for different failure types (0 success, 1 validation, 2 parse, 3 IO, 4 ambiguous format)
- FR21: System can stop processing on first error (fail-fast behavior)
- FR23: System can write converted content to stdout by default when no `--out` is specified
- FR24: User can install `jy` as an npm global package
- FR25: User can install `jy` as a standalone binary via a curl-based installer script
- FR26: Installer script can detect the user's operating system and architecture and download the correct binary
- FR27: System can run as a standalone binary without requiring Node.js on the target machine
- FR28: System can support Linux x64, Linux arm64, macOS Intel, macOS Apple Silicon, and Windows x64

### NonFunctional Requirements

- NFR1: Single-file conversion completes in <100ms on typical hardware for files up to 1MB
- NFR2: Performance scales proportionally for larger files without unreasonable degradation
- NFR3: CLI startup time (no-op or `--help`) completes in <200ms
- NFR4: Glob resolution and multi-file processing adds negligible per-file overhead
- NFR5: Round-trip conversion (JSON → YAML → JSON) produces semantically identical data structures — zero data loss
- NFR6: All JSON data types (strings, numbers, booleans, null, arrays, objects) survive conversion without mutation
- NFR7: YAML special values (anchors, aliases, multi-line strings, complex keys) are handled correctly or rejected with a clear error — never silently mangled
- NFR8: Malformed input never produces partial or corrupted output — conversion either succeeds completely or fails cleanly
- NFR9: Standalone binaries run without Node.js or any runtime dependency on all 5 target platforms
- NFR10: npm global package works on any system with Node.js 18+
- NFR11: CLI behavior is identical across all supported platforms (same flags, same output, same exit codes)
- NFR12: Output uses the user-specified line endings regardless of host OS

### Additional Requirements

- Starter template: `oclif generate` specified for project initialization — `npx oclif generate jy` with ESM module type
- Conversion pipeline: 6 discrete stages — input resolution → format detection → parsing → serialization → output formatting → output writing
- Module structure: 8 source modules — `errors.ts`, `format-detector.ts`, `converter.ts`, `serialize-options.ts`, `output-formatter.ts`, `io.ts`, `commands/helpers.ts`, `commands/index.ts`
- Error handling: Single `JyError` class with `code` property; only root command catches and calls `this.exit()`
- Testing strategy: Mocha + `@oclif/test` for unit + CLI integration tests; test fixtures in `test/fixtures/`
- CI/CD: GitHub Actions — CI workflow on push/PR (lint, build, test across 3 OS), release workflow on tag `v*` (pack tarballs, GitHub Release, npm publish)
- Distribution: Custom `install.sh` curl installer; `oclif pack tarballs` for 5 platform binaries
- Runtime: Node.js ≥22, TypeScript ESM, `yaml` ^2.9.0, `@oclif/core` ^4.9.0
- Implementation patterns: kebab-case files, camelCase functions/variables, PascalCase types, UPPER_SNAKE_CASE constants
- Import ordering: Node.js built-ins → external packages → internal modules (blank lines between groups, `.js` extensions required)
- Multi-file output separators: `---\n` for YAML, `\n` (blank line) for JSON

### UX Design Requirements

N/A — CLI tool, no UX design document applicable.

### FR Coverage Map

- FR1: Epic 1 — JSON → YAML conversion
- FR2: Epic 1 — YAML → JSON conversion
- FR3: Epic 1 — stdin conversion
- FR5: Epic 1 — Format detection from extension
- FR6: Epic 1 — stdin format detection via content inspection
- FR7: Epic 2 — Mixed/ambiguous format rejection
- FR8: Epic 2 — Multi-file individual paths
- FR9: Epic 2 — Multi-file glob patterns
- FR10: Epic 2 — Multi-file stdout with separators
- FR11: Epic 2 — `--out` output writing
- FR12: Epic 2 — `--validate` mode
- FR13: Epic 2 — Validation failure reporting
- FR14: Epic 2 — Exit code 1 on validation failure
- FR15: Epic 2 — `--eol` line ending control
- FR16: Epic 2 — `--indent-style` control
- FR17: Epic 2 — `--indent-size` control
- FR18: Epic 2 — `--indent-size` ignored with tabs (JSON only)
- FR19: Epic 1 — stderr error reporting
- FR20: Epic 1 — Distinct exit codes
- FR21: Epic 1 — Fail-fast behavior
- FR23: Epic 1 — stdout default output
- FR24: Epic 3 — npm global package install
- FR25: Epic 3 — curl-based binary installer
- FR26: Epic 3 — OS/arch auto-detection in installer
- FR27: Epic 3 — Standalone binary (no Node.js required)
- FR28: Epic 3 — 5-platform support

## Epic List

### Epic 1: Core CLI & Single-File Conversion
A developer can install jy from source, convert single JSON↔YAML files (from files or stdin), and get clear, actionable error messages with correct exit codes.
**FRs covered:** FR1, FR2, FR3, FR5, FR6, FR19, FR20, FR21, FR23

### Epic 2: Multi-File Processing, Output Formatting & Validation
A developer can batch-convert multiple files using globs, write results to an output directory, customize formatting (indentation, line endings), and validate files.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18

### Epic 3: CI/CD & Distribution
A developer can install jy as a standalone binary via curl (on Linux/macOS) or as an npm global package, with automated testing and releases ensuring reliability across all 5 platforms.
**FRs covered:** FR24, FR25, FR26, FR27, FR28

## Epic 1: Core CLI & Single-File Conversion

A developer can install jy from source, convert single JSON↔YAML files (from files or stdin), and get clear, actionable error messages with correct exit codes.

### Story 1.1: Project Initialization & Error Foundation

As a **developer contributing to jy**,
I want **the project scaffolded with oclif and a consistent error handling foundation**,
So that **all future modules build on a working CLI skeleton with standardized error types and exit codes**.

**Acceptance Criteria:**

**Given** no existing project structure
**When** the project is initialized with `npx oclif generate jy` (ESM, package name `jy`, bin name `jy`)
**Then** the project compiles, `./bin/dev.js --help` runs successfully, and the default hello-world command is replaced with an empty root command at `src/commands/index.ts`

**Given** the initialized project
**When** `src/errors.ts` is created
**Then** it exports exit code constants (`EXIT_SUCCESS = 0`, `EXIT_VALIDATION = 1`, `EXIT_PARSE = 2`, `EXIT_IO = 3`, `EXIT_AMBIGUOUS = 4`) and a `JyError` class extending `Error` with a `code: ExitCode` property

**Given** the root command exists at `src/commands/index.ts`
**When** any unhandled `JyError` is thrown during execution
**Then** the root command catches it, writes `error.message` to stderr, and exits with `error.code`

**Given** the project is scaffolded
**When** `npm test` is run
**Then** unit tests for `JyError` and exit code constants pass, confirming correct error class behavior and code values

**Given** the project structure
**When** reviewing file naming and conventions
**Then** all files use kebab-case naming, ESM with `.js` import extensions, and the import ordering convention (Node built-ins → external → internal with blank lines between groups)

### Story 1.2: Single-File Format Conversion

As a **developer**,
I want **to convert a single JSON file to YAML or a single YAML file to JSON by running `jy <file>`**,
So that **I can instantly convert between formats without remembering flags or syntax**.

**Acceptance Criteria:**

**Given** a valid JSON file `config.json`
**When** the user runs `jy config.json`
**Then** the file is parsed as JSON (detected from `.json` extension), converted to YAML, and the YAML output is written to stdout

**Given** a valid YAML file `config.yaml`
**When** the user runs `jy config.yaml`
**Then** the file is parsed as YAML (detected from `.yaml` extension), converted to JSON, and the JSON output is written to stdout

**Given** a valid YAML file `config.yml`
**When** the user runs `jy config.yml`
**Then** the file is detected as YAML from the `.yml` extension and converted to JSON on stdout

**Given** a JSON file containing all JSON data types (strings, numbers, booleans, null, arrays, nested objects)
**When** the user converts it to YAML and back to JSON
**Then** the resulting data structure is semantically identical to the original — zero data loss (NFR5, NFR6)

**Given** a file path that does not exist
**When** the user runs `jy nonexistent.json`
**Then** an error message including the file path is written to stderr and the process exits with code 3 (IO error)

**Given** a file with a `.json` extension but invalid JSON content
**When** the user runs `jy malformed.json`
**Then** an error message including the file path and parse failure description is written to stderr and the process exits with code 2 (parse error)

**Given** a file with an unrecognized extension (e.g., `.txt`, `.xml`)
**When** the user runs `jy data.txt`
**Then** an error message is written to stderr and the process exits with code 4 (ambiguous format)

**Given** the conversion completes successfully
**When** output is produced
**Then** converted content goes to stdout, no informational messages are mixed into stdout, and the process exits with code 0

**Given** the project test suite
**When** `npm test` is run
**Then** unit tests for `format-detector.ts` (extension mapping, unrecognized extensions), `converter.ts` (JSON→YAML, YAML→JSON, round-trip fidelity), and `io.ts` (file reading, file-not-found) all pass, plus CLI integration tests verifying end-to-end single-file conversion via `@oclif/test`

### Story 1.3: Stdin Conversion

As a **developer**,
I want **to pipe content through stdin using `jy -`**,
So that **I can convert data from other commands or scripts without saving to a file first**.

**Acceptance Criteria:**

**Given** valid JSON content piped to stdin
**When** the user runs `echo '{"key": "value"}' | jy -`
**Then** the content is detected as JSON (leading `{`), converted to YAML, and written to stdout

**Given** valid JSON array content piped to stdin
**When** the user runs `echo '[1, 2, 3]' | jy -`
**Then** the content is detected as JSON (leading `[`), converted to YAML, and written to stdout

**Given** valid YAML content piped to stdin
**When** the user runs `echo 'key: value' | jy -`
**Then** the content is detected as YAML (no leading `{` or `[`), converted to JSON, and written to stdout

**Given** malformed content piped to stdin
**When** the user runs `echo 'not: [valid: content' | jy -`
**Then** an error message is written to stderr and the process exits with code 2 (parse error)

**Given** empty stdin input
**When** the user runs `echo '' | jy -`
**Then** an appropriate error message is written to stderr and the process exits with a non-zero exit code

**Given** the project test suite
**When** `npm test` is run
**Then** unit tests for stdin content-based format detection in `format-detector.ts` and CLI integration tests for stdin workflows pass

### Story 1.4: ~~Output Format Override & Quiet Mode~~ (Scope Reduced)

> **Note:** `--to json|yaml` (FR4) and `--quiet` (FR22) were removed from this story's scope during implementation. See `deferred-work.md` for rationale. Both moved to Post-MVP (Phase 2) in the PRD.
>
> - `--to`: With only two formats, output is fully determined by input format, making `--to` redundant.
> - `--quiet`: The CLI produces zero informational messages, making the flag a no-op.
>
> This story was completed with no deliverables — all originally planned features were deferred.

## Epic 2: Multi-File Processing, Output Formatting & Validation

A developer can batch-convert multiple files using globs, write results to an output directory, customize formatting (indentation, line endings), and validate files.

### Story 2.1: Multi-File Conversion & Glob Support

As a **developer**,
I want **to convert multiple files in a single invocation using file paths or glob patterns**,
So that **I can batch-convert files efficiently without running jy repeatedly**.

**Acceptance Criteria:**

**Given** two JSON files `a.json` and `b.json`
**When** the user runs `jy a.json b.json`
**Then** both files are converted to YAML and output to stdout separated by `---\n` (YAML document separator)

**Given** two YAML files `a.yaml` and `b.yaml`
**When** the user runs `jy a.yaml b.yaml`
**Then** both files are converted to JSON and output to stdout separated by a blank line (`\n`)

**Given** a directory containing `*.json` files
**When** the user runs `jy src/**/*.json`
**Then** all matched files are converted to YAML and output to stdout with `---\n` separators between each file's output

**Given** a mix of `.json` and `.yaml` files as arguments
**When** the user runs `jy data.json config.yaml`
**Then** an error message is written to stderr and the process exits with code 4 (mixed/ambiguous format)

**Given** a glob pattern that matches no files
**When** the user runs `jy nonexistent/*.json`
**Then** an error message is written to stderr and the process exits with code 3 (IO error)

**Given** multiple files where the second file is malformed
**When** the user runs `jy good.json malformed.json`
**Then** processing stops at the first error (fail-fast), an error message is written to stderr, and the process exits with code 2 (parse error)

**Given** the project test suite
**When** `npm test` is run
**Then** unit tests for glob resolution in `io.ts`, mixed-format detection in `format-detector.ts`, and CLI integration tests for multi-file conversion (stdout separators, mixed-format rejection, fail-fast behavior) pass

### Story 2.2: Output Directory Writing

As a **developer**,
I want **to write converted files to a specified output directory using `--out`**,
So that **I can batch-convert files into a target directory without manual file redirection**.

**Acceptance Criteria:**

**Given** a JSON file `src/config.json` and an output directory `dist/`
**When** the user runs `jy src/config.json --out dist`
**Then** the converted YAML is written to `dist/config.yaml` (original filename with swapped extension) and nothing is written to stdout

**Given** multiple JSON files `a.json` and `b.json`
**When** the user runs `jy a.json b.json --out output`
**Then** `output/a.yaml` and `output/b.yaml` are created with the converted content

**Given** a glob pattern matching YAML files
**When** the user runs `jy src/**/*.yaml --out dist`
**Then** each matched file is converted to JSON and written to `dist/` with the `.json` extension, preserving the original filename

**Given** the specified `--out` does not exist
**When** the user runs `jy data.json --out nonexistent/path`
**Then** the directory is created (including intermediate directories) and the converted file is written successfully

**Given** the `--out` target has a permission issue
**When** the user runs `jy data.json --out /readonly-dir`
**Then** an error message is written to stderr and the process exits with code 3 (IO error)

**Given** the project test suite
**When** `npm test` is run
**Then** CLI integration tests for `--out` (file creation with swapped extensions, directory creation, multi-file output, IO error handling) pass

### Story 2.3: Output Formatting Options

As a **developer**,
I want **to control indentation and line endings in the converted output using `--eol`, `--indent-style`, and `--indent-size`**,
So that **the output matches my project's formatting standards without post-processing**.

**Acceptance Criteria:**

**Given** a JSON file
**When** the user runs `jy data.json --eol crlf`
**Then** the YAML output uses `\r\n` line endings instead of the default `\n`

**Given** a YAML file
**When** the user runs `jy data.yaml --eol lf`
**Then** the JSON output uses `\n` line endings (the default, explicitly specified)

**Given** a JSON file
**When** the user runs `jy data.json --indent-size 4`
**Then** the YAML output uses 4-space indentation instead of the default 2

**Given** a YAML file
**When** the user runs `jy data.yaml --indent-style tabs`
**Then** the JSON output uses tab characters for indentation (note: `--indent-style` is ignored for YAML output due to library limitation)

**Given** `--indent-style tabs` is specified
**When** the user also passes `--indent-size 4`
**Then** `--indent-size` is ignored (tabs have no configurable width in JSON output) and tab indentation is used

**Given** formatting flags combined with `--out`
**When** the user runs `jy data.json --out dist --eol crlf --indent-size 4`
**Then** the written file uses CRLF line endings and 4-space indentation

**Given** formatting flags combined with multi-file conversion
**When** the user runs `jy a.json b.json --indent-size 4`
**Then** all output files use 4-space indentation consistently

**Given** the `output-formatter.ts` module
**When** it receives serialized content and formatting options
**Then** it applies EOL conversion and indentation post-serialization, working identically for both JSON and YAML output

**Given** the project test suite
**When** `npm test` is run
**Then** unit tests for `output-formatter.ts` (EOL conversion, indentation styles, tabs ignoring indent-size) and CLI integration tests for all formatting flag combinations pass

### Story 2.4: Validate Mode

As a **developer**,
I want **to check if my files are valid JSON or YAML without producing converted output using `--validate`**,
So that **I can catch malformed files in CI pipelines or pre-commit checks without generating unnecessary output**.

**Acceptance Criteria:**

**Given** a valid JSON file
**When** the user runs `jy data.json --validate`
**Then** no converted output is written to stdout and the process exits with code 0

**Given** a valid YAML file
**When** the user runs `jy data.yaml --validate`
**Then** no converted output is written to stdout and the process exits with code 0

**Given** a malformed JSON file
**When** the user runs `jy malformed.json --validate`
**Then** an error message with the file path and parse failure description is written to stderr and the process exits with code 1 (validation error)

**Given** multiple files where some are valid and one is malformed
**When** the user runs `jy good.json malformed.json --validate`
**Then** processing stops at the first invalid file (fail-fast), an error is written to stderr, and the process exits with code 1

**Given** valid files matched by a glob pattern
**When** the user runs `jy src/**/*.json --validate`
**Then** all matched files are validated and the process exits with code 0 if all pass

**Given** stdin input
**When** the user runs `echo '{"a":1}' | jy - --validate`
**Then** the stdin content is validated for parse-ability without producing output, and the process exits with code 0

**Given** `--validate` combined with `--out`
**When** the user runs `jy data.json --validate --out dist`
**Then** no files are written to the output directory (validate mode suppresses all output)

**Given** the project test suite
**When** `npm test` is run
**Then** CLI integration tests for `--validate` (valid files, malformed files, multi-file validation, stdin validation, interaction with `--out`) pass

## Epic 3: CI/CD & Distribution

A developer can install jy as a standalone binary via curl (on Linux/macOS) or as an npm global package, with automated testing and releases ensuring reliability across all 5 platforms.

### Story 3.1: CI Pipeline & npm Package Configuration

As a **developer contributing to jy**,
I want **automated CI that runs lint, build, and tests on PRs and merges to main, and a properly configured npm package**,
So that **code quality is enforced automatically and users can install jy via `npm install -g jy`**.

**Acceptance Criteria:**

**Given** a pull request is opened or updated against the repository
**When** the CI workflow triggers
**Then** it runs `npm run lint` (ESLint + Prettier check), `npm run build` (tsc), and `npm test` (unit + integration tests)

**Given** a pull request is merged to the `main` branch
**When** the push-to-main event fires
**Then** the same CI workflow triggers and runs the full lint, build, and test suite

**Given** a push to any branch other than `main`
**When** evaluating CI triggers
**Then** no CI workflow is triggered

**Given** the CI workflow
**When** it executes
**Then** tests run on Node.js 22.x on **ubuntu-latest only** (macOS and Windows runners added to the matrix after the repository is made public to avoid minute multiplier costs on a private repo)

**Given** a pull request from a fork or outside contributor
**When** the PR is created
**Then** the CI workflow requires manual approval before running, using GitHub's built-in fork pull request approval setting (Settings > Actions > General > "Require approval for all outside collaborators")

**Given** any lint, build, or test failure
**When** the CI workflow completes
**Then** the workflow fails with a clear indication of which step failed

**Given** the `package.json` configuration
**When** a user runs `npm install -g jy`
**Then** the `jy` command is available globally, resolving to `bin/run.js`, and `jy --help` displays usage information

**Given** the `package.json` metadata
**When** reviewed for npm publishing readiness
**Then** it includes correct `name`, `version`, `description`, `license`, `bin`, `files`, and `engines` fields

**Given** the project test suite
**When** `npm test` is run locally
**Then** the same lint, build, and test steps that CI runs also pass locally

### Story 3.2: Binary Packaging & Release Pipeline

As a **developer**,
I want **standalone binaries built for all 5 target platforms and automatically published via a tag-triggered release workflow**,
So that **users can download and run jy without needing Node.js installed**.

**Acceptance Criteria:**

**Given** a git tag matching `v*` (e.g., `v1.0.0`) is pushed
**When** the release workflow triggers
**Then** it runs the full CI suite (lint, build, test) before proceeding to packaging

**Given** the CI suite passes
**When** the packaging step runs `oclif pack tarballs`
**Then** standalone binaries are built for all 5 targets: linux-x64, linux-arm64, darwin-x64, darwin-arm64, win32-x64

**Given** the tarballs are built successfully
**When** the release step executes
**Then** a GitHub Release is created for the tag with all 5 tarballs attached as release assets

**Given** the GitHub Release is created
**When** the npm publish step executes
**Then** the package is published to the npm registry, making `npm install -g jy` pull the latest version

**Given** a standalone binary downloaded for a supported platform
**When** a user runs the binary on a machine without Node.js
**Then** the `jy` command works identically to the npm-installed version (Node.js is bundled in the binary)

**Given** the release workflow
**When** reviewing runner configuration
**Then** it uses ubuntu-latest for linux tarballs and the release process (macOS and Windows cross-compilation handled by oclif pack, or runners adjusted when the repo is public)

**Given** the project test suite
**When** `npm test` is run
**Then** the oclif manifest generation (`oclif manifest`) succeeds and the package configuration supports `oclif pack tarballs`

### Story 3.3: Curl Installer Script

As a **developer**,
I want **to install jy with a single curl command that auto-detects my OS and architecture**,
So that **I can get jy running in seconds without npm or manual binary downloads**.

**Acceptance Criteria:**

**Given** a Linux x64 machine
**When** the user runs `curl -fsSL https://raw.githubusercontent.com/<owner>/jy/main/install.sh | sh`
**Then** the script detects Linux x64 via `uname -s` and `uname -m`, downloads the correct tarball from GitHub Releases, extracts the binary to `/usr/local/bin` (or a user-specified location), and `jy --help` works immediately

**Given** a Linux arm64 machine
**When** the user runs the install command
**Then** the script detects arm64/aarch64 architecture and downloads the linux-arm64 tarball

**Given** a macOS Intel machine
**When** the user runs the install command
**Then** the script detects Darwin x86_64 and downloads the darwin-x64 tarball

**Given** a macOS Apple Silicon machine
**When** the user runs the install command
**Then** the script detects Darwin arm64 and downloads the darwin-arm64 tarball

**Given** a Windows machine
**When** the user attempts to run the curl installer
**Then** the script prints a message directing the user to install via npm (`npm install -g jy`) or download the binary directly from GitHub Releases

**Given** an unsupported OS or architecture
**When** the user runs the install command
**Then** the script exits with a clear error message listing supported platforms

**Given** a GitHub Release with no tarball for the detected platform
**When** the download step fails
**Then** the script exits with a clear error message and does not leave partial files behind

**Given** the installed binary
**When** the user runs `jy --help` after installation
**Then** the command executes successfully, confirming the binary is correctly placed and executable
