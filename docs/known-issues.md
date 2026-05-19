# Known Issues

## DEP0180 warning in dev mode on Node.js v24 (2026-05-15)

When running `./bin/dev.js`, a Node.js deprecation warning appears:

> `DEP0180: fs.Stats constructor is deprecated`

This comes from an oclif dependency, not our code. Cosmetic only — no functional impact.

- **Production mode** (`./bin/run.js`): No warnings at all.
- **Dev mode** (`./bin/dev.js`): Suppress with `NODE_NO_WARNINGS=1 ./bin/dev.js --help`.

Current `@oclif/core` version: 4.11.2 (latest v4). Will resolve when oclif updates their dependency.

### Resolved: SINGLE_COMMAND_CLI warnings (2026-05-15)

**Root cause:** The oclif `commands` config used the `pattern` strategy (`"commands": "./dist/commands"`). With `commands/index.ts` at the root, oclif's glob-based discovery mapped it to `SINGLE_COMMAND_CLI_SYMBOL` (empty command ID) and then failed to resolve the symbol string as a file path.

**Fix:** Switched to `strategy: "single"` with `target: "./dist/commands/index.js"` in the oclif package.json config. This is the correct pattern for `jy` since it's fundamentally a single-command converter CLI. The help and plugins plugins still work independently.
