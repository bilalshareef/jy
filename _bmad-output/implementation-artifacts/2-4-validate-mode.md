# Story 2.4: Validate Mode

Status: ready-for-dev

## Story

As a **developer**,
I want **to check if my files are valid JSON or YAML without producing converted output using `--validate`**,
so that **I can catch malformed files in CI pipelines or pre-commit checks without generating unnecessary output**.

## Acceptance Criteria

1. **Given** a valid JSON file, **when** the user runs `jy data.json --validate`, **then** no converted output is written to stdout and the process exits with code 0

2. **Given** a valid YAML file, **when** the user runs `jy data.yaml --validate`, **then** no converted output is written to stdout and the process exits with code 0

3. **Given** a malformed JSON file, **when** the user runs `jy malformed.json --validate`, **then** an error message with the file path and parse failure description is written to stderr and the process exits with code 1 (validation error)

4. **Given** multiple files where some are valid and one is malformed, **when** the user runs `jy good.json malformed.json --validate`, **then** processing stops at the first invalid file (fail-fast), an error is written to stderr, and the process exits with code 1

5. **Given** valid files matched by a glob pattern, **when** the user runs `jy src/**/*.json --validate`, **then** all matched files are validated and the process exits with code 0 if all pass

6. **Given** stdin input, **when** the user runs `echo '{"a":1}' | jy - --validate`, **then** the stdin content is validated for parse-ability without producing output, and the process exits with code 0

7. **Given** `--validate` combined with `--out`, **when** the user runs `jy data.json --validate --out dist`, **then** no files are written to the output directory (validate mode suppresses all output)

8. **Given** the project test suite, **when** `npm test` is run, **then** CLI integration tests for `--validate` (valid files, malformed files, multi-file validation, stdin validation, interaction with `--out`) pass

## Tasks / Subtasks

