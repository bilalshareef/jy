# Story 1.2: Single-File Format Conversion

Status: ready-for-dev

## Story

As a **developer**,
I want **to convert a single JSON file to YAML or a single YAML file to JSON by running `jy <file>`**,
so that **I can instantly convert between formats without remembering flags or syntax**.

## Acceptance Criteria

1. **Given** a valid JSON file `config.json`
   **When** the user runs `jy config.json`
   **Then** the file is parsed as JSON (detected from `.json` extension), converted to YAML, and the YAML output is written to stdout

2. **Given** a valid YAML file `config.yaml`
   **When** the user runs `jy config.yaml`
   **Then** the file is parsed as YAML (detected from `.yaml` extension), converted to JSON, and the JSON output is written to stdout

3. **Given** a valid YAML file `config.yml`
   **When** the user runs `jy config.yml`
   **Then** the file is detected as YAML from the `.yml` extension and converted to JSON on stdout

4. **Given** a JSON file containing all JSON data types (strings, numbers, booleans, null, arrays, nested objects)
   **When** the user converts it to YAML and back to JSON
   **Then** the resulting data structure is semantically identical to the original — zero data loss (NFR5, NFR6)

5. **Given** a file path that does not exist
   **When** the user runs `jy nonexistent.json`
   **Then** an error message including the file path is written to stderr and the process exits with code 3 (IO error)

6. **Given** a file with a `.json` extension but invalid JSON content
   **When** the user runs `jy malformed.json`
   **Then** an error message including the file path and parse failure description is written to stderr and the process exits with code 2 (parse error)

7. **Given** a file with an unrecognized extension (e.g., `.txt`, `.xml`)
   **When** the user runs `jy data.txt`
   **Then** an error message is written to stderr and the process exits with code 4 (ambiguous format)

8. **Given** the conversion completes successfully
   **When** output is produced
   **Then** converted content goes to stdout, no informational messages are mixed into stdout, and the process exits with code 0

9. **Given** the project test suite
   **When** `npm test` is run
   **Then** unit tests for `format-detector.ts` (extension mapping, unrecognized extensions), `converter.ts` (JSON→YAML, YAML→JSON, round-trip fidelity), and `io.ts` (file reading, file-not-found) all pass, plus CLI integration tests verifying end-to-end single-file conversion via `@oclif/test`

## Tasks / Subtasks

