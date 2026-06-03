# Deferred Work

## Deferred from: code review of 1-1-project-initialization-error-foundation (2026-05-19)

- `@oclif/plugin-plugins` included in dependencies — unnecessary for a format-conversion CLI, adds plugin-installation attack surface [package.json]
- `bugs`, `homepage`, and `repository` fields contain oclif scaffold placeholder values (`cjy/cjy`) [package.json]
- `repository` field uses shorthand string `"cjy/cjy"` instead of npm object form `{"type":"git","url":"..."}` [package.json]
- No `sourceMap` or `declarationMap` in `tsconfig.json` — runtime stack traces point to compiled JS in `dist/` [tsconfig.json]
- `"runs with no args without crashing"` test asserts only `error` is undefined — near-tautology, provides minimal signal [test/commands/index.test.ts:10]

## Deferred from: code review of 1-2-single-file-format-conversion (2026-05-19)

- tsconfig project references removed while `composite: true` added — may leave `tsc --build` incremental graph incomplete [tsconfig.json]
- `composite: true` without `declarationMap: true` — go-to-definition across project references resolves to `.d.ts` rather than source [tsconfig.json]
- No stdin support — `readInput` hard-coded to file paths; Story 1.3 covers this [src/io.ts]
- All I/O errors collapse to `EXIT_IO` — `EACCES`, `EISDIR`, and other errors indistinguishable from file-not-found [src/io.ts]
- Redundant round-trip tests — two back-to-back tests cover identical data types with different variable names [test/converter.test.ts]
- Non-ENOENT I/O error path untested — `Cannot read file` branch requires filesystem mocking not yet set up [src/io.ts]
- Binary files silently accepted — `readFile('utf8')` on binary produces garbage, leading to cryptic parse error rather than clear message [src/io.ts]
- EPIPE unhandled on `process.stdout.write` — pipe closure before write completes may crash process with unhandled stream error [src/commands/index.ts]
- `detectFormatFromExtension` error message shows full path not extension — `'Unsupported file extension: /path/to/data.txt'` is slightly misleading [src/format-detector.ts]
- `getTargetFormat` over-exported — only needed by `converter.ts`; if converter dependency violation is resolved, export can be removed [src/format-detector.ts]

## Deferred from: story 1.4 scope reduction (2026-05-21)

- `--to json|yaml` output format override flag (FR4) — removed from Story 1.4 scope. With only two supported formats (JSON/YAML), the output format is fully determined by the input format, making `--to` redundant for cross-format conversion. Same-format re-serialization (pretty-printing) can be revisited as a dedicated feature if demand arises. [src/commands/index.ts, src/converter.ts]
- `--quiet` / `-q` flag (FR22) — deferred to Epic 2. Currently the CLI produces zero informational messages, so the flag has no observable effect. Should be implemented alongside multi-file processing (Epic 2) when informational status messages are introduced. [src/commands/index.ts]

## Course correction during story 2.2 code review (2026-05-25)

- `--out-dir` renamed to `--out` — shorter flag name, same directory-only semantics. The user considered expanding `--out` to support both directory and file targets (auto-detecting based on extension), but after analysis this was dropped: shell redirection (`cjy foo.json > bar.yaml`) already covers the custom-filename use case, and file-vs-directory disambiguation introduces ambiguity (directories can have dots in names). The flag remains strictly a directory target. [src/commands/index.ts, test/commands/index.test.ts]
- Custom output filename via `--out` — not implemented. Considered allowing `--out path/file.json` to write to a specific filename, but deferred: (1) shell redirection handles single-file output naming, (2) multi-file + single filename is undefined, (3) detecting file vs directory from the path is inherently ambiguous. If demand arises, could be revisited as a separate `--out-file` flag for single-file mode only.

## Deferred from: code review of 2-2-output-directory-writing (2026-05-26)

- Preserve relative source directories under `--out` to avoid duplicate-basename overwrites — valid edge case but uncommon; preserving input folder structure adds complexity, so revisit if real usage shows it is needed. [src/io.ts:42]

## Deferred from: code review of 3-3-curl-installer-script.md (2026-06-02)

- Standalone release entrypoints currently require `bash` on minimal Linux images, so the installer can succeed while the packaged `cjy` command still fails on Alpine-style environments. This is a pre-existing packaging constraint from the release artifact, not a defect introduced by `install.sh`. [tmp/linux-x64/cjy/bin/cjy:1]
