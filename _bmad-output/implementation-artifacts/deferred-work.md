# Deferred Work

## Deferred from: code review of 1-1-project-initialization-error-foundation (2026-05-19)

- `@oclif/plugin-plugins` included in dependencies — unnecessary for a format-conversion CLI, adds plugin-installation attack surface [package.json]
- `bugs`, `homepage`, and `repository` fields contain oclif scaffold placeholder values (`jy/jy`) [package.json]
- `repository` field uses shorthand string `"jy/jy"` instead of npm object form `{"type":"git","url":"..."}` [package.json]
- No `sourceMap` or `declarationMap` in `tsconfig.json` — runtime stack traces point to compiled JS in `dist/` [tsconfig.json]
- `"runs with no args without crashing"` test asserts only `error` is undefined — near-tautology, provides minimal signal [test/commands/index.test.ts:10]