- [ ] Task 1: Install `yaml` dependency (AC: #1, #2)
  - [ ] 1.1: Run `npm install yaml@^2.9.0`
  - [ ] 1.2: Verify `yaml` appears in `dependencies` section of `package.json`
  - [ ] 1.3: Verify `npm run build` still passes after adding dependency

- [ ] Task 2: Create `src/format-detector.ts` (AC: #1, #2, #3, #7)
  - [ ] 2.1: Define `Format` type as `'json' | 'yaml'`
  - [ ] 2.2: Implement `detectFormatFromExtension(filePath: string): Format` — extracts extension via `node:path`, maps `.json` → `'json'`, `.yaml`/`.yml` → `'yaml'`, throws `JyError` with `EXIT_AMBIGUOUS` for anything else
  - [ ] 2.3: Implement `getTargetFormat(sourceFormat: Format): Format` — returns the opposite format (`'json'` → `'yaml'`, `'yaml'` → `'json'`)
  - [ ] 2.4: Use `.js` extensions in all imports, follow import ordering convention

- [ ] Task 3: Create `src/converter.ts` (AC: #1, #2, #4, #6)
  - [ ] 3.1: Implement `convert(content: string, sourceFormat: Format): string` — parses content in source format and serializes to the opposite format
  - [ ] 3.2: JSON→YAML: use `JSON.parse()` then `yaml.stringify(data, {lineWidth: 0})` (disable line folding for clean output)
  - [ ] 3.3: YAML→JSON: use `yaml.parse()` then `JSON.stringify(data, null, 2)` with trailing newline
  - [ ] 3.4: Wrap parse errors in `JyError` with `EXIT_PARSE` — include file path context in error message where available
  - [ ] 3.5: Ensure round-trip fidelity for all JSON data types (strings, numbers, booleans, null, arrays, nested objects)

- [ ] Task 4: Create `src/io.ts` (AC: #5, #8)
  - [ ] 4.1: Implement `readInput(filePath: string): Promise<string>` — reads file using `node:fs/promises` `readFile` with `'utf8'` encoding
  - [ ] 4.2: Wrap file-not-found errors (`ENOENT`) in `JyError` with `EXIT_IO` including the file path in the message
  - [ ] 4.3: Wrap other file read errors (permissions, etc.) in `JyError` with `EXIT_IO`

- [ ] Task 5: Update `src/commands/index.ts` — wire the pipeline (AC: #1, #2, #3, #5, #6, #7, #8)
  - [ ] 5.1: Add variadic `args` definition accepting a single file path (use oclif `Args` with `{file: Args.string({required: true, description: 'File to convert'})}`)
  - [ ] 5.2: Wire the pipeline inside `run()` try/catch: read file → detect format → convert → write stdout
  - [ ] 5.3: Use `this.log()` to write converted output to stdout (respects oclif's output management)
  - [ ] 5.4: Keep the existing JyError catch pattern — `this.logToStderr(error.message)` + `this.exit(error.code)`
  - [ ] 5.5: Ensure non-JyError exceptions re-throw for oclif's default handler

- [ ] Task 6: Create test fixtures (AC: #9)
  - [ ] 6.1: Create `test/fixtures/` directory
  - [ ] 6.2: Create `test/fixtures/simple.json` — `{"name": "jy", "version": 1}`
  - [ ] 6.3: Create `test/fixtures/simple.yaml` — equivalent YAML content
  - [ ] 6.4: Create `test/fixtures/nested.json` — contains all JSON types (string, number, boolean, null, array, nested objects)
  - [ ] 6.5: Create `test/fixtures/nested.yaml` — equivalent YAML content
  - [ ] 6.6: Create `test/fixtures/malformed.json` — invalid JSON content (e.g. `{invalid json`)
  - [ ] 6.7: Create `test/fixtures/malformed.yaml` — invalid YAML content (e.g. `key: [broken: yaml`)

- [ ] Task 7: Write unit tests (AC: #9)
  - [ ] 7.1: Create `test/format-detector.test.ts` — test `.json`→JSON, `.yaml`→YAML, `.yml`→YAML, unrecognized extension throws `JyError`/`EXIT_AMBIGUOUS`, case sensitivity, paths with directories
  - [ ] 7.2: Create `test/converter.test.ts` — test JSON→YAML conversion, YAML→JSON conversion, round-trip fidelity (JSON→YAML→JSON identity), all JSON data types survive conversion, malformed JSON throws `JyError`/`EXIT_PARSE`, malformed YAML throws `JyError`/`EXIT_PARSE`
  - [ ] 7.3: Create `test/io.test.ts` — test successful file read, file-not-found throws `JyError`/`EXIT_IO`, returns string content
  - [ ] 7.4: Update `test/commands/index.test.ts` — add CLI integration tests: convert JSON file to YAML stdout, convert YAML file to JSON stdout, `.yml` extension works, nonexistent file returns exit code 3, malformed file returns exit code 2, unrecognized extension returns exit code 4

- [ ] Task 8: Verify all conventions (AC: #8, #9)
  - [ ] 8.1: Run `npm run build` — all files compile
  - [ ] 8.2: Run `npm test` — all tests pass
  - [ ] 8.3: Run `npm run lint` — no lint errors
  - [ ] 8.4: Verify kebab-case filenames, `.js` import extensions, import ordering

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
- `converter.ts` depends on `yaml` package + `errors.ts`
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
- Throws `YAMLParseError` on invalid input — catch and wrap in `JyError(message, EXIT_PARSE)`
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
throw new JyError(`Unsupported file extension: ${filePath}`, EXIT_AMBIGUOUS)

// Parse error (JSON)
throw new JyError(`Parse error: ${filePath} is not valid JSON`, EXIT_PARSE)

// Parse error (YAML)
throw new JyError(`Parse error: ${filePath} is not valid YAML`, EXIT_PARSE)

// IO error (file not found)
throw new JyError(`File not found: ${filePath}`, EXIT_IO)

// IO error (generic)
throw new JyError(`Cannot read file: ${filePath}`, EXIT_IO)
```

**Design decision for converter.ts:** The `convert()` function does parsing + serialization. For error messages that need the file path, there are two approaches:
1. Pass `filePath` as a parameter to `convert()` for error context
2. Have `convert()` throw generic parse errors and let the root command add path context

**Recommended: Option 1** — pass `filePath` to `convert()` so error messages are complete and actionable from within the module. This aligns with FR19 (errors with file path and actionable description).

### Format Detector — Implementation Details

```typescript
// src/format-detector.ts
import path from 'node:path'

import {EXIT_AMBIGUOUS, JyError} from './errors.js'

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
      throw new JyError(`Unsupported file extension: ${filePath}`, EXIT_AMBIGUOUS)
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

import {EXIT_IO, JyError} from './errors.js'

export async function readInput(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new JyError(`File not found: ${filePath}`, EXIT_IO)
    }

    throw new JyError(`Cannot read file: ${filePath}`, EXIT_IO)
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

import {EXIT_PARSE, JyError} from './errors.js'
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
    throw new JyError(`Parse error: ${filePath} is not valid ${formatLabel}`, EXIT_PARSE)
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
import {JyError} from '../errors.js'
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
      if (error instanceof JyError) {
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
- Non-JyError exceptions re-throw for oclif's default handler

**Note on `this.log()` trailing newline:** `this.log()` appends `\n` automatically. Since both JSON and YAML serialization already include a trailing newline, check output for double newlines. If `this.log()` adds an extra `\n`, use `process.stdout.write(output)` instead to avoid the double newline issue.

### Test Fixtures

Create `test/fixtures/` with these files:

**`simple.json`:**
```json
{
  "name": "jy",
  "version": 1
}
```

**`simple.yaml`:**
```yaml
name: jy
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
   - `.txt` → throws JyError with EXIT_AMBIGUOUS
   - `.xml` → throws JyError with EXIT_AMBIGUOUS
   - no extension → throws JyError with EXIT_AMBIGUOUS
   - `getTargetFormat('json')` → `'yaml'`
   - `getTargetFormat('yaml')` → `'json'`

2. **`test/converter.test.ts`:**
   - JSON→YAML: simple object produces valid YAML
   - YAML→JSON: simple YAML produces valid JSON
   - Round-trip: JSON→YAML→JSON produces identical structure (`deep.equal`)
   - All JSON types survive conversion (string, number, boolean, null, array, object)
   - Malformed JSON throws JyError with EXIT_PARSE
   - Malformed YAML throws JyError with EXIT_PARSE
   - Error message includes file path
   - Output always ends with `\n`

3. **`test/io.test.ts`:**
   - Reads existing file successfully
   - Returns string content
   - File not found throws JyError with EXIT_IO
   - Error message includes file path

**CLI integration tests (`test/commands/index.test.ts`):**
- `jy simple.json` → stdout contains valid YAML
- `jy simple.yaml` → stdout contains valid JSON
- `jy simple.yml` → stdout contains valid JSON (needs `.yml` fixture or symlink)
- `jy nonexistent.json` → exit code 3
- `jy malformed.json` → exit code 2
- `jy data.txt` → exit code 4
- Keep existing tests (--help, no-args, JyError catch boundary)

**Note on testing exit codes with @oclif/test:** The `runCommand` function from `@oclif/test` catches errors. To verify exit codes, check `error.oclif?.exit` on the returned error object.

### Previous Story Intelligence (Story 1.1)

**Key learnings to carry forward:**
- **tsx** is used as the test runner transpiler (Node v24 compatibility) — already in devDependencies
- oclif strategy is `"single"` with target `"./dist/commands/index.js"` — do NOT change this
- `this.parse(Index)` must be called in `run()` to avoid warnings — already in the pattern
- DEP0180 warning in dev mode is cosmetic — ignore it
- zsh glob behavior doesn't match dotfiles — not relevant for this story but noted

**Patterns established in Story 1.1:**
- Error handling: `JyError` throw → root command catch → `logToStderr` + `exit`
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
jy/
├── src/
│   ├── commands/
│   │   └── index.ts                   # Root command — wires pipeline (UPDATED)
│   ├── converter.ts                   # JSON↔YAML conversion (NEW)
│   ├── errors.ts                      # JyError, exit codes (unchanged)
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
- [Source: _bmad-output/planning-artifacts/architecture.md — "Error Handling Pattern" for JyError pattern and exit codes]
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

### Completion Notes List

### File List
