# Story 2.2: Output Directory Writing

Status: done

## Story

As a **developer**,
I want **to write converted files to a specified output directory using `--out`**,
so that **I can batch-convert files into a target directory without manual file redirection**.

## Acceptance Criteria

1. **Given** a JSON file `src/config.json` and an output directory `dist/`, **when** the user runs `jy src/config.json --out dist`, **then** the converted YAML is written to `dist/config.yaml` (original filename with swapped extension) and nothing is written to stdout

2. **Given** multiple JSON files `a.json` and `b.json`, **when** the user runs `jy a.json b.json --out output`, **then** `output/a.yaml` and `output/b.yaml` are created with the converted content

3. **Given** a glob pattern matching YAML files, **when** the user runs `jy 'src/**/*.yaml' --out dist`, **then** each matched file is converted to JSON and written to `dist/` with the `.json` extension, preserving the original filename

4. **Given** the specified `--out` does not exist, **when** the user runs `jy data.json --out nonexistent/path`, **then** the directory is created (including intermediate directories) and the converted file is written successfully

5. **Given** the `--out` target has a permission issue, **when** the user runs `jy data.json --out /readonly-dir`, **then** an error message is written to stderr and the process exits with code 3 (IO error)

6. **Given** the project test suite, **when** `npm test` is run, **then** CLI integration tests for `--out` (file creation with swapped extensions, directory creation, multi-file output, IO error handling) pass

## Tasks / Subtasks

