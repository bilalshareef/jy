# Story 2.1: Multi-File Conversion & Glob Support

Status: done

## Story

As a **developer**,
I want **to convert multiple files in a single invocation using file paths or glob patterns**,
so that **I can batch-convert files efficiently without running cjy repeatedly**.

## Acceptance Criteria

1. **Given** two JSON files `a.json` and `b.json`, **when** the user runs `cjy a.json b.json`, **then** both files are converted to YAML and output to stdout separated by `---\n` (YAML document separator)

2. **Given** two YAML files `a.yaml` and `b.yaml`, **when** the user runs `cjy a.yaml b.yaml`, **then** both files are converted to JSON and output to stdout separated by a blank line (`\n`)

3. **Given** a directory containing `*.json` files, **when** the user runs `cjy 'src/**/*.json'`, **then** all matched files are converted to YAML and output to stdout with `---\n` separators between each file's output

4. **Given** a mix of `.json` and `.yaml` files as arguments, **when** the user runs `cjy data.json config.yaml`, **then** an error message is written to stderr and the process exits with code 4 (mixed/ambiguous format)

5. **Given** a glob pattern that matches no files, **when** the user runs `cjy 'nonexistent/*.json'`, **then** an error message is written to stderr and the process exits with code 3 (IO error)

6. **Given** multiple files where the second file is malformed, **when** the user runs `cjy good.json malformed.json`, **then** processing stops at the first error (fail-fast), an error message is written to stderr, and the process exits with code 2 (parse error)

7. **Given** the project test suite, **when** `npm test` is run, **then** unit tests for glob resolution in `io.ts`, mixed-format detection in `format-detector.ts`, and CLI integration tests for multi-file conversion (stdout separators, mixed-format rejection, fail-fast behavior) pass

## Tasks / Subtasks

