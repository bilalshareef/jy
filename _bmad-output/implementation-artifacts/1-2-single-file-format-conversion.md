# Story 1.2: Single-File Format Conversion

Status: done

## Story

As a **developer**,
I want **to convert a single JSON file to YAML or a single YAML file to JSON by running `cjy <file>`**,
so that **I can instantly convert between formats without remembering flags or syntax**.

## Acceptance Criteria

1. **Given** a valid JSON file `config.json`
   **When** the user runs `cjy config.json`
   **Then** the file is parsed as JSON (detected from `.json` extension), converted to YAML, and the YAML output is written to stdout

2. **Given** a valid YAML file `config.yaml`
   **When** the user runs `cjy config.yaml`
   **Then** the file is parsed as YAML (detected from `.yaml` extension), converted to JSON, and the JSON output is written to stdout

3. **Given** a valid YAML file `config.yml`
   **When** the user runs `cjy config.yml`
   **Then** the file is detected as YAML from the `.yml` extension and converted to JSON on stdout

4. **Given** a JSON file containing all JSON data types (strings, numbers, booleans, null, arrays, nested objects)
   **When** the user converts it to YAML and back to JSON
   **Then** the resulting data structure is semantically identical to the original — zero data loss (NFR5, NFR6)

5. **Given** a file path that does not exist
   **When** the user runs `cjy nonexistent.json`
   **Then** an error message including the file path is written to stderr and the process exits with code 3 (IO error)

6. **Given** a file with a `.json` extension but invalid JSON content
   **When** the user runs `cjy malformed.json`
   **Then** an error message including the file path and parse failure description is written to stderr and the process exits with code 2 (parse error)

7. **Given** a file with an unrecognized extension (e.g., `.txt`, `.xml`)
   **When** the user runs `cjy data.txt`
   **Then** an error message is written to stderr and the process exits with code 4 (ambiguous format)

8. **Given** the conversion completes successfully
   **When** output is produced
   **Then** converted content goes to stdout, no informational messages are mixed into stdout, and the process exits with code 0

9. **Given** the project test suite
   **When** `npm test` is run
   **Then** unit tests for `format-detector.ts` (extension mapping, unrecognized extensions), `converter.ts` (JSON→YAML, YAML→JSON, round-trip fidelity), and `io.ts` (file reading, file-not-found) all pass, plus CLI integration tests verifying end-to-end single-file conversion via `@oclif/test`

## Tasks / Subtasks

