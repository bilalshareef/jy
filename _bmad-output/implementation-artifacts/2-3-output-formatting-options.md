# Story 2.3: Output Formatting Options

Status: done

## Story

As a **developer**,
I want **to control indentation and line endings in the converted output using `--eol`, `--indent-style`, and `--indent-size`**,
so that **the output matches my project's formatting standards without post-processing**.

## Acceptance Criteria

1. **Given** a JSON file, **when** the user runs `jy data.json --eol crlf`, **then** the YAML output uses `\r\n` line endings instead of the default `\n`

2. **Given** a YAML file, **when** the user runs `jy data.yaml --eol lf`, **then** the JSON output uses `\n` line endings (the default, explicitly specified)

3. **Given** a JSON file, **when** the user runs `jy data.json --indent-size 4`, **then** the YAML output uses 4-space indentation instead of the default 2

4. **Given** a YAML file, **when** the user runs `jy data.yaml --indent-style tabs`, **then** the JSON output uses tab characters for indentation

5. **Given** a YAML file, **when** the user runs `jy data.yaml --indent-style tabs --indent-size 4`, **then** the JSON output uses tab indentation and `--indent-size` is ignored

6. **Given** a JSON file, **when** the user runs `jy data.json --indent-style tabs --indent-size 4`, **then** the YAML output ignores `--indent-style` and uses 4-space indentation

7. **Given** formatting flags combined with `--out`, **when** the user runs `jy data.json --out dist --eol crlf --indent-size 4`, **then** the written file uses CRLF line endings and 4-space indentation

8. **Given** formatting flags combined with multi-file conversion, **when** the user runs `jy a.json b.json --indent-size 4`, **then** all output files use 4-space indentation consistently

9. **Given** the serialization layer, **when** indentation options are provided, **then** JSON indentation is applied with `JSON.stringify` and YAML indentation is applied with `stringifyYaml`, while `output-formatter.ts` only applies EOL conversion post-serialization

10. **Given** the project test suite, **when** `npm test` is run, **then** unit tests for serializer-backed indentation and `output-formatter.ts` EOL conversion, plus CLI integration tests for all formatting flag combinations, pass

## Tasks / Subtasks

