# Deferred Work

## Deferred from: code review of 1-1-project-initialization-error-foundation (2026-05-19)

- `@oclif/plugin-plugins` included in dependencies — unnecessary for a format-conversion CLI, adds plugin-installation attack surface [package.json]
- `bugs`, `homepage`, and `repository` fields contain oclif scaffold placeholder values (`jy/jy`) [package.json]
- `repository` field uses shorthand string `"jy/jy"` instead of npm object form `{"type":"git","url":"..."}` [package.json]
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