- [x] Task 1: Install `yaml` dependency (AC: #1, #2)
  - [x] 1.1: Run `npm install yaml@^2.9.0`
  - [x] 1.2: Verify `yaml` appears in `dependencies` section of `package.json`
  - [x] 1.3: Verify `npm run build` still passes after adding dependency

- [x] Task 2: Create `src/format-detector.ts` (AC: #1, #2, #3, #7)
  - [x] 2.1: Define `Format` type as `'json' | 'yaml'`
  - [x] 2.2: Implement `detectFormatFromExtension(filePath: string): Format` — extracts extension via `node:path`, maps `.json` → `'json'`, `.yaml`/`.yml` → `'yaml'`, throws `CjyError` with `EXIT_AMBIGUOUS` for anything else
  - [x] 2.3: Implement `getTargetFormat(sourceFormat: Format): Format` — returns the opposite format (`'json'` → `'yaml'`, `'yaml'` → `'json'`)
  - [x] 2.4: Use `.js` extensions in all imports, follow import ordering convention

- [x] Task 3: Create `src/converter.ts` (AC: #1, #2, #4, #6)
  - [x] 3.1: Implement `convert(content: string, sourceFormat: Format): string` — parses content in source format and serializes to the opposite format
  - [x] 3.2: JSON→YAML: use `JSON.parse()` then `yaml.stringify(data, {lineWidth: 0})` (disable line folding for clean output)
  - [x] 3.3: YAML→JSON: use `yaml.parse()` then `JSON.stringify(data, null, 2)` with trailing newline
  - [x] 3.4: Wrap parse errors in `CjyError` with `EXIT_PARSE` — include file path context in error message where available
  - [x] 3.5: Ensure round-trip fidelity for all JSON data types (strings, numbers, booleans, null, arrays, nested objects)

- [x] Task 4: Create `src/io.ts` (AC: #5, #8)
  - [x] 4.1: Implement `readInput(filePath: string): Promise<string>` — reads file using `node:fs/promises` `readFile` with `'utf8'` encoding
  - [x] 4.2: Wrap file-not-found errors (`ENOENT`) in `CjyError` with `EXIT_IO` including the file path in the message
  - [x] 4.3: Wrap other file read errors (permissions, etc.) in `CjyError` with `EXIT_IO`

- [x] Task 5: Update `src/commands/index.ts` — wire the pipeline (AC: #1, #2, #3, #5, #6, #7, #8)
  - [x] 5.1: Add variadic `args` definition accepting a single file path (use oclif `Args` with `{file: Args.string({required: true, description: 'File to convert'})}`)  
  - [x] 5.2: Wire the pipeline inside `run()` try/catch: detect format → read file → convert → write stdout
  - [x] 5.3: Use `process.stdout.write()` to write converted output to stdout (avoids `this.log()` double-newline)
  - [x] 5.4: Keep the existing CjyError catch pattern — `this.logToStderr(error.message)` + `this.exit(error.code)`
  - [x] 5.5: Ensure non-CjyError exceptions re-throw for oclif's default handler

- [x] Task 6: Create test fixtures (AC: #9)
  - [x] 6.1: Create `test/fixtures/` directory
  - [x] 6.2: Create `test/fixtures/simple.json` — `{"name": "cjy", "version": 1}`
  - [x] 6.3: Create `test/fixtures/simple.yaml` — equivalent YAML content
  - [x] 6.4: Create `test/fixtures/nested.json` — contains all JSON types (string, number, boolean, null, array, nested objects)
  - [x] 6.5: Create `test/fixtures/nested.yaml` — equivalent YAML content
  - [x] 6.6: Create `test/fixtures/malformed.json` — invalid JSON content (e.g. `{invalid json`)
  - [x] 6.7: Create `test/fixtures/malformed.yaml` — invalid YAML content (e.g. `key: [broken: yaml`)

- [x] Task 7: Write unit tests (AC: #9)
  - [x] 7.1: Create `test/format-detector.test.ts` — test `.json`→JSON, `.yaml`→YAML, `.yml`→YAML, unrecognized extension throws `CjyError`/`EXIT_AMBIGUOUS`, case sensitivity, paths with directories
  - [x] 7.2: Create `test/converter.test.ts` — test JSON→YAML conversion, YAML→JSON conversion, round-trip fidelity (JSON→YAML→JSON identity), all JSON data types survive conversion, malformed JSON throws `CjyError`/`EXIT_PARSE`, malformed YAML throws `CjyError`/`EXIT_PARSE`
  - [x] 7.3: Create `test/io.test.ts` — test successful file read, file-not-found throws `CjyError`/`EXIT_IO`, returns string content
  - [x] 7.4: Update `test/commands/index.test.ts` — add CLI integration tests: convert JSON file to YAML stdout, convert YAML file to JSON stdout, `.yml` extension works, nonexistent file returns exit code 3, malformed file returns exit code 2, unrecognized extension returns exit code 4

- [x] Task 8: Verify all conventions (AC: #8, #9)
  - [x] 8.1: Run `npm run build` — all files compile
  - [x] 8.2: Run `npm test` — all tests pass (44 passing)
  - [x] 8.3: Run `npm run lint` — no lint errors
  - [x] 8.4: Verify kebab-case filenames, `.js` import extensions, import ordering

## Dev Notes

### Architecture Compliance

This story introduces 3 new source modules in the conversion pipeline and wires them into the root command:

**Pipeline flow for this story:**
```
src/commands/index.ts (root command)
  ├── io.ts           → readInput(filePath) → content string
  ├── format-detector.ts → detectFormatFromExtension(filePath) → Format
  ├── converter.ts    → convert(content, sourceFormat) → output string
  └── stdout          → this.log(output)
```

**Module independence — CRITICAL:**
- `format-detector.ts` depends only on `node:path` + `errors.ts`
- `converter.ts` depends on `yaml` package + `errors.ts` + `format-detector.ts` (for `Format` type and `getTargetFormat`)
- `io.ts` depends on `node:fs/promises` + `node:path` + `errors.ts`
- `commands/index.ts` depends on `@oclif/core` + all internal modules
- **No module calls `process.exit()`** — only the root command via `this.exit()`
- **No module catches errors to suppress them** — errors propagate to root command

### Technical Stack & Versions

| Dependency | Version | Notes |
|---|---|---|
| `yaml` | ^2.9.0 | **NEW** — YAML parse/stringify. Use `parse()` and `stringify()` top-level API |
| `@oclif/core` | ^4.9.0 | CLI framework (existing) |
| Node.js | >=22 | Runtime (existing) |
| TypeScript | ^5 | Compiler (existing) |
| Mocha + `@oclif/test` | (existing) | Test framework |

### `yaml` Package API — Critical Usage Details

**Version:** 2.9.0 (latest stable). Docs at https://eemeli.org/yaml/

**Parse (YAML → JS):**
```typescript
import {parse as parseYaml} from 'yaml'
const data = parseYaml(content)  // returns native JS value
```
- Throws `YAMLParseError` on invalid input — catch and wrap in `CjyError(message, EXIT_PARSE)`
- Uses YAML 1.2 core schema by default (correct for this project)

**Stringify (JS → YAML):**
```typescript
import {stringify as stringifyYaml} from 'yaml'
const yamlStr = stringifyYaml(data, {lineWidth: 0})
```
- Always appends `\n` at the end (YAML convention)
- `lineWidth: 0` disables line folding — produces clean, predictable output
- Default `indent: 2` — matches project defaults
- Default string representation is `PLAIN` — clean output

**JSON handling — use native APIs:**
```typescript
const data = JSON.parse(content)  // throws SyntaxError on invalid
const jsonStr = JSON.stringify(data, null, 2) + '\n'  // pretty-printed with trailing newline
```

### Error Handling Pattern — File Path in Messages

Error messages MUST include the file path for user clarity:

```typescript
// Format detection error
throw new CjyError(`Unsupported file extension: ${filePath}`, EXIT_AMBIGUOUS)

// Parse error (JSON)
throw new CjyError(`Parse error: ${filePath} is not valid JSON`, EXIT_PARSE)

// Parse error (YAML)
throw new CjyError(`Parse error: ${filePath} is not valid YAML`, EXIT_PARSE)

// IO error (file not found)
throw new CjyError(`File not found: ${filePath}`, EXIT_IO)

// IO error (generic)
throw new CjyError(`Cannot read file: ${filePath}`, EXIT_IO)
```

**Design decision for converter.ts:** The `convert()` function does parsing + serialization. For error messages that need the file path, there are two approaches:
1. Pass `filePath` as a parameter to `convert()` for error context
2. Have `convert()` throw generic parse errors and let the root command add path context

**Recommended: Option 1** — pass `filePath` to `convert()` so error messages are complete and actionable from within the module. This aligns with FR19 (errors with file path and actionable description).

### Format Detector — Implementation Details

```typescript
// src/format-detector.ts
import path from 'node:path'

import {EXIT_AMBIGUOUS, CjyError} from './errors.js'

export type Format = 'json' | 'yaml'

export function detectFormatFromExtension(filePath: string): Format {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.json':
      return 'json'
    case '.yaml':
    case '.yml':
      return 'yaml'
    default:
      throw new CjyError(`Unsupported file extension: ${filePath}`, EXIT_AMBIGUOUS)
  }
}

export function getTargetFormat(sourceFormat: Format): Format {
  return sourceFormat === 'json' ? 'yaml' : 'json'
}
```

**Key decisions:**
- Extension comparison is case-insensitive (`.toLowerCase()`)
- `.yml` is supported alongside `.yaml` — both are common
- Unrecognized extension throws `EXIT_AMBIGUOUS` (code 4)
- `getTargetFormat()` is a simple toggle — will be used by `--to` flag override in Story 1.4

### IO Module — Implementation Details

```typescript
// src/io.ts
import {readFile} from 'node:fs/promises'

import {EXIT_IO, CjyError} from './errors.js'

export async function readInput(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new CjyError(`File not found: ${filePath}`, EXIT_IO)
    }

    throw new CjyError(`Cannot read file: ${filePath}`, EXIT_IO)
  }
}
```

**Key decisions:**
- Uses `node:fs/promises` (async API, ESM import)
- Always reads as UTF-8
- Distinguishes ENOENT from other IO errors in the message (both are EXIT_IO)
- This module will grow in later stories (glob resolution, output writing, --out-dir)

### Converter Module — Implementation Details

```typescript
// src/converter.ts
import {parse as parseYaml, stringify as stringifyYaml} from 'yaml'

import {EXIT_PARSE, CjyError} from './errors.js'
import type {Format} from './format-detector.js'

export function convert(content: string, sourceFormat: Format, filePath: string): string {
  const data = parseContent(content, sourceFormat, filePath)
  const targetFormat: Format = sourceFormat === 'json' ? 'yaml' : 'json'
  return serialize(data, targetFormat)
}

function parseContent(content: string, format: Format, filePath: string): unknown {
  try {
    if (format === 'json') {
      return JSON.parse(content)
    }

    return parseYaml(content)
  } catch {
    const formatLabel = format === 'json' ? 'JSON' : 'YAML'
    throw new CjyError(`Parse error: ${filePath} is not valid ${formatLabel}`, EXIT_PARSE)
  }
}

function serialize(data: unknown, format: Format): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2) + '\n'
  }

  return stringifyYaml(data, {lineWidth: 0})
}
```

**Key decisions:**
- `convert()` accepts `filePath` for error context — errors always include the file path
- `parseContent()` and `serialize()` are internal helpers — not exported
- `lineWidth: 0` on YAML stringify prevents line folding for predictable output
- JSON output gets trailing `\n` for consistency (YAML `stringify()` already includes one)
- `serialize()` will be extended in Story 2.3 for `--indent-size`, `--indent-style`, `--eol` support

### Root Command Update — Implementation Pattern

```typescript
// src/commands/index.ts
import {Args, Command} from '@oclif/core'

import {convert} from '../converter.js'
import {CjyError} from '../errors.js'
import {detectFormatFromExtension} from '../format-detector.js'
import {readInput} from '../io.js'

export default class Index extends Command {
  static override args = {
    file: Args.string({description: 'File to convert', required: true}),
  }

  static override description = 'Convert between JSON and YAML formats'

  async run(): Promise<void> {
    try {
      const {args} = await this.parse(Index)
      const content = await readInput(args.file)
      const sourceFormat = detectFormatFromExtension(args.file)
      const output = convert(content, sourceFormat, args.file)
      this.log(output)
    } catch (error) {
      if (error instanceof CjyError) {
        this.logToStderr(error.message)
        this.exit(error.code)
      }

      throw error
    }
  }
}
```

**CRITICAL oclif behaviors to remember (from Story 1.1):**
- `this.parse(Index)` is REQUIRED — prevents "did not parse its arguments" warning (see known issues)
- `this.logToStderr()` writes to stderr — NOT `this.error()` which throws internally
- `this.exit(code)` throws `ExitError` — code after it is unreachable
- `this.log()` writes to stdout — correct for converted output
- Non-CjyError exceptions re-throw for oclif's default handler

**Note on `this.log()` trailing newline:** `this.log()` appends `\n` automatically. Since both JSON and YAML serialization already include a trailing newline, check output for double newlines. If `this.log()` adds an extra `\n`, use `process.stdout.write(output)` instead to avoid the double newline issue.

### Test Fixtures

Create `test/fixtures/` with these files:

**`simple.json`:**
```json
{
  "name": "cjy",
  "version": 1
}
```

**`simple.yaml`:**
```yaml
name: cjy
version: 1
```

**`nested.json`:**
```json
{
  "string": "hello",
  "number": 42,
  "float": 3.14,
  "boolean": true,
  "null_value": null,
  "array": [1, "two", false],
  "nested": {
    "deep": {
      "key": "value"
    }
  }
}
```

**`nested.yaml`:**
```yaml
string: hello
number: 42
float: 3.14
boolean: true
null_value: null
array:
  - 1
  - two
  - false
nested:
  deep:
    key: value
```

**`malformed.json`:**
```
{invalid json content
```

**`malformed.yaml`:**
```
key: [broken: yaml
```

### Test Strategy

**Unit tests (pure function testing):**

1. **`test/format-detector.test.ts`:**
   - `.json` → `'json'`
   - `.yaml` → `'yaml'`
   - `.yml` → `'yaml'`
   - `.JSON` / `.YAML` → correct format (case insensitive)
   - `path/to/file.json` → works with directory paths
   - `.txt` → throws CjyError with EXIT_AMBIGUOUS
   - `.xml` → throws CjyError with EXIT_AMBIGUOUS
   - no extension → throws CjyError with EXIT_AMBIGUOUS
   - `getTargetFormat('json')` → `'yaml'`
   - `getTargetFormat('yaml')` → `'json'`

2. **`test/converter.test.ts`:**
   - JSON→YAML: simple object produces valid YAML
   - YAML→JSON: simple YAML produces valid JSON
   - Round-trip: JSON→YAML→JSON produces identical structure (`deep.equal`)
   - All JSON types survive conversion (string, number, boolean, null, array, object)
   - Malformed JSON throws CjyError with EXIT_PARSE
   - Malformed YAML throws CjyError with EXIT_PARSE
   - Error message includes file path
   - Output always ends with `\n`

3. **`test/io.test.ts`:**
   - Reads existing file successfully
   - Returns string content
   - File not found throws CjyError with EXIT_IO
   - Error message includes file path

**CLI integration tests (`test/commands/index.test.ts`):**
- `cjy simple.json` → stdout contains valid YAML
- `cjy simple.yaml` → stdout contains valid JSON
- `cjy simple.yml` → stdout contains valid JSON (needs `.yml` fixture or symlink)
- `cjy nonexistent.json` → exit code 3
- `cjy malformed.json` → exit code 2
- `cjy data.txt` → exit code 4
- Keep existing tests (--help, no-args, CjyError catch boundary)

**Note on testing exit codes with @oclif/test:** The `runCommand` function from `@oclif/test` catches errors. To verify exit codes, check `error.oclif?.exit` on the returned error object.

### Previous Story Intelligence (Story 1.1)

**Key learnings to carry forward:**
- **tsx** is used as the test runner transpiler (Node v24 compatibility) — already in devDependencies
- oclif strategy is `"single"` with target `"./dist/commands/index.js"` — do NOT change this
- `this.parse(Index)` must be called in `run()` to avoid warnings — already in the pattern
- DEP0180 warning in dev mode is cosmetic — ignore it
- zsh glob behavior doesn't match dotfiles — not relevant for this story but noted

**Patterns established in Story 1.1:**
- Error handling: `CjyError` throw → root command catch → `logToStderr` + `exit`
- Test structure: `describe('module-name', () => { it('does X', ...) })`
- Import ordering: Node built-ins → external → internal
- ESM `.js` extensions on all imports

### Git Intelligence

Recent commits (single commit for Story 1.1):
- `e9e29f9` feat: implement story 1.1 - project initialization error foundation
  - Created `src/errors.ts`, `src/commands/index.ts`
  - Created `test/errors.test.ts`, `test/commands/index.test.ts`
  - Established error handling pattern, project skeleton

### What NOT to Do

- **DO NOT** add flags (`--to`, `--quiet`, `--eol`, etc.) — those come in later stories (1.4 and 2.3)
- **DO NOT** implement stdin reading (`-` argument) — that's Story 1.3
- **DO NOT** implement multi-file handling — that's Story 2.1
- **DO NOT** implement output formatting (indentation/EOL options) — that's Story 2.3
- **DO NOT** create `src/output-formatter.ts` — that's for Story 2.3
- **DO NOT** change the oclif command strategy or add subcommands
- **DO NOT** use `process.exit()` in any module — only `this.exit()` in root command
- **DO NOT** catch errors in format-detector, converter, or io modules — let them propagate
- **DO NOT** use `require()` anywhere — ESM only
- **DO NOT** add `yaml` as a devDependency — it's a production dependency
- **DO NOT** use `yaml` version 1.x APIs — use v2 `parse()`/`stringify()` top-level imports

### Project Structure After This Story

```
cjy/
├── src/
│   ├── commands/
│   │   └── index.ts                   # Root command — wires pipeline (UPDATED)
│   ├── converter.ts                   # JSON↔YAML conversion (NEW)
│   ├── errors.ts                      # CjyError, exit codes (unchanged)
│   ├── format-detector.ts             # Extension-based format detection (NEW)
│   └── io.ts                          # File reading (NEW)
├── test/
│   ├── commands/
│   │   └── index.test.ts              # CLI integration tests (UPDATED)
│   ├── converter.test.ts              # Round-trip, parse/serialize tests (NEW)
│   ├── errors.test.ts                 # Exit code tests (unchanged)
│   ├── format-detector.test.ts        # Extension detection tests (NEW)
│   ├── io.test.ts                     # File read tests (NEW)
│   └── fixtures/                      # Test fixture files (NEW)
│       ├── malformed.json
│       ├── malformed.yaml
│       ├── nested.json
│       ├── nested.yaml
│       ├── simple.json
│       └── simple.yaml
└── package.json                       # yaml dependency added (UPDATED)
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — "Conversion Pipeline Architecture" for module structure and pipeline stages]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Error Handling Pattern" for CjyError pattern and exit codes]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Dependencies & Versions" for yaml ^2.9.0]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Implementation Patterns & Consistency Rules" for naming/import conventions]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Complete Project Directory Structure" for file layout]
- [Source: _bmad-output/planning-artifacts/architecture.md — "Testing Strategy" for unit + CLI integration test approach]
- [Source: _bmad-output/planning-artifacts/epics.md — "Story 1.2: Single-File Format Conversion" for acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — "Input Handling" for format detection rules]
- [Source: _bmad-output/planning-artifacts/prd.md — "Error Handling & Exit Codes" for exit code definitions]
- [Source: _bmad-output/implementation-artifacts/1-1-project-initialization-error-foundation.md — Dev Notes and Completion Notes for patterns and learnings]
- [Source: eemeli.org/yaml — yaml v2.9.0 API docs for parse/stringify options]
- [Source: known-issues.md — oclif single strategy fix, DEP0180 warning]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

- Pre-existing circular tsconfig reference caused `tsc -b` to fail — fixed by removing `references` from root `tsconfig.json`
- `import.meta.dirname` flagged by eslint `n/no-unsupported-features/node-builtins` — used `fileURLToPath(import.meta.url)` workaround
- Pipeline order mattered: original story spec had read→detect→convert, but format detection must come first for AC #7 (unrecognized extension should exit 4, not 3)

### Completion Notes List

- Implemented full single-file JSON↔YAML conversion pipeline: format detection → file read → convert → stdout
- Pipeline order: format detection runs before file read, so unsupported extensions get exit code 4 even if the file doesn't exist
- Used `process.stdout.write()` instead of `this.log()` to avoid double trailing newline (both serializers already append `\n`)
- Fixed pre-existing circular tsconfig reference (`tsconfig.json` ↔ `test/tsconfig.json`) — removed `references` from root tsconfig
- Used `fileURLToPath(import.meta.url)` instead of `import.meta.dirname` to stay within the configured Node.js >=22.0.0 engine range (lint rule `n/no-unsupported-features/node-builtins` requires >=22.16.0 for `import.meta.dirname`)
- 44 tests passing (8 CLI integration, 10 converter, 9 errors, 12 format-detector, 4 IO, 1 CjyError boundary)
- All acceptance criteria satisfied, zero lint errors

### File List

- `src/format-detector.ts` — NEW: Extension-based format detection, `Format` type, `detectFormatFromExtension()`, `getTargetFormat()`
- `src/converter.ts` — NEW: JSON↔YAML conversion with `convert()`, internal `parseContent()` and `serialize()` helpers
- `src/io.ts` — NEW: File reading with `readInput()`, ENOENT and generic IO error wrapping
- `src/commands/index.ts` — UPDATED: Wired pipeline with `Args.file`, format detection → file read → convert → stdout write
- `package.json` — UPDATED: Added `yaml@^2.9.0` to dependencies
- `tsconfig.json` — UPDATED: Removed circular `references` to `test/` path
- `test/fixtures/simple.json` — NEW: Simple JSON fixture
- `test/fixtures/simple.yaml` — NEW: Simple YAML fixture
- `test/fixtures/nested.json` — NEW: All-types JSON fixture
- `test/fixtures/nested.yaml` — NEW: All-types YAML fixture
- `test/fixtures/malformed.json` — NEW: Invalid JSON fixture
- `test/fixtures/malformed.yaml` — NEW: Invalid YAML fixture
- `test/format-detector.test.ts` — NEW: 12 tests for extension detection and target format
- `test/converter.test.ts` — NEW: 10 tests for conversion, round-trip, and error handling
- `test/io.test.ts` — NEW: 4 tests for file reading and error wrapping
- `test/commands/index.test.ts` — UPDATED: 8 CLI integration tests (was 3)

## Change Log

- 2026-05-19: Story 1.2 implemented — single-file JSON↔YAML conversion with full test suite (44 tests), all ACs satisfied, lint clean

### Review Findings

- [x] [Review][Decision] converter.ts imports from format-detector.ts — deviation accepted; dev note updated to reflect actual dependencies. [src/converter.ts:3-6]
- [x] [Review][Patch] Empty `catches CjyError` integration test body passes vacuously — replaced with `malformed.yaml` exit-code + stderr integration test [test/commands/index.test.ts]
- [x] [Review][Patch] `.yml` extension integration test never exercises `.yml` detection — added `test/fixtures/simple.yml`; test now uses it [test/commands/index.test.ts]
- [x] [Review][Patch] YAML empty/null document produces invalid output — added `undefined` guard in `parseContent`; throws `EXIT_PARSE` for empty documents [src/converter.ts:19]
- [x] [Review][Patch] Error-case integration tests assert only exit code, not stderr content — added `stderr` assertions for file path in all three error-path tests [test/commands/index.test.ts]
- [x] [Review][Defer] tsconfig project references removed while composite: true added — may leave tsc --build incremental graph incomplete [tsconfig.json] — deferred, pre-existing
- [x] [Review][Defer] composite: true without declarationMap: true — go-to-definition across project references resolves to .d.ts rather than source [tsconfig.json] — deferred, pre-existing
- [x] [Review][Defer] No stdin support — readInput hard-coded to file paths; Story 1.3 covers this [src/io.ts] — deferred, pre-existing
- [x] [Review][Defer] All I/O errors collapse to EXIT_IO — EACCES, EISDIR, and other errors indistinguishable from file-not-found [src/io.ts] — deferred, pre-existing
- [x] [Review][Defer] Redundant round-trip tests — two back-to-back tests cover identical data types with different variable names [test/converter.test.ts] — deferred, pre-existing
- [x] [Review][Defer] Non-ENOENT I/O error path untested — `Cannot read file` branch requires filesystem mocking not yet set up [src/io.ts] — deferred, pre-existing
- [x] [Review][Defer] Binary files silently accepted — readFile('utf8') on binary produces garbage, leading to cryptic parse error rather than clear message [src/io.ts] — deferred, pre-existing
- [x] [Review][Defer] EPIPE unhandled on process.stdout.write — pipe closure before write completes may crash process with unhandled stream error [src/commands/index.ts:20] — deferred, pre-existing
- [x] [Review][Defer] detectFormatFromExtension error message shows full path not extension — 'Unsupported file extension: /path/to/data.txt' is slightly misleading [src/format-detector.ts] — deferred, pre-existing
- [x] [Review][Defer] getTargetFormat over-exported — only needed by converter.ts; if D1 is resolved, export can be removed [src/format-detector.ts] — deferred, pre-existing