- [x] Task 1: Keep `src/output-formatter.ts` focused on EOL conversion (AC: #1, #2, #9)
  - [x] 1.1 Define and export `FormatOptions` interface: `{ eol?: 'lf' | 'crlf' }`
  - [x] 1.2 Export `formatOutput(content: string, options: FormatOptions): string`
  - [x] 1.3 Apply EOL conversion only when `eol === 'crlf'`
  - [x] 1.4 Return content unchanged for default `lf` behavior

- [x] Task 2: Add formatting flags and serializer option mapping in the command layer (AC: #1, #2, #3, #4, #5, #6, #9)
  - [x] 2.1 Add `eol: Flags.string({description: 'Line ending style (lf or crlf)', options: ['lf', 'crlf']})` to `static override flags`
  - [x] 2.2 Add `'indent-size': Flags.integer({description: 'Number of spaces for indentation (default: 2). Ignored when --indent-style=tabs for JSON output.', min: 1})` to `static override flags`
  - [x] 2.3 Add `'indent-style': Flags.string({description: 'Indentation style (spaces or tabs). Ignored for YAML output.', options: ['spaces', 'tabs']})` to `static override flags`
  - [x] 2.4 Build EOL-only `FormatOptions` from parsed flags
  - [x] 2.5 Map CLI indentation flags to serializer options via `getSerializeOptions()` in `src/serialize-options.ts`

- [x] Task 3: Apply serializer-backed indentation and formatter-backed EOL in stdout paths (AC: #1, #2, #3, #4, #5, #6, #8, #9)
  - [x] 3.1 In the stdin branch: pass serializer options into `convert()` before writing formatted output to stdout
  - [x] 3.2 In the multi-file stdout branch: serialize each output with the correct indentation options, then apply `formatOutput()` to the joined string so separators (`---\n`) also get correct EOL conversion
  - [x] 3.3 Keep stdout writes on `process.stdout.write(formatOutput(output, formatOptions))`

- [x] Task 4: Integrate serializer-backed indentation into `--out` output path (AC: #7)
  - [x] 4.1 In the `--out` branch: pass serializer options into `convert()` for each file
  - [x] 4.2 Apply `formatOutput()` only for EOL handling before `writeOutput()`

- [x] Task 5: Add unit tests for serializer-backed indentation and formatter EOL handling (AC: #9, #10)
  - [x] 5.1 Test `convert(..., {yamlIndent: 4})` produces 4-space YAML output
  - [x] 5.2 Test YAML multiline scalars preserve content when `yamlIndent` changes
  - [x] 5.3 Test `convert(..., {jsonIndent: 4})` produces 4-space JSON output
  - [x] 5.4 Test `convert(..., {jsonIndent: '\t'})` produces tab-indented JSON output
  - [x] 5.5 Test `formatOutput` with `eol: 'crlf'` converts `\n` to `\r\n`
  - [x] 5.6 Test `formatOutput` with `eol: 'lf'` (or undefined) returns content unchanged
  - [x] 5.7 Test `formatOutput` handles empty string input

- [x] Task 6: Add CLI integration tests for target-aware formatting behavior (AC: #5, #6, #7, #8, #10)
  - [x] 6.1 Test `--eol crlf` produces output with `\r\n` line endings (JSON→YAML)
  - [x] 6.2 Test `--eol lf` produces output with `\n` line endings for YAML→JSON (explicit default)
  - [x] 6.3 Test `--indent-size 4` produces 4-space indented output (JSON→YAML with nested fixture)
  - [x] 6.4 Test `--indent-style tabs` produces tab-indented output (YAML→JSON with nested fixture)
  - [x] 6.5 Test `--indent-style tabs --indent-size 4` — indentSize is ignored, output uses tabs
  - [x] 6.6 Test `--indent-style tabs` is ignored for JSON→YAML while `--indent-size` still applies
  - [x] 6.7 Test formatting flags with `--out`: verify written file has correct formatting
  - [x] 6.8 Test formatting flags with stdin: `echo '...' | jy - --indent-size 4`
  - [x] 6.9 Test multi-file CRLF conversion also updates YAML separators
  - [x] 6.10 Regression: verify existing tests still pass (single-file, multi-file, stdin, --out modes)

## Dev Notes

### Critical Architecture Patterns

- **Pipeline flow (updated):** input resolution → format detection → parsing → serialization with target-specific indentation → EOL formatting → output writing
- **Error handling:** All errors throw `JyError` — root command catches and calls `this.exit(code)`. Do NOT add new error handling patterns.
- **stdout output:** Use `process.stdout.write()` — NOT `this.log()` (double-newline issue)
- **stderr output:** Use `this.logToStderr()` — NOT `this.error()` (oclif intercepts it)
- **Import ordering:** Node built-ins → external packages → internal modules (blank lines between groups, `.js` extensions)
- **Naming:** kebab-case files, camelCase functions/variables, PascalCase types, UPPER_SNAKE_CASE constants
- **Module independence:** `output-formatter.ts` remains a pure EOL transformation module with zero internal imports

### Files to Create (NEW)

| File | Purpose |
|------|---------|
| `src/output-formatter.ts` | Pure string transformation module: EOL conversion only |
| `src/serialize-options.ts` | CLI flag to serializer-option mapping |
| `test/output-formatter.test.ts` | Unit tests for EOL formatting |

### Files to Modify (UPDATE)

| File | Changes |
|------|---------|
| `src/commands/index.ts` | Add `--eol`, `--indent-style`, `--indent-size` flags; map CLI options into serializer options and EOL formatting |
| `src/converter.ts` | Apply indentation through `JSON.stringify` and `stringifyYaml` serializer options |
| `test/commands/index.test.ts` | Add CLI integration tests for target-aware formatting flag combinations |
| `test/converter.test.ts` | Add unit tests for serializer-backed indentation |

### Files That Must NOT Be Modified

| File | Reason |
|------|--------|
| `src/io.ts` | File I/O is unaware of formatting — formatted content is passed to `writeOutput()` by the command |
| `src/format-detector.ts` | No changes needed |
| `src/errors.ts` | No new error codes needed for formatting |

### Current State of Files Being Modified

**`src/commands/index.ts`** — Root command currently:
- Imports: `{Args, Command, Flags}` from `@oclif/core`, `convert`, `JyError/EXIT_IO`, format-detector functions, io functions
- Flags: `eol`, `indent-size`, `indent-style`, `out`
- Three branches: stdin (`-`), `--out` file write, stdout
- Error handling: single try/catch wrapping entire `run()`, catches `JyError`, logs to stderr, exits with code
- Stdin branch: reads stdin → detects format → derives serializer options → converts → applies EOL formatting → `process.stdout.write(output)`
- `--out` branch: loops files → reads → derives serializer options → converts → applies EOL formatting → `writeOutput(outDir, filePath, converted, targetFormat)`
- stdout branch: loops files → reads → derives serializer options → converts → collects → joins with separator → applies EOL formatting → `process.stdout.write(outputs.join(separator))`

**Key integration points:**
```
stdin:    convert(content, ..., serializeOpts) → formatOutput(output, {eol}) → stdout
--out:    convert(content, ..., serializeOpts) → formatOutput(converted, {eol}) → writeOutput(...)
stdout:   convert(content, ..., serializeOpts) → collect → join(separator) → formatOutput(joined, {eol}) → stdout
```

### Serialization-Backed Indentation Design

The converter (`src/converter.ts`) now applies indentation during serialization:
- JSON: `JSON.stringify(data, null, jsonIndent ?? 2) + '\n'`
- YAML: `stringifyYaml(data, {indent: yamlIndent ?? 2, lineWidth: 0})`

The output formatter is now responsible only for EOL conversion after serialization:

**Indentation rules:**
1. JSON output accepts `jsonIndent` as either a number or `'\t'`
2. YAML output accepts `yamlIndent` as a positive number of spaces
3. `--indent-style` is ignored for YAML output
4. `--indent-size` is ignored when JSON output uses `--indent-style tabs`

**EOL conversion:**
- Applied AFTER serialization so separators and content share the same final line endings
- Input line endings are not preserved through parse/serialize; serializers normalize structural line endings to `\n`, and `--eol` controls only the final emitted output
- Simple global replace: `content.replace(/\n/g, '\r\n')`
- JSON string values contain escaped `\n` (two chars `\` + `n`), not actual newlines — regex won't match them
- YAML multi-line strings use actual newlines — they WILL get CRLF, which is correct per NFR12 ("Output uses user-specified line endings regardless of host OS")

**Guard conditions:**
- Serializer indentation defaults to 2 spaces when no indentation flags are provided
- Skip EOL conversion when: `eol` is undefined/`'lf'`

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
  'indent-size': Flags.integer({description: 'Number of spaces for indentation (default: 2). Ignored when --indent-style=tabs for JSON output.', min: 1}),
  'indent-style': Flags.string({description: 'Indentation style (spaces or tabs). Ignored for YAML output.', options: ['spaces', 'tabs']}),
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
}

export function formatOutput(content: string, options: FormatOptions): string {
  // Apply EOL conversion after serialization
  // Returns transformed string
}
```

### YAML Tabs Consideration

The YAML 1.2 spec does NOT allow tabs for indentation (`TAB_AS_INDENT` error in the yaml library). The implementation therefore ignores `--indent-style` for YAML output and uses the YAML serializer's numeric `indent` option instead.

`--indent-style tabs` remains useful for JSON output (YAML→JSON conversion), where `JSON.stringify` accepts `'\t'` as the indentation argument.

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
- Test `formatOutput` directly with simple inline strings
- Verify only EOL conversion behavior and default no-op behavior

**Unit tests (`test/converter.test.ts`):**
- Verify YAML indentation via `yamlIndent`
- Verify JSON indentation via numeric and tab `jsonIndent`
- Verify multiline YAML scalar content is preserved when indentation changes

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
import {getSerializeOptions} from '../serialize-options.js'

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
├── converter.ts               # Parse + serialize with serializer-backed indentation
├── errors.ts                  # JyError class (UNCHANGED)
├── format-detector.ts         # Format detection (UNCHANGED)
├── io.ts                      # File I/O (UNCHANGED)
├── output-formatter.ts        # EOL conversion only
├── serialize-options.ts       # NEW: CLI flag to serializer-option mapping
└── index.ts                   # oclif entry point (UNCHANGED)

test/
├── commands/
│   └── index.test.ts          # CLI integration tests (UPDATED with formatting tests)
├── converter.test.ts          # UPDATED with serializer indentation tests
├── errors.test.ts             # (UNCHANGED)
├── format-detector.test.ts    # (UNCHANGED)
├── io.test.ts                 # (UNCHANGED)
├── output-formatter.test.ts   # UPDATED: EOL-only formatter unit tests
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

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

### Completion Notes List

- Simplified `src/output-formatter.ts` to a pure EOL transformation module with zero internal dependencies.
- Added `--eol`, `--indent-size`, `--indent-style` flags to root command in `src/commands/index.ts`
- Applied indentation through `JSON.stringify` and `stringifyYaml` serializer options, and kept `formatOutput()` for EOL conversion across stdin, stdout multi-file, and `--out` file write
- Added `src/serialize-options.ts` to keep CLI-to-serializer mapping out of the command body
- 7 unit tests in `test/output-formatter.test.ts` covering EOL behavior and defaults
- Added serializer-backed indentation coverage in `test/converter.test.ts`
- 8 CLI integration tests in `test/commands/index.test.ts` covering all flag combinations with files, stdin, --out, and multi-file
- All 115 tests pass, lint clean, no regressions
- `--indent-style` is ignored for YAML output; tabs remain supported for JSON output
- EOL conversion is skipped when using default `lf`

### File List

- `src/output-formatter.ts` (NEW)
- `src/serialize-options.ts` (NEW)
- `test/output-formatter.test.ts` (NEW)
- `src/commands/index.ts` (MODIFIED)
- `test/commands/index.test.ts` (MODIFIED)

### Change Log

- 2026-05-26: Implemented output formatting options (--eol, --indent-style, --indent-size) with full test coverage. 8 new integration tests, 13 new unit tests. All 115 tests pass.

### Review Findings

- [x] [Review][Patch] Re-indenting YAML block scalars mutates scalar content [src/output-formatter.ts:23]
- [x] [Review][Patch] Missing CLI coverage for explicit `--eol lf` on YAML to JSON conversion [test/commands/index.test.ts:311]
- [x] [Review][Patch] Missing multi-file CRLF separator coverage for joined stdout output [test/commands/index.test.ts:358]