- [ ] Task 1: Add `validate` function to `src/converter.ts` (AC: #1, #2, #3)
  - [ ] 1.1 Export `validate(content: string, sourceFormat: Format, filePath: string): void` — parses the content, returns silently on success
  - [ ] 1.2 On parse failure, throw `JyError` with `EXIT_VALIDATION` (code 1), NOT `EXIT_PARSE` (code 2) — validation mode uses its own exit code
  - [ ] 1.3 Reuse the existing `parseContent` internal function — catch any `JyError` it throws and re-throw with `EXIT_VALIDATION` code and preserve the original message

- [ ] Task 2: Add `--validate` flag and validate-mode branch to `src/commands/index.ts` (AC: #1, #2, #3, #4, #5, #6, #7)
  - [ ] 2.1 Add `validate: Flags.boolean({description: 'Validate input files without producing output'})` to `static override flags`
  - [ ] 2.2 Add validate-mode branch at the TOP of the `try` block (after flag parsing, before any existing branches)
  - [ ] 2.3 Stdin validate path: if `fileArgs[0] === '-'` and `flags.validate` → read stdin, detect format, call `validate()`, return (no output)
  - [ ] 2.4 File validate path: if `flags.validate` → resolve file paths, detect format from paths, loop through files with fail-fast: read each → `validate()` → continue. Return silently on success (no output, exit 0)
  - [ ] 2.5 The `--out` flag is simply ignored in validate mode — no special error; validate just produces no output regardless

- [ ] Task 3: Add unit tests for `validate` function in `test/converter.test.ts` (AC: #3, #8)
  - [ ] 3.1 Test `validate` with valid JSON content returns without throwing
  - [ ] 3.2 Test `validate` with valid YAML content returns without throwing
  - [ ] 3.3 Test `validate` with malformed JSON throws `JyError` with `EXIT_VALIDATION` (code 1)
  - [ ] 3.4 Test `validate` with malformed YAML throws `JyError` with `EXIT_VALIDATION` (code 1)
  - [ ] 3.5 Test `validate` with empty YAML document throws `JyError` with `EXIT_VALIDATION` (code 1)

- [ ] Task 4: Add CLI integration tests for `--validate` in `test/commands/index.test.ts` (AC: #1–#8)
  - [ ] 4.1 Test valid JSON file with `--validate` → stdout is empty, no exit error
  - [ ] 4.2 Test valid YAML file with `--validate` → stdout is empty, no exit error
  - [ ] 4.3 Test malformed JSON with `--validate` → exit code 1, stderr contains file path
  - [ ] 4.4 Test malformed YAML with `--validate` → exit code 1, stderr contains file path
  - [ ] 4.5 Test multi-file valid JSON with `--validate` → exit code 0, stdout empty
  - [ ] 4.6 Test multi-file with one malformed (fail-fast) + `--validate` → exit code 1, stderr contains malformed file path
  - [ ] 4.7 Test glob pattern with `--validate` → all valid files, exit code 0
  - [ ] 4.8 Test stdin valid JSON with `--validate` → stdout empty, no error
  - [ ] 4.9 Test stdin malformed content with `--validate` → exit code 1
  - [ ] 4.10 Test `--validate` combined with `--out` → no files written to output directory
  - [ ] 4.11 Regression: verify existing tests still pass (single-file, multi-file, stdin, --out, formatting modes)

## Dev Notes

### Critical: Exit Code Semantics

**This is the single most important detail in this story.** Validate mode uses `EXIT_VALIDATION` (code 1), NOT `EXIT_PARSE` (code 2). The distinction:

| Mode | Parse failure exit code | Reason |
|------|------------------------|--------|
| Normal conversion | 2 (`EXIT_PARSE`) | "I tried to convert and parsing failed" |
| `--validate` | 1 (`EXIT_VALIDATION`) | "I explicitly checked validity and it failed" |

The existing `parseContent()` in `converter.ts` throws with `EXIT_PARSE`. The new `validate()` function must catch that and re-throw with `EXIT_VALIDATION`. Do NOT change `parseContent`'s behavior — it is correct for normal conversion mode.

### Pipeline Flow for Validate Mode

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
converter.ts: validate(content, format, filePath)  ← STOPS HERE
  │
  ✗ No serialization
  ✗ No output formatting
  ✗ No output writing
```

### Implementation Pattern for `validate()` in converter.ts

```typescript
export function validate(content: string, sourceFormat: Format, filePath: string): void {
  try {
    parseContent(content, sourceFormat, filePath)
  } catch (error) {
    if (error instanceof JyError) {
      throw new JyError(error.message, EXIT_VALIDATION)
    }
    throw error
  }
}
```

This reuses `parseContent` exactly as-is (no duplication), catches the `EXIT_PARSE` error, and re-throws with `EXIT_VALIDATION`.

### Implementation Pattern for Command Validate Branch

The validate branch should be inserted BEFORE the existing stdin/stdout/--out branches. Pseudocode:

```typescript
if (flags.validate) {
  if (fileArgs.length === 1 && fileArgs[0] === '-') {
    const content = await readStdin()
    const sourceFormat = detectFormatFromContent(content)
    validate(content, sourceFormat, 'stdin')
    return  // exit 0, no output
  }

  const filePaths = await resolveFilePaths(fileArgs)
  const sourceFormat = detectFormatFromPaths(filePaths)
  for (const filePath of filePaths) {
    const content = await readInput(filePath)  // eslint-disable-next-line no-await-in-loop
    validate(content, sourceFormat, filePath)
  }
  return  // exit 0, no output
}
```

Key points:
- `--out` is simply ignored (not an error) — validate produces no output regardless
- Fail-fast is inherent: first `validate()` throw stops the loop
- No `detectFormatFromPaths` needed for stdin — use `detectFormatFromContent`
- Formatting flags (`--eol`, `--indent-style`, `--indent-size`) are also irrelevant and silently ignored

### Import Addition for `src/commands/index.ts`

```typescript
// Add validate to the existing converter import:
import {convert, validate} from '../converter.js'
```

No new imports needed — `EXIT_VALIDATION` is NOT imported by the command; the `validate()` function handles the exit code internally.

### Files to Create (NEW)

None — no new files for this story.

### Files to Modify (UPDATE)

| File | Changes |
|------|---------|
| `src/converter.ts` | Add exported `validate()` function; add `EXIT_VALIDATION` import from errors |
| `src/commands/index.ts` | Add `--validate` boolean flag; add validate-mode branch before existing logic; add `validate` to converter import |
| `test/converter.test.ts` | Add unit tests for `validate()` function |
| `test/commands/index.test.ts` | Add `describe('--validate', ...)` integration tests |

### Files That Must NOT Be Modified

| File | Reason |
|------|--------|
| `src/errors.ts` | `EXIT_VALIDATION = 1` already exists — no changes needed |
| `src/io.ts` | File I/O is unaware of validate mode |
| `src/format-detector.ts` | No changes needed |
| `src/output-formatter.ts` | Not used in validate mode |
| `src/serialize-options.ts` | Not used in validate mode |

### Current State of Files Being Modified

**`src/converter.ts`** — Currently exports:
- `SerializeOptions` interface (`jsonIndent`, `yamlIndent`)
- `convert(content, sourceFormat, filePath, options)` — public, orchestrates parse+serialize
- `parseContent(content, format, filePath)` — private, parses JSON/YAML, throws `JyError(EXIT_PARSE)` on failure
- `serialize(data, format, options)` — private, serializes to JSON/YAML

The `validate()` function will call `parseContent` (already available in module scope) and re-throw with `EXIT_VALIDATION`.

**`src/commands/index.ts`** — Root command currently has three branches in order:
1. stdin (`fileArgs[0] === '-'`) — reads stdin, detects format, converts, formats, writes stdout
2. `--out` — loops files, converts, formats, writes to directory
3. stdout (default) — loops files, converts, collects, joins with separator, formats, writes stdout

The validate branch goes BEFORE all three, as a completely independent code path.

**Flags after this story:**
```typescript
static override flags = {
  eol: Flags.string({...}),
  'indent-size': Flags.integer({...}),
  'indent-style': Flags.string({...}),
  out: Flags.string({...}),
  validate: Flags.boolean({description: 'Validate input files without producing output'}),
}
```

### Previous Story Learnings (from Stories 2.1, 2.2, 2.3)

- `process.stdout.write(output)` is mandatory — `this.log()` adds unwanted newline
- `this.logToStderr(error.message)` for errors — NOT `this.error()` which oclif intercepts
- `this.exit(code)` throws `ExitError` — code after it is unreachable
- `strict = false` + `argv` for variadic args
- `resolveFilePaths()` handles globs and literal paths
- `detectFormatFromPaths()` validates all files have same format
- Tests: `runCommand([...args])` from `@oclif/test`, verify exit codes via `error?.oclif?.exit`
- Tests: use temp directories with `mkdtempSync` for isolation, `rmSync` in `finally` for cleanup
- Tests: chai `expect` assertions, `describe`/`it` style
- ESLint: add `// eslint-disable-next-line no-await-in-loop` for sequential file processing
- Stdin mock pattern: `mockStdinWith()` helper with `Readable`, save/restore `process.stdin` in beforeEach/afterEach
- `writeOutput(outDir, filePath, content, targetFormat)` from `src/io.ts`

### Deferred Work Awareness

From previous code reviews (do NOT fix these, just don't make them worse):
- `@oclif/plugin-plugins` is unnecessary but included — don't touch
- Event listeners in `readStdin()` not cleaned up — don't touch
- EPIPE unhandled on `process.stdout.write` — don't touch
- BOM vulnerability in `detectFormatFromContent` — don't touch
- `--to` flag deferred; `--quiet` flag deferred
- All I/O errors collapse to `EXIT_IO` — don't touch
- Preserve relative source directories under `--out` — don't touch

### Testing Guidance

**Unit tests (`test/converter.test.ts`):**
- Add a new `describe('validate', () => {...})` block
- Test valid content returns without error (JSON and YAML)
- Test malformed content throws `JyError` with code `EXIT_VALIDATION` (1), not `EXIT_PARSE` (2) — this is the critical assertion
- Test empty YAML document also throws `EXIT_VALIDATION`
- Use existing fixture content patterns or inline strings

**Integration tests (`test/commands/index.test.ts`):**
- Add a new `describe('--validate', () => {...})` block
- Use existing `fixturesDir` path for test files: `simple.json`, `simple.yaml`, `nested.json`, `malformed.json`, `malformed.yaml`
- For multi-file tests: use existing fixtures directly (no temp dir needed for read-only validation)
- For `--out` interaction test: use temp dir to verify no files are written
- For stdin tests: reuse the `mockStdinWith()` pattern already established in the stdin describe block
- Verify exit code 1 (not 2) for validation failures — `expect(error?.oclif?.exit).to.equal(1)`
- Verify stdout is empty for valid files — `expect(stdout).to.equal('')`

### Project Structure After This Story

```
src/
├── commands/
│   └── index.ts              # Root command — now with --validate flag
├── converter.ts               # Parse + serialize + validate
├── errors.ts                  # JyError class (UNCHANGED)
├── format-detector.ts         # Format detection (UNCHANGED)
├── io.ts                      # File I/O (UNCHANGED)
├── output-formatter.ts        # EOL conversion (UNCHANGED)
├── serialize-options.ts       # CLI flag mapping (UNCHANGED)
└── index.ts                   # oclif entry point (UNCHANGED)

test/
├── commands/
│   └── index.test.ts          # CLI integration tests (UPDATED with --validate tests)
├── converter.test.ts          # UPDATED with validate() unit tests
├── errors.test.ts             # (UNCHANGED)
├── format-detector.test.ts    # (UNCHANGED)
├── io.test.ts                 # (UNCHANGED)
├── output-formatter.test.ts   # (UNCHANGED)
└── fixtures/                  # (UNCHANGED — existing fixtures sufficient)
```

### References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.4: Validate Mode]
- [Source: _bmad-output/planning-artifacts/prd.md — FR12, FR13, FR14]
- [Source: _bmad-output/planning-artifacts/architecture.md — Error Handling Pattern, Pipeline Architecture]
- [Source: _bmad-output/implementation-artifacts/2-3-output-formatting-options.md — Previous Story Learnings]
- [Source: src/errors.ts — EXIT_VALIDATION = 1]
- [Source: src/converter.ts — parseContent private function, convert public function]
- [Source: src/commands/index.ts — Current command structure with 3 branches]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
