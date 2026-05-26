# Story 2.3: Output Formatting Options

Status: ready-for-dev

## Story

As a **developer**,
I want **to control indentation and line endings in the converted output using `--eol`, `--indent-style`, and `--indent-size`**,
so that **the output matches my project's formatting standards without post-processing**.

## Acceptance Criteria

1. **Given** a JSON file, **when** the user runs `jy data.json --eol crlf`, **then** the YAML output uses `\r\n` line endings instead of the default `\n`

2. **Given** a YAML file, **when** the user runs `jy data.yaml --eol lf`, **then** the JSON output uses `\n` line endings (the default, explicitly specified)

3. **Given** a JSON file, **when** the user runs `jy data.json --indent-size 4`, **then** the YAML output uses 4-space indentation instead of the default 2

4. **Given** a YAML file, **when** the user runs `jy data.yaml --indent-style tabs`, **then** the JSON output uses tab characters for indentation

5. **Given** `--indent-style tabs` is specified, **when** the user also passes `--indent-size 4`, **then** `--indent-size` is ignored (tabs have no configurable width) and tab indentation is used

6. **Given** formatting flags combined with `--out`, **when** the user runs `jy data.json --out dist --eol crlf --indent-size 4`, **then** the written file uses CRLF line endings and 4-space indentation

7. **Given** formatting flags combined with multi-file conversion, **when** the user runs `jy a.json b.json --indent-size 4`, **then** all output files use 4-space indentation consistently

8. **Given** the `output-formatter.ts` module, **when** it receives serialized content and formatting options, **then** it applies EOL conversion and indentation post-serialization, working identically for both JSON and YAML output

9. **Given** the project test suite, **when** `npm test` is run, **then** unit tests for `output-formatter.ts` (EOL conversion, indentation styles, tabs ignoring indent-size) and CLI integration tests for all formatting flag combinations pass

## Tasks / Subtasks