- [x] Task 1: Update CLI argument to accept variadic file inputs (AC: #1, #2, #3)
  - [x] 1.1 Change `args.file` from single `Args.string` to variadic `Args.string` in `src/commands/index.ts`
  - [x] 1.2 Oclif variadic args: use `static override args = { files: Args.string({ required: true, multiple: true }) }` — verify oclif v4 supports this, otherwise use `static override strict = false` and `this.argv`

- [x] Task 2: Add glob resolution to `src/io.ts` (AC: #3, #5)
  - [x] 2.1 Add `resolveFilePaths(args: string[]): Promise<string[]>` function — for each arg, detect if it's a glob pattern (contains `*`, `?`, `[`), expand via `fsPromises.glob()`, or treat as a literal path
  - [x] 2.2 Collect results into a flat array preserving order (globs sorted alphabetically within their expansion)
  - [x] 2.3 Throw `CjyError('No files matched: <pattern>', EXIT_IO)` when a glob pattern matches zero files
  - [x] 2.4 Use Node.js 22 built-in `glob` from `node:fs/promises` — do NOT add any external glob dependency

- [x] Task 3: Add mixed-format detection to `src/format-detector.ts` (AC: #4)
  - [x] 3.1 Add `detectFormatFromPaths(filePaths: string[]): Format` function — calls `detectFormatFromExtension()` on each path, throws `CjyError('Mixed input formats: cannot convert files with both .json and .yaml/.yml extensions', EXIT_AMBIGUOUS)` if formats differ

- [x] Task 4: Update root command to orchestrate multi-file pipeline (AC: #1, #2, #3, #4, #5, #6)
  - [x] 4.1 Resolve args → file paths via `resolveFilePaths()`
  - [x] 4.2 Detect format from paths via `detectFormatFromPaths()`
  - [x] 4.3 Loop through files: read → convert → collect output
  - [x] 4.4 Join outputs with correct separator (`---\n` for YAML output, `\n` for JSON output)
  - [x] 4.5 Write joined result to stdout via `process.stdout.write()`
  - [x] 4.6 Fail-fast: let CjyError propagate on first failure (existing try/catch handles it)
  - [x] 4.7 Preserve stdin branch (`-` argument) — must still work for single stdin input

- [x] Task 5: Add unit tests for `io.ts` glob resolution (AC: #7)
  - [x] 5.1 Test `resolveFilePaths` with literal paths
  - [x] 5.2 Test `resolveFilePaths` with glob patterns matching test fixtures
  - [x] 5.3 Test `resolveFilePaths` throws EXIT_IO for no-match globs

- [x] Task 6: Add unit tests for `format-detector.ts` mixed-format detection (AC: #7)
  - [x] 6.1 Test `detectFormatFromPaths` with all-JSON paths returns `'json'`
  - [x] 6.2 Test `detectFormatFromPaths` with all-YAML paths returns `'yaml'`
  - [x] 6.3 Test `detectFormatFromPaths` with mixed paths throws EXIT_AMBIGUOUS

- [x] Task 7: Add CLI integration tests for multi-file conversion (AC: #7)
  - [x] 7.1 Test multi-JSON → YAML with `---\n` separator
  - [x] 7.2 Test multi-YAML → JSON with `\n` separator
  - [x] 7.3 Test mixed-format rejection exits with code 4
  - [x] 7.4 Test fail-fast on malformed second file exits with code 2
  - [x] 7.5 Test glob pattern expansion (create temp directory with fixtures)
  - [x] 7.6 Test glob with no matches exits with code 3
  - [x] 7.7 Verify single-file and stdin modes still work (regression)

### Review Findings

- [x] [Review][Patch] Literal filenames containing glob metacharacters are misclassified as patterns and fail with `No files matched` instead of being read as normal files [src/io.ts:38]
- [x] [Review][Patch] Broad glob patterns can include directories, which then fail later as `Unsupported file extension` with exit code 4 instead of being filtered out or reported as an IO/glob error [src/io.ts:44]
- [x] [Review][Patch] Recursive glob behavior from the explicit `src/**/*.json` acceptance path is not covered by tests, so AC3 can regress without detection [test/commands/index.test.ts:94]
- [x] [Review][Patch] Multi-file separator tests only assert presence, not exact boundary placement, so leading/trailing or duplicated separators would still pass [test/commands/index.test.ts:58]

## Dev Notes

### Critical Architecture Patterns

- **Pipeline flow (unchanged):** input resolution → format detection → parsing → serialization → output writing
- **Error handling:** All errors throw `CjyError` — root command catches and calls `this.exit(code)`. Do NOT add new error handling patterns.
- **stdout output:** Use `process.stdout.write()` — NOT `this.log()` (double-newline issue)
- **stderr output:** Use `this.logToStderr()` — NOT `this.error()` (oclif intercepts it)
- **Import ordering:** Node built-ins → external packages → internal modules (blank lines between groups, `.js` extensions)
- **Naming:** kebab-case files, camelCase functions/variables, PascalCase types

### Files to Modify (UPDATE)

| File | Changes |
|------|---------|
| `src/commands/index.ts` | Accept multiple file args; orchestrate multi-file loop; join with separators; preserve stdin branch |
| `src/io.ts` | Add `resolveFilePaths()` function using `fsPromises.glob` |
| `src/format-detector.ts` | Add `detectFormatFromPaths()` function for mixed-format validation |
| `test/commands/index.test.ts` | Add multi-file CLI integration tests |
| `test/io.test.ts` | Add `resolveFilePaths` unit tests |
| `test/format-detector.test.ts` | Add `detectFormatFromPaths` unit tests |

### No New Files

All changes extend existing modules. Do NOT create new source files.

### Current State of Files Being Modified

**`src/commands/index.ts`** — Currently handles single file arg or stdin (`-`). Structure:
```typescript
static override args = {
  file: Args.string({description: 'File to convert', required: true}),
}
async run(): Promise<void> {
  try {
    const {args} = await this.parse(Index)
    // stdin branch: args.file === '-'
    // file branch: detectFormatFromExtension → readInput → convert
    // output: process.stdout.write(output)
  } catch (error) {
    // CjyError → this.logToStderr + this.exit
    // other → re-throw
  }
}
```

**`src/io.ts`** — Currently exports `readInput(filePath)` and `readStdin()`. Only reads single files. Uses `readFile` from `node:fs/promises`.

**`src/format-detector.ts`** — Currently exports `detectFormatFromExtension(filePath)`, `detectFormatFromContent(content)`, `getTargetFormat(sourceFormat)`, and `Format` type. Single-file only.

**`src/converter.ts`** — Exports `convert(content, sourceFormat, filePath)`. Returns serialized string. This file needs NO changes — called per-file in the loop.

### Multi-File Output Separator Rules

Per architecture decision:
- **YAML output** (converting JSON → YAML): `---\n` between each file's output
- **JSON output** (converting YAML → JSON): `\n` (blank line) between each file's output

The separator goes BETWEEN outputs, not before the first or after the last.

Example — two JSON files converted to YAML:
```
key: value1
---
key: value2
```

Example — two YAML files converted to JSON:
```json
{
  "key": "value1"
}

{
  "key": "value2"
}
```

Note: `convert()` already appends a trailing `\n` to its output (`JSON.stringify(data, null, 2) + '\n'` and `stringifyYaml` adds trailing newline). So the JSON separator is just an additional `\n` (producing blank line), and YAML separator is `---\n`.

### Glob Resolution Implementation Details

Use Node.js 22 built-in `glob` from `node:fs/promises`:

```typescript
import {glob} from 'node:fs/promises'
```

`fsPromises.glob(pattern)` returns an `AsyncIterator<string>`. Collect results:

```typescript
const matches: string[] = []
for await (const entry of glob(pattern)) {
  matches.push(entry)
}
```

**Pattern detection heuristic:** If the arg contains `*`, `?`, or `[`, treat it as a glob. Otherwise, treat as a literal file path (don't try to glob it — just pass through). This avoids unnecessary filesystem scanning for plain paths.

**Critical:** `fsPromises.glob` resolves relative to `process.cwd()` by default. This is the correct behavior for CLI args.

### Oclif Variadic Args

Oclif v4 does NOT support `multiple: true` on `Args.string`. Use `static override strict = false` and access remaining args via `this.argv` (the raw args array after flag parsing). Alternatively, keep the single `file` arg and access `argv` for additional files.

**Recommended approach:** Keep `file` as the first required arg. Access additional files from `argv`. Or switch to `strict = false` and use `argv` entirely.

```typescript
static override strict = false
static override args = {
  file: Args.string({description: 'File(s) to convert (or - for stdin)', required: true}),
}

async run(): Promise<void> {
  const {argv} = await this.parse(Index)
  const fileArgs = argv as string[]
  // fileArgs contains all positional args
}
```

### Stdin Compatibility

The stdin branch (`-` argument) MUST still work. When `fileArgs` contains only `['-']`, use the existing stdin path. Stdin is only valid as the sole argument — `cjy - somefile.json` should be treated as an error or the `-` should be treated as a literal filename (which will fail with file-not-found).

### Previous Story Learnings (from Story 1.3)

- `process.stdout.write(output)` is mandatory — `this.log()` adds unwanted newline
- `this.logToStderr(error.message)` for errors — NOT `this.error()` which oclif intercepts
- `this.exit(code)` throws `ExitError` — code after it is unreachable
- Error message format: include file path, e.g., `Parse error: config.json is not valid JSON`
- Tests verify exit codes via `error?.oclif?.exit`
- Tests use `runCommand([...args])` from `@oclif/test`

### Deferred Work Awareness

From previous code reviews (do NOT fix these, just don't make them worse):
- `@oclif/plugin-plugins` is unnecessary but included — don't touch
- Event listeners in `readStdin()` not cleaned up — don't touch
- EPIPE unhandled on `process.stdout.write` — don't touch
- BOM vulnerability in `detectFormatFromContent` — don't touch
- `--to` flag deferred; `--quiet` flag deferred to later in Epic 2

### Testing Guidance

- **Unit tests:** Test `resolveFilePaths` and `detectFormatFromPaths` as pure functions in existing test files
- **Integration tests:** Use existing test fixtures (`test/fixtures/simple.json`, `simple.yaml`, `nested.json`, etc.)
- **Glob tests:** Create a temporary directory with test files for glob matching, or use existing `test/fixtures/` directory with glob patterns like `test/fixtures/*.json`
- **Test patterns:** Follow existing `describe`/`it` style, chai `expect` assertions
- **Error assertions:** `.to.have.property('code', EXIT_AMBIGUOUS)` pattern for CjyError checks
- **CLI tests:** `runCommand(['file1', 'file2'])` for multi-file, verify `stdout` contains separators

### Project Structure Notes

- All changes align with existing `src/` and `test/` structure
- No new files — only extensions to existing modules
- Import `glob` from `node:fs/promises` (Node.js built-in, no new dependency)
- Test file structure mirrors source: `test/io.test.ts` → `src/io.ts`, etc.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Multi-File Output Separator]
- [Source: _bmad-output/planning-artifacts/architecture.md#Conversion Pipeline Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Pattern]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1]
- [Source: _bmad-output/implementation-artifacts/1-3-stdin-conversion.md — Previous story learnings]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md — Deferred items awareness]
- [Source: Node.js v22 docs — fsPromises.glob(pattern[, options]) added in v22.0.0]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

### Completion Notes List

- Story context created from exhaustive analysis of epics, architecture, all source files, previous story artifacts, git history, and Node.js v22 API documentation
- Confirmed `fsPromises.glob` is available in Node.js 22+ as built-in — no external dependency needed
- Verified oclif v4 variadic args approach — `strict = false` + `argv`
- Previous story (1.3) learnings integrated: stdout/stderr patterns, error handling, test patterns
- Deferred work items documented to prevent regression
- Implementation complete: all 7 tasks implemented and tested
- Used `strict = false` + `argv` for variadic args (oclif v4 doesn't support `multiple: true` on Args)
- Added `resolveFilePaths()` with `fsPromises.glob` for glob expansion, `isGlobPattern()` heuristic for `*`, `?`, `[`
- Added `detectFormatFromPaths()` for mixed-format validation across multiple files
- Multi-file pipeline: resolve → detect format → loop (read → convert) → join with separator → stdout
- Separator: `---\n` for YAML output, `\n` (blank line) for JSON output
- Fail-fast: sequential file processing lets CjyError propagate on first failure
- Lint: added targeted ESLint disables for intentional `no-await-in-loop` (sequential fail-fast) and experimental `glob` API
- 77 tests passing (18 new), 0 regressions, lint clean

### File List

- `src/commands/index.ts` (UPDATE)
- `src/io.ts` (UPDATE)
- `src/format-detector.ts` (UPDATE)
- `test/commands/index.test.ts` (UPDATE)
- `test/io.test.ts` (UPDATE)
- `test/format-detector.test.ts` (UPDATE)