- [x] Task 1: Add `writeOutput` function to `src/io.ts` (AC: #1, #2, #3, #4, #5)
  - [x] 1.1 Import `mkdir` and `writeFile` from `node:fs/promises` (already importing from there — extend the import)
  - [x] 1.2 Add `writeOutput(outDir: string, originalFilePath: string, content: string, targetFormat: Format): Promise<void>` — computes output filename by swapping extension, creates `outDir` with `{recursive: true}`, writes file
  - [x] 1.3 Extension swap logic: `path.basename(originalFilePath, path.extname(originalFilePath))` + target extension (`.json` for json, `.yaml` for yaml)
  - [x] 1.4 Wrap `mkdir`/`writeFile` in try/catch — throw `JyError('Cannot write to directory: <outDir>: <reason>', EXIT_IO)` on failure (handles permission errors, EACCES, etc.)

- [x] Task 2: Add `--out` flag to root command in `src/commands/index.ts` (AC: #1, #2, #3)
  - [x] 2.1 Import `Flags` from `@oclif/core` (alongside existing `Args, Command` import)
  - [x] 2.2 Add `static override flags` with `out: Flags.string({description: 'Write converted files to this directory'})` — no shorthand flag
  - [x] 2.3 Parse the flag from `this.parse(Index)` — destructure `flags` alongside `argv`

- [x] Task 3: Update root command pipeline to route output to `--out` when specified (AC: #1, #2, #3, #4, #5)
  - [x] 3.1 When `flags.out` is present: instead of collecting outputs and writing to stdout, loop through files and call `writeOutput()` for each file's converted content
  - [x] 3.2 When `flags.out` is absent: preserve existing behavior (stdout with separators)
  - [x] 3.3 Import `writeOutput` from `../io.js` (add to existing import statement)
  - [x] 3.4 Import `Format` type from `../format-detector.js` (needed by `writeOutput`)
  - [x] 3.5 Fail-fast: let JyError propagate on first write failure (existing try/catch handles it)
  - [x] 3.6 Stdin mode: `--out` with stdin (`jy - --out dist`) is not covered by ACs — either ignore the flag silently or write to `dist/stdin.yaml`/`dist/stdin.json`. Simplest: treat stdin + `--out` as an error since there's no meaningful filename to derive. Throw `JyError('Cannot use --out with stdin input', EXIT_IO)` — this is the safest behavior.

- [x] Task 4: Add unit tests for `writeOutput` in `test/io.test.ts` (AC: #6)
  - [x] 4.1 Test `writeOutput` creates file with correct swapped filename in existing directory
  - [x] 4.2 Test `writeOutput` creates directory (including intermediates) if it doesn't exist
  - [x] 4.3 Test `writeOutput` throws `JyError` with `EXIT_IO` for permission-denied write
  - [x] 4.4 Test extension swap: `.json` → `.yaml`, `.yaml` → `.json`, `.yml` → `.json`

- [x] Task 5: Add CLI integration tests for `--out` in `test/commands/index.test.ts` (AC: #6)
  - [x] 5.1 Test single JSON file → YAML written to output dir with `.yaml` extension
  - [x] 5.2 Test single YAML file → JSON written to output dir with `.json` extension
  - [x] 5.3 Test multiple JSON files → each written to output dir
  - [x] 5.4 Test output dir is created when it doesn't exist (including nested path)
  - [x] 5.5 Test nothing is written to stdout when `--out` is used
  - [x] 5.6 Test exits with code 3 when output dir has permission issues
  - [x] 5.7 Test stdin + `--out` produces an error
  - [x] 5.8 Verify existing single-file, multi-file, and stdin modes still work (regression)

### Review Findings

- [x] [Review][Defer] Preserve relative source directories under `--out` to avoid duplicate-basename overwrites [src/io.ts:42] — deferred: valid edge case but uncommon; preserving input folder structure adds complexity, so revisit if real usage shows it is needed
- [x] [Review][Patch] Replace POSIX-only permission test setup with portable failure injection [test/io.test.ts:206]

## Dev Notes

### Critical Architecture Patterns

- **Pipeline flow (unchanged):** input resolution → format detection → parsing → serialization → output writing
- **Error handling:** All errors throw `JyError` — root command catches and calls `this.exit(code)`. Do NOT add new error handling patterns.
- **stdout output:** Use `process.stdout.write()` — NOT `this.log()` (double-newline issue)
- **stderr output:** Use `this.logToStderr()` — NOT `this.error()` (oclif intercepts it)
- **Import ordering:** Node built-ins → external packages → internal modules (blank lines between groups, `.js` extensions)
- **Naming:** kebab-case files, camelCase functions/variables, PascalCase types, UPPER_SNAKE_CASE constants

### Files to Modify (UPDATE)

| File | Changes |
|------|---------|
| `src/commands/index.ts` | Add `--out` flag via oclif `Flags.string`; route output to file writes or stdout based on flag presence |
| `src/io.ts` | Add `writeOutput()` function — mkdir + writeFile with extension swapping |
| `test/commands/index.test.ts` | Add `--out` CLI integration tests |
| `test/io.test.ts` | Add `writeOutput` unit tests |

### No New Files

All changes extend existing modules. Do NOT create new source files.

### Current State of Files Being Modified

**`src/commands/index.ts`** — Handles multi-file args or stdin (`-`). Structure:
```typescript
import {Args, Command} from '@oclif/core'
import {convert} from '../converter.js'
import {JyError} from '../errors.js'
import {detectFormatFromContent, detectFormatFromPaths, getTargetFormat} from '../format-detector.js'
import {readInput, readStdin, resolveFilePaths} from '../io.js'

export default class Index extends Command {
  static override args = {
    file: Args.string({description: 'File(s) to convert (or - for stdin)', required: true}),
  }
  static override description = 'Convert between JSON and YAML formats'
  static override strict = false

  async run(): Promise<void> {
    try {
      const {argv} = await this.parse(Index)
      const fileArgs = argv as string[]

      if (fileArgs.length === 1 && fileArgs[0] === '-') {
        // stdin branch
        const content = await readStdin()
        const sourceFormat = detectFormatFromContent(content)
        const output = convert(content, sourceFormat, 'stdin')
        process.stdout.write(output)
        return
      }

      // multi-file branch
      const filePaths = await resolveFilePaths(fileArgs)
      const sourceFormat = detectFormatFromPaths(filePaths)
      const targetFormat = getTargetFormat(sourceFormat)
      const separator = targetFormat === 'yaml' ? '---\n' : '\n'

      const outputs: string[] = []
      for (const filePath of filePaths) {
        const content = await readInput(filePath)
        outputs.push(convert(content, sourceFormat, filePath))
      }

      process.stdout.write(outputs.join(separator))
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

**Key change:** When `--out` is specified, instead of collecting outputs into an array and joining with separators, loop through files and write each output to a file in the output dir. Nothing goes to stdout.

**`src/io.ts`** — Currently exports `readInput(filePath)`, `readStdin()`, `resolveFilePaths(args)`. Currently imports `glob`, `readFile`, `stat` from `node:fs/promises`. Need to add `mkdir` and `writeFile` to that import.

**`src/format-detector.ts`** — Exports `Format` type, `detectFormatFromExtension`, `detectFormatFromContent`, `getTargetFormat`, `detectFormatFromPaths`. No changes needed to this file.

**`src/converter.ts`** — Exports `convert(content, sourceFormat, filePath)`. Returns serialized string with trailing `\n`. No changes needed.

**`src/errors.ts`** — Exports exit codes and `JyError` class. No changes needed.

### Extension Swap Logic

When writing to `--out`, the output filename is the original filename with the extension swapped to the target format:

| Original Extension | Target Format | Output Extension |
|-------------------|---------------|-----------------|
| `.json` | `yaml` | `.yaml` |
| `.yaml` | `json` | `.json` |
| `.yml` | `json` | `.json` |

Implementation:
```typescript
import path from 'node:path'

const baseName = path.basename(originalFilePath, path.extname(originalFilePath))
const targetExt = targetFormat === 'json' ? '.json' : '.yaml'
const outputPath = path.join(outDir, baseName + targetExt)
```

**Note:** Files with `.yml` extension get swapped to `.json` (not `.yml` → `.yaml`). The target extension is always `.yaml` for YAML and `.json` for JSON — consistent, predictable.

### Output Routing Logic

The root command's file branch needs a conditional fork:

```
if --out:
  for each file:
    read → convert → writeOutput(outDir, filePath, output, targetFormat)
  (nothing to stdout)
else:
  for each file:
    read → convert → collect output
  join with separator → stdout
```

Both branches share the same fail-fast behavior — a `JyError` on any file stops processing.

### Directory Creation Behavior

`mkdir(outDir, {recursive: true})` is idempotent — it creates the directory and all intermediate parents, and silently succeeds if the directory already exists. This handles AC #4 cleanly.

Call `mkdir` before every `writeFile` (or once before the loop). Calling it per-file is simpler and `{recursive: true}` makes repeated calls cheap. However, calling once before the loop is more efficient and equally correct since all files write to the same `outDir`.

**Recommended approach:** Call `mkdir` once in `writeOutput` using a guard or call it in the command before the loop. The simplest approach is to call it inside `writeOutput` — it runs `mkdir({recursive: true})` which is a no-op after the first call.

### Stdin + `--out` Edge Case

There is no acceptance criterion for `jy - --out dist`. Without a source filename, there's no meaningful output filename. Throw a clear error:
```typescript
if (fileArgs.length === 1 && fileArgs[0] === '-') {
  if (flags.out) {
    throw new JyError('Cannot use --out with stdin input', EXIT_IO)
  }
  // existing stdin logic...
}
```

This is safe and explicit. A future story could add `--out-file` for explicit naming.

### Previous Story Learnings (from Story 2.1)

- `process.stdout.write(output)` is mandatory — `this.log()` adds unwanted newline
- `this.logToStderr(error.message)` for errors — NOT `this.error()` which oclif intercepts
- `this.exit(code)` throws `ExitError` — code after it is unreachable
- `strict = false` + `argv` for variadic args (oclif v4 doesn't support `multiple: true` on Args)
- `resolveFilePaths()` handles globs and literal paths — already in place
- `detectFormatFromPaths()` validates all files have the same format — already in place
- `convert()` appends trailing `\n` to output — no need to add one
- Tests: `runCommand([...args])` from `@oclif/test`, verify exit codes via `error?.oclif?.exit`
- Tests: use temp directories with `mkdtempSync` for isolation, `rmSync` in `finally` for cleanup
- ESLint: add `// eslint-disable-next-line no-await-in-loop` for sequential file processing when needed (fail-fast requires sequential)
- Glob resolution returns sorted results — output file order is deterministic

### Oclif Flags Integration

Add flags alongside existing args. Oclif v4 `Flags.string` syntax:

```typescript
import {Args, Command, Flags} from '@oclif/core'

export default class Index extends Command {
  static override args = { ... }
  static override flags = {
    out: Flags.string({description: 'Write converted files to this directory'}),
  }
  // ...
  async run(): Promise<void> {
    const {argv, flags} = await this.parse(Index)
    // access: flags.out
  }
}
```

**Note:** Use the key `out` to match the CLI flag `--out`. Oclif handles the mapping.

### Deferred Work Awareness

From previous code reviews (do NOT fix these, just don't make them worse):
- `@oclif/plugin-plugins` is unnecessary but included — don't touch
- Event listeners in `readStdin()` not cleaned up — don't touch
- EPIPE unhandled on `process.stdout.write` — don't touch
- BOM vulnerability in `detectFormatFromContent` — don't touch
- `--to` flag deferred; `--quiet` flag deferred to later in Epic 2
- All I/O errors collapse to `EXIT_IO` — `EACCES`, `EISDIR` etc. indistinguishable (OK for now)

### Testing Guidance

- **Unit tests:** Test `writeOutput` as a function in `test/io.test.ts`
- **Integration tests:** Use temp directories for isolation. Pattern from 2.1: `mkdtempSync` + `try/finally` + `rmSync`
- **Verify file content:** After `runCommand`, use `readFileSync` to verify file was written with correct content
- **Verify nothing on stdout:** Assert `stdout === ''` when `--out` is used
- **Permission test:** Create a read-only directory (`chmodSync(dir, 0o444)`) and attempt to write. On macOS, root bypasses permissions — use `chmodSync` on the output directory and verify the error
- **Test patterns:** Follow existing `describe`/`it` style, chai `expect` assertions
- **Error assertions:** `.to.have.property('code', EXIT_IO)` pattern for JyError checks
- **CLI tests:** `runCommand(['file1', '--out', tmpDir])` for output dir tests

### Import Changes Required

**`src/commands/index.ts`:**
```typescript
// Change:
import {Args, Command} from '@oclif/core'
// To:
import {Args, Command, Flags} from '@oclif/core'

// Add to io.ts import:
import {readInput, readStdin, resolveFilePaths, writeOutput} from '../io.js'
```

**`src/io.ts`:**
```typescript
// Change:
import {glob, readFile, stat} from 'node:fs/promises'
// To:
import {glob, mkdir, readFile, stat, writeFile} from 'node:fs/promises'

// Add:
import path from 'node:path'

import type {Format} from './format-detector.js'
```

### Project Structure Notes

- All changes align with existing `src/` and `test/` structure
- No new files — only extensions to existing modules
- `mkdir` and `writeFile` from `node:fs/promises` (Node.js built-in, no new dependency)
- Import `Format` type from `format-detector.ts` into `io.ts` — this is the only new cross-module dependency
- Test file structure mirrors source: `test/io.test.ts` → `src/io.ts`, etc.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries — io.ts handles output writing]
- [Source: _bmad-output/planning-artifacts/architecture.md#Conversion Pipeline Architecture — Stage 6: Output Writing]
- [Source: _bmad-output/planning-artifacts/architecture.md#Error Handling Pattern — JyError + EXIT_IO for I/O failures]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2 — Acceptance criteria]
- [Source: _bmad-output/implementation-artifacts/2-1-multi-file-conversion-glob-support.md — Previous story learnings]
- [Source: _bmad-output/implementation-artifacts/deferred-work.md — Deferred items awareness]
- [Source: Node.js docs — fs.promises.mkdir(path, {recursive: true})]
- [Source: Node.js docs — fs.promises.writeFile(path, data)]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6 (GitHub Copilot)

### Debug Log References

### Completion Notes List

- Added `writeOutput()` function to `src/io.ts` — computes output filename via extension swap, creates output directory with `mkdir({recursive: true})`, writes file with `writeFile`, wraps errors in `JyError` with `EXIT_IO`
- Added `--out` flag to root command via oclif `Flags.string` — no shorthand
- Updated command pipeline: when `--out` present, loops files and writes each to output dir (nothing to stdout); when absent, preserves existing stdout behavior with separators
- Stdin + `--out` throws `JyError('Cannot use --out with stdin input', EXIT_IO)` — safe, explicit edge case handling
- Added 6 unit tests for `writeOutput` in `test/io.test.ts` — file creation, directory creation, permission error, extension swap for `.json`→`.yaml`, `.yaml`→`.json`, `.yml`→`.json`
- Added 7 CLI integration tests for `--out` in `test/commands/index.test.ts` — single JSON→YAML, single YAML→JSON, multi-file, nested dir creation, no stdout, permission error, stdin+out error
- All 94 tests pass (0 failures), lint clean
- All existing tests pass (no regressions) — single-file, multi-file, stdin modes unchanged

### File List

- `src/io.ts` (modified) — added `writeOutput()`, extended imports (`mkdir`, `writeFile`, `path`, `Format` type)
- `src/commands/index.ts` (modified) — added `Flags` import, `--out` flag, `writeOutput` import, `EXIT_IO` import, output routing logic
- `test/io.test.ts` (modified) — added `writeOutput` describe block with 6 tests
- `test/commands/index.test.ts` (modified) — added `--out` describe block with 7 tests

## Change Log

- 2026-05-25: Implemented Story 2.2 — Output Directory Writing. Added `writeOutput()` function, `--out` CLI flag, output routing in command pipeline, 13 new tests (6 unit + 7 integration). All 94 tests pass, lint clean.
- 2026-05-25: Course correction — renamed `--out-dir` to `--out` (shorter flag, same directory-only semantics). Custom output filename feature deferred (shell redirection covers single-file naming). Updated story spec, source, and tests.