- [ ] Task 1: Create `src/output-formatter.ts` module (AC: #1, #2, #3, #4, #5, #8)
  - [ ] 1.1 Create the file with proper imports following project conventions (Node built-ins → external → internal, `.js` extensions)
  - [ ] 1.2 Define and export `FormatOptions` interface: `{ eol?: 'lf' | 'crlf'; indentSize?: number; indentStyle?: 'spaces' | 'tabs' }`
  - [ ] 1.3 Export `formatOutput(content: string, options: FormatOptions): string` — applies indentation changes first, then EOL conversion
  - [ ] 1.4 Implement `reIndent(content: string, options: FormatOptions): string` — internal function. Uses regex `^( +)` on each line (multiline `m` flag). For each leading-space run: compute indent level as `Math.floor(spaces / 2)` (2 is the serializer default), then replace with target indentation. For tabs: each level → one `\t`. For spaces: each level → `indentSize` spaces. Remainder spaces (from `spaces % 2`) are preserved as-is.
  - [ ] 1.5 Guard logic in `formatOutput`: skip `reIndent` when indentation is default (indentStyle is undefined/spaces AND indentSize is undefined/2). Skip EOL conversion when eol is undefined/lf.
  - [ ] 1.6 When `indentStyle === 'tabs'`, ignore `indentSize` entirely — each indent level becomes one tab character (AC #5)

- [ ] Task 2: Add formatting flags to root command in `src/commands/index.ts` (AC: #1, #2, #3, #4, #5)
  - [ ] 2.1 Add `eol: Flags.string({description: 'Line ending style (lf or crlf)', options: ['lf', 'crlf']})` to `static override flags`
  - [ ] 2.2 Add `'indent-size': Flags.integer({description: 'Number of spaces for indentation (default: 2)', min: 1})` to `static override flags`
  - [ ] 2.3 Add `'indent-style': Flags.string({description: 'Indentation style (spaces or tabs)', options: ['spaces', 'tabs']})` to `static override flags`
  - [ ] 2.4 Import `formatOutput` and `FormatOptions` from `../output-formatter.js`
  - [ ] 2.5 Build `FormatOptions` from parsed flags: `{ eol: flags.eol, indentSize: flags['indent-size'], indentStyle: flags['indent-style'] }`

- [ ] Task 3: Integrate formatter into stdout output path (AC: #1, #2, #3, #4, #7)
  - [ ] 3.1 In the multi-file stdout branch: after joining outputs with separator, apply `formatOutput()` to the entire joined string. This ensures separators (`---\n`) also get correct EOL and indentation is applied consistently.
  - [ ] 3.2 In the stdin branch: apply `formatOutput()` to the converted output before writing to stdout
  - [ ] 3.3 Both branches: `process.stdout.write(formatOutput(output, formatOptions))`

- [ ] Task 4: Integrate formatter into `--out` output path (AC: #6)
  - [ ] 4.1 In the `--out` branch: apply `formatOutput()` to each file's converted content before passing to `writeOutput()`
  - [ ] 4.2 Pattern: `await writeOutput(outDir, filePath, formatOutput(converted, formatOptions), targetFormat)`

- [ ] Task 5: Create unit tests in `test/output-formatter.test.ts` (AC: #9)
  - [ ] 5.1 Test `formatOutput` with `eol: 'crlf'` converts `\n` to `\r\n`
  - [ ] 5.2 Test `formatOutput` with `eol: 'lf'` (or undefined) returns content unchanged
  - [ ] 5.3 Test `formatOutput` with `indentSize: 4` converts 2-space indent to 4-space
  - [ ] 5.4 Test `formatOutput` with `indentSize: 4` handles multi-level nesting (4 spaces → 8 spaces for level 2)
  - [ ] 5.5 Test `formatOutput` with `indentStyle: 'tabs'` replaces leading spaces with tabs
  - [ ] 5.6 Test `formatOutput` with `indentStyle: 'tabs'` and `indentSize: 4` — indentSize is ignored, tabs used
  - [ ] 5.7 Test `formatOutput` with default options returns content unchanged
  - [ ] 5.8 Test `formatOutput` with `eol: 'crlf'` AND `indentSize: 4` — both applied
  - [ ] 5.9 Test `formatOutput` preserves non-leading spaces (content within lines unchanged)
  - [ ] 5.10 Test `formatOutput` handles empty string input
  - [ ] 5.11 Test `formatOutput` handles lines with no leading spaces (no indent change)

- [ ] Task 6: Add CLI integration tests in `test/commands/index.test.ts` (AC: #9)
  - [ ] 6.1 Test `--eol crlf` produces output with `\r\n` line endings (JSON→YAML)
  - [ ] 6.2 Test `--eol lf` produces output with `\n` line endings (explicit default)
  - [ ] 6.3 Test `--indent-size 4` produces 4-space indented output (JSON→YAML with nested fixture)
  - [ ] 6.4 Test `--indent-style tabs` produces tab-indented output (YAML→JSON with nested fixture)
  - [ ] 6.5 Test `--indent-style tabs --indent-size 4` — indentSize is ignored, output uses tabs
  - [ ] 6.6 Test formatting flags with `--out`: verify written file has correct formatting
  - [ ] 6.7 Test formatting flags with multi-file conversion: verify all outputs use consistent formatting
  - [ ] 6.8 Test formatting flags with stdin: `echo '...' | jy - --indent-size 4`
  - [ ] 6.9 Regression: verify existing tests still pass (single-file, multi-file, stdin, --out modes)

## Dev Notes

### Critical Architecture Patterns

- **Pipeline flow (unchanged):** input resolution → format detection → parsing → serialization → **output formatting** → output writing
- **Error handling:** All errors throw `JyError` — root command catches and calls `this.exit(code)`. Do NOT add new error handling patterns.
- **stdout output:** Use `process.stdout.write()` — NOT `this.log()` (double-newline issue)
- **stderr output:** Use `this.logToStderr()` — NOT `this.error()` (oclif intercepts it)
- **Import ordering:** Node built-ins → external packages → internal modules (blank lines between groups, `.js` extensions)
- **Naming:** kebab-case files, camelCase functions/variables, PascalCase types, UPPER_SNAKE_CASE constants
- **Module independence:** `output-formatter.ts` depends on NOTHING else in the project — it is a pure string transformation module with zero internal imports

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/output-formatter.ts` | Pure string transformation module: EOL conversion + indentation adjustment |
| `test/output-formatter.test.ts` | Unit tests for the formatter |

### Files to Modify (UPDATE)

| File | Changes |
|------|---------|
| `src/commands/index.ts` | Add `--eol`, `--indent-style`, `--indent-size` flags; integrate formatter into all output paths (stdout, stdin, --out) |
| `test/commands/index.test.ts` | Add CLI integration tests for formatting flag combinations |

### Files That Must NOT Be Modified

| File | Reason |
|------|--------|
| `src/converter.ts` | Serialization remains at default 2-space indent. Formatting is post-serialization. |
| `src/io.ts` | File I/O is unaware of formatting — formatted content is passed to `writeOutput()` by the command |
| `src/format-detector.ts` | No changes needed |
| `src/errors.ts` | No new error codes needed for formatting |

### Current State of Files Being Modified

**`src/commands/index.ts`** — Root command currently:
- Imports: `{Args, Command, Flags}` from `@oclif/core`, `convert`, `JyError/EXIT_IO`, format-detector functions, io functions
- Flags: `out: Flags.string(...)` only
- Three branches: stdin (`-`), `--out` file write, stdout
- Error handling: single try/catch wrapping entire `run()`, catches `JyError`, logs to stderr, exits with code
- Stdin branch: reads stdin → detects format → converts → `process.stdout.write(output)`
- `--out` branch: loops files → reads → converts → `writeOutput(outDir, filePath, converted, targetFormat)`
- stdout branch: loops files → reads → converts → collects → joins with separator → `process.stdout.write(outputs.join(separator))`

**Key integration points for formatter:**
```
stdin:    convert(content, ...) → formatOutput(output, opts) → stdout
--out:    convert(content, ...) → formatOutput(converted, opts) → writeOutput(...)
stdout:   convert(content, ...) → collect → join(separator) → formatOutput(joined, opts) → stdout
```

### Post-Serialization Formatting Design

The converter (`src/converter.ts`) always serializes with 2-space indentation:
- JSON: `JSON.stringify(data, null, 2) + '\n'`
- YAML: `stringifyYaml(data, {lineWidth: 0})` (yaml lib defaults to `indent: 2`)

The output-formatter transforms the 2-space serialized output to the desired format:

**Indentation re-mapping algorithm:**
1. For each line, match leading spaces using regex `^( +)` (multiline mode)
2. Compute indent level: `Math.floor(leadingSpaces / 2)` (2 = serializer default)
3. Compute remainder: `leadingSpaces % 2` (should be 0 for well-formed output)
4. Build replacement:
   - `--indent-style tabs`: `'\t'.repeat(level)` + `' '.repeat(remainder)`
   - `--indent-size N`: `' '.repeat(N * level)` + `' '.repeat(remainder)`

**EOL conversion:**
- Applied AFTER indentation (so we work with `\n` consistently during re-indent)
- Simple global replace: `content.replace(/\n/g, '\r\n')`
- JSON string values contain escaped `\n` (two chars `\` + `n`), not actual newlines — regex won't match them
- YAML multi-line strings use actual newlines — they WILL get CRLF, which is correct per NFR12 ("Output uses user-specified line endings regardless of host OS")

**Guard conditions (skip processing when defaults):**
- Skip re-indent when: `indentStyle` is undefined/`'spaces'` AND `indentSize` is undefined/`2`
- Skip EOL when: `eol` is undefined/`'lf'`

### Multi-File Output with Formatting

For stdout multi-file output, apply formatting to the ENTIRE joined string (not per-file):
```
outputs = files.map(f => convert(read(f), ...))
joined = outputs.join(separator)
process.stdout.write(formatOutput(joined, opts))
```
This ensures the `---\n` separator also gets CRLF conversion when `--eol crlf`.

For `--out` mode, apply formatting per-file (each file is written independently):
```
for (file of files) {
  converted = convert(read(file), ...)
  await writeOutput(outDir, file, formatOutput(converted, opts), targetFormat)
}
```

### Oclif Flag Definitions

```typescript
static override flags = {
  eol: Flags.string({description: 'Line ending style (lf or crlf)', options: ['lf', 'crlf']}),
  'indent-size': Flags.integer({description: 'Number of spaces for indentation (default: 2)', min: 1}),
  'indent-style': Flags.string({description: 'Indentation style (spaces or tabs)', options: ['spaces', 'tabs']}),
  out: Flags.string({description: 'Write converted files to this directory'}),
}
```

The `options` array provides built-in oclif validation — invalid values like `--eol windows` or `--indent-style mixed` will be rejected by oclif before `run()` is called.

The `min: 1` on `indent-size` validates positive integers at the oclif layer.

### Output Formatter Module Design

```typescript
// src/output-formatter.ts — PURE string transformation, zero internal dependencies

export interface FormatOptions {
  eol?: 'lf' | 'crlf'
  indentSize?: number
  indentStyle?: 'spaces' | 'tabs'
}

export function formatOutput(content: string, options: FormatOptions): string {
  // 1. Re-indent (if non-default), working with \n line endings
  // 2. EOL conversion (if crlf)
  // Returns transformed string
}
```

### YAML Tabs Consideration

The YAML 1.2 spec does NOT allow tabs for indentation (`TAB_AS_INDENT` error in the yaml library). However, `--indent-style tabs` applied post-serialization will produce output with tab indentation. If the resulting YAML is re-parsed by a strict YAML parser, it may fail. This is an acceptable edge case — the user explicitly requested tabs, and the tool applies them. The tool does not validate its own output.

In practice, `--indent-style tabs` is most useful for JSON output (YAML→JSON conversion), where tabs are perfectly valid.

### Previous Story Learnings (from Stories 2.1 and 2.2)

- `process.stdout.write(output)` is mandatory — `this.log()` adds unwanted newline
- `this.logToStderr(error.message)` for errors — NOT `this.error()` which oclif intercepts
- `this.exit(code)` throws `ExitError` — code after it is unreachable
- `strict = false` + `argv` for variadic args
- `resolveFilePaths()` handles globs and literal paths
- `detectFormatFromPaths()` validates all files have same format
- `convert()` appends trailing `\n` to output — no need to add one
- Tests: `runCommand([...args])` from `@oclif/test`, verify exit codes via `error?.oclif?.exit`
- Tests: use temp directories with `mkdtempSync` for isolation, `rmSync` in `finally` for cleanup
- Tests: chai `expect` assertions, `describe`/`it` style
- ESLint: add `// eslint-disable-next-line no-await-in-loop` for sequential file processing
- `writeOutput(outDir, filePath, content, targetFormat)` from `src/io.ts`
- `Format` type from `src/format-detector.ts`

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

**Unit tests (`test/output-formatter.test.ts`):**
- Test the `formatOutput` function directly with various input strings
- Use simple inline strings as input (no file fixtures needed)
- Example JSON input: `'{\n  "key": "value",\n  "nested": {\n    "inner": 1\n  }\n}\n'`
- Example YAML input: `'key: value\nnested:\n  inner: 1\n  list:\n    - item1\n    - item2\n'`
- Verify indentation changes with string equality assertions
- Verify EOL changes by checking for `\r\n` presence

**Integration tests (`test/commands/index.test.ts`):**
- Use the `nested.json` and `nested.yaml` fixtures (they have multi-level nesting, ideal for indent tests)
- For CRLF tests: check `stdout.includes('\r\n')` or count occurrences
- For indent tests: check specific indented lines in output
- For `--out` tests: read written file and verify formatting
- Follow existing test patterns: `runCommand([...args])`, `expect(stdout).to.contain(...)`
- Stdin tests: use `mockStdinWith()` helper pattern from existing tests

### Import Changes Required

**`src/commands/index.ts`:**
```typescript
// Add to imports:
import {formatOutput} from '../output-formatter.js'

// Type import not needed — FormatOptions is inferred from flag parsing
```

**`src/output-formatter.ts`:**
```typescript
// No imports needed — pure string transformation module
// No Node.js built-ins, no external packages, no internal modules
```

**`test/output-formatter.test.ts`:**
```typescript
import {expect} from 'chai'

import {formatOutput} from '../src/output-formatter.js'
```

### Project Structure After This Story

```
src/
├── commands/
│   └── index.ts              # Root command — now with --eol, --indent-style, --indent-size flags
├── converter.ts               # Parse + serialize (UNCHANGED)
├── errors.ts                  # JyError class (UNCHANGED)
├── format-detector.ts         # Format detection (UNCHANGED)
├── io.ts                      # File I/O (UNCHANGED)
├── output-formatter.ts        # NEW: EOL + indentation post-processing
└── index.ts                   # oclif entry point (UNCHANGED)

test/
├── commands/
│   └── index.test.ts          # CLI integration tests (UPDATED with formatting tests)
├── converter.test.ts          # (UNCHANGED)
├── errors.test.ts             # (UNCHANGED)
├── format-detector.test.ts    # (UNCHANGED)
├── io.test.ts                 # (UNCHANGED)
├── output-formatter.test.ts   # NEW: formatter unit tests
└── fixtures/                  # (UNCHANGED)
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — "Conversion Pipeline Architecture", "Output Formatting" sections]
- [Source: _bmad-output/planning-artifacts/prd.md — FR15, FR16, FR17, FR18, NFR12]
- [Source: _bmad-output/planning-artifacts/epics.md — Epic 2, Story 2.3 acceptance criteria]
- [Source: _bmad-output/implementation-artifacts/2-2-output-directory-writing.md — previous story patterns and learnings]
- [Source: yaml npm package docs — stringify options: `indent`, `indentSeq`, `lineWidth`]
- [Source: MDN JSON.stringify — indent parameter accepts number or string for tabs]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
