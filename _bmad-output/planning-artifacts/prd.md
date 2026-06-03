---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain-skipped, step-06-innovation-skipped, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments: [product-brief.md]
releaseMode: phased
documentCounts:
  briefs: 1
  research: 0
  brainstorming: 0
  projectDocs: 0
  projectContext: 0
classification:
  projectType: cli_tool
  domain: general
  complexity: low
  projectContext: greenfield
workflowType: 'prd'
---

# Product Requirements Document - cjy

**Author:** Bilal Shareef
**Date:** 2026-05-11

## Executive Summary

`cjy` is a cross-platform CLI tool that converts between JSON and YAML formats with zero configuration and zero dependencies. It targets developers who regularly work with structured data files — Kubernetes manifests, CI/CD pipelines, API payloads, application configs — and need fast, reliable format conversion without reaching for heavyweight tools or browser-based converters.

The tool provides a single-command interface (`cjy [input...] [flags]`), automatic format detection, multi-file/glob support, and configurable output formatting. It ships as standalone binaries for Linux (x64/arm64), macOS (Intel/Apple Silicon), and Windows (x64), installable via a single curl command or as an npm global package.

### What Makes This Special

Radical simplicity. Existing tools like `yq` and `jq` are powerful but overbuilt for the most common use case: "convert this file to the other format." `cjy` applies the Unix philosophy — do one thing well — to format conversion. No query language, no transformation pipelines, no schema validation. Just `cjy file.json` → YAML out. The value is in what it doesn't do.

Zero-friction distribution reinforces this: a single binary, no runtime dependencies, no package manager lock-in. Install once, use everywhere.

### Project Classification

- **Project Type:** CLI tool
- **Domain:** General developer tooling
- **Complexity:** Low — well-understood problem space, mature libraries, no regulatory constraints
- **Project Context:** Greenfield

## Success Criteria

### User Success

- **Zero-friction first use:** Developer installs and converts their first file in under 60 seconds
- **Script integration:** `cjy` slots into existing shell scripts and CI pipelines without special handling
- **Batch confidence:** Multi-file and glob operations produce correct results every time
- **Predictable behavior:** No surprises — output matches what the user expects from the input

### Business Success

- **Community adoption:** Others use `cjy` in production workflows
- **GitHub traction:** Meaningful star count indicating real-world utility and visibility
- **Word of mouth:** Developers recommend it as the go-to JSON/YAML converter

### Technical Success

- **Performance:** Sub-100ms for single file conversion; proportional scaling for large files without unreasonable degradation
- **Zero data loss:** Any file that passes validation converts with complete fidelity — no dropped keys, no mangled values, no silent truncation
- **Reliability:** Graceful handling of malformed input with clear, actionable error messages and correct exit codes

### Measurable Outcomes

- Single-file conversion completes in <100ms on typical hardware
- Round-trip conversion (JSON → YAML → JSON) produces identical data structures
- All defined exit codes are exercised and tested
- Binary install via curl works on all 5 target platforms without manual intervention

## User Journeys

### Journey 1: Quick Conversion (Developer — Interactive)

**Persona:** Ravi, a backend developer configuring a Kubernetes deployment.

**Opening Scene:** Ravi has a JSON config exported from a tool, but his Helm chart expects YAML. He's mid-flow, doesn't want to context-switch to a browser converter or remember `yq` syntax.

**Rising Action:** He types `cjy deployment.json`. Instantly, clean YAML appears in his terminal. He pipes it: `cjy deployment.json > deployment.yaml`.

**Climax:** It just works. No flags to remember, no format to specify. The output is readable, correctly indented, and he pastes it directly into his chart.

**Resolution:** Ravi finishes his deployment config without breaking flow. `cjy` becomes muscle memory — the thing he reaches for every time he needs the other format.

### Journey 2: Batch Pipeline (Developer — Scripting/CI)

**Persona:** Amara, a DevOps engineer maintaining a CI pipeline that generates JSON API specs, but downstream documentation tooling expects YAML.

**Opening Scene:** Amara's pipeline produces 40+ JSON spec files per build. She needs them all converted to YAML in a `dist/` directory.

**Rising Action:** She adds one line to her CI script: `cjy src/**/*.json --out-dir dist`. The glob resolves, all files convert, and the exit code is 0.

**Climax:** A new spec file is malformed. `cjy` exits with code 2 and a clear error message pointing to the file and line. The CI build fails visibly — no silent corruption.

**Resolution:** Amara trusts `cjy` in her pipeline. It's predictable, scriptable, and fails loudly when it should. She never has to babysit it.

### Journey 3: Error Recovery (Developer — Edge Cases)

**Persona:** Sam, a junior developer who accidentally renames a YAML file with a `.json` extension.

**Opening Scene:** Sam runs `cjy config.json` expecting YAML output, but the file is actually YAML content with a `.json` extension.

**Rising Action:** `cjy` attempts to parse as JSON (based on extension), fails, and exits with code 2: `Parse error: config.json is not valid JSON`.

**Climax:** Sam uses `--to yaml` to force the output format and re-examines the file. He realizes the extension mismatch. The error message was clear enough to diagnose immediately — no stack trace, no cryptic output.

**Resolution:** Sam corrects the filename. He learns that `cjy` trusts extensions but gives clear feedback when things don't match. No data is lost, no file is corrupted.

### Journey 4: First-Time Install & Evaluation

**Persona:** Kenji, a platform engineer evaluating lightweight tools for his team's developer toolkit.

**Opening Scene:** Kenji sees `cjy` mentioned in a GitHub discussion. He clicks through to the README.

**Rising Action:** He runs `curl -fsSL https://example.com/install | sh`. Within seconds, the binary is in his PATH. He tests: `echo '{"a":1}' | cjy -` — clean YAML out. He tries a round-trip and confirms fidelity.

**Climax:** No Node.js required, no package manager, works on his Linux CI boxes and his Mac. He's convinced in under 2 minutes.

**Resolution:** Kenji adds `cjy` to his team's base Docker image and recommends it in their internal tooling guide.

### Journey Requirements Summary

| Journey | Key Capabilities Revealed |
|---|---|
| Quick Conversion | Auto-detection, stdout default, minimal flags, instant response |
| Batch Pipeline | Glob support, `--out-dir`, correct exit codes, clear error messages |
| Error Recovery | Actionable parse errors, `--to` override, safe defaults (never overwrites) |
| First-Time Install | curl installer, cross-platform binaries, stdin support, zero dependencies |

## CLI-Specific Requirements

### Command Structure

- Single command interface: `cjy [input...] [flags]`
- No subcommands, no interactive prompts, no TUI
- All behavior controlled exclusively via flags — no config files, no environment variables, no `.cjyrc`
- Flags use GNU-style long options with `--` prefix

### Input Handling

| Input Type | Detection Method |
|---|---|
| File path (`.json`) | Extension → JSON |
| File path (`.yaml`, `.yml`) | Extension → YAML |
| stdin (`-`) | Content inspection: `{` or `[` → JSON, otherwise YAML |
| Glob patterns | Shell-expanded, each file detected by extension |

- Mixed input formats in a single invocation exit with code 4 (ambiguous format)
- `--to` flag overrides auto-detection for output format

### Output Behavior

- **Default:** Converted content to stdout (single file) or stdout with separators (multi-file without `--out-dir`)
- **`--out-dir`:** Writes each converted file to the specified directory, preserving filename with swapped extension
- **No structured machine output:** Plain text errors to stderr, converted content to stdout, exit codes for programmatic status
- **No interactive confirmation:** All operations execute immediately based on flags

### Formatting Options

| Flag | Values | Default |
|---|---|---|
| `--eol` | `lf`, `crlf` | `lf` |
| `--indent-style` | `spaces`, `tabs` | `spaces` |
| `--indent-size` | any positive integer | `2` |

- `--indent-size` ignored when `--indent-style=tabs`
- Formatting applied post-serialization to both JSON and YAML output

### Error Handling & Exit Codes

| Code | Meaning | Behavior |
|---|---|---|
| `0` | Success | All files converted successfully |
| `1` | Validation error | `--validate` found invalid input |
| `2` | Parse error | Input file could not be parsed |
| `3` | File system / IO error | File not found, permission denied, write failure |
| `4` | Mixed/ambiguous format | Cannot determine consistent input format |

- Errors written to stderr with file path and description
- MVP: stop on first error (fail-fast)

### Scripting Support

- All output to stdout (pipeable)
- All errors to stderr (separable)
- Deterministic exit codes for programmatic checks
- `--quiet` suppresses informational logs; only errors and converted output remain
- No color output by default (script-safe)

### Implementation Considerations

- **CLI framework:** oclif (TypeScript)
- **JSON parsing:** `JSON.parse()` (native)
- **YAML parsing:** `yaml` npm package
- **Binary distribution:** Standalone binaries via oclif packaging (no Node.js required at runtime)
- **Glob resolution:** Handle glob patterns for multi-file input

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP — the minimum that makes a developer say "this is useful."
**Resource Requirements:** Solo developer (learning project), TypeScript proficiency, familiarity with oclif and npm publishing.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Quick Conversion (interactive developer)
- Batch Pipeline (scripting/CI)
- Error Recovery (edge cases)
- First-Time Install & Evaluation

**Must-Have Capabilities:**
- Single-command interface: `cjy [input...] [flags]`
- Automatic format detection via file extension and stdin content inspection
- JSON → YAML and YAML → JSON conversion
- Multi-file and glob pattern support
- Multi-file stdout output with separator between files
- stdin/stdout workflows (`-` for stdin)
- `--validate` — parse-ability check only (no structural validation)
- `--to json|yaml` — explicit output format override
- `--out-dir <dir>` — write converted files to directory with swapped extension
- `--eol lf|crlf` — line ending control (default: `lf`)
- `--indent-style spaces|tabs` — indentation style (default: `spaces`)
- `--indent-size <n>` — indentation width (default: `2`, ignored with tabs)
- `--quiet` — suppress informational logs
- Exit codes 0–4 with clear error messages to stderr
- Stop on first error (fail-fast)
- npm global package installation (`npm install -g cjy`)
- Standalone binary distribution via curl installer
- Platform support: Linux x64/arm64, macOS Intel/Apple Silicon, Windows x64

### Post-MVP Features (Phase 2)

- `--in-place` — overwrite original files with converted content
- `--continue-on-error` — continue processing when a file fails
- Structural validation in `--validate` (e.g., duplicate YAML keys)
- Shell completion (bash, zsh, fish)

### Vision (Phase 3)

- Plugin system for custom format support
- Watch mode for development workflows
- IDE/editor integrations

### Risk Mitigation Strategy

**Technical Risks:**
- Binary distribution is the most complex MVP component. Mitigation: oclif has mature packaging support (`oclif pack`); npm global install ships in parallel as a fallback channel.
- YAML edge cases (anchors, aliases, complex types). Mitigation: the `yaml` package handles the spec well; scope limited to parse-ability, not structural validation.

**Market Risks:**
- Low discoverability in a crowded CLI space. Mitigation: clear README, real examples, GitHub presence. The tool's simplicity is its marketing — one command, one purpose.

**Resource Risks:**
- Solo developer with learning curve on oclif packaging. Mitigation: MVP scope is deliberately small; core conversion logic is straightforward. Binary packaging is the stretch — npm global install de-risks launch.

## Functional Requirements

### Format Conversion

- **FR1:** User can convert a JSON file to YAML output
- **FR2:** User can convert a YAML file to JSON output
- **FR3:** User can convert stdin input to the opposite format via stdout
- **FR4:** User can explicitly specify the output format using `--to json` or `--to yaml`, overriding auto-detection

### Format Detection

- **FR5:** System can detect input format from file extension (`.json` → JSON, `.yaml`/`.yml` → YAML)
- **FR6:** System can detect stdin format by inspecting content (leading `{` or `[` → JSON, otherwise YAML)
- **FR7:** System can reject ambiguous or mixed input formats across multiple files with exit code 4

### Multi-File Processing

- **FR8:** User can convert multiple files specified as individual paths in a single invocation
- **FR9:** User can convert multiple files matched by glob patterns in a single invocation
- **FR10:** System can output multi-file results to stdout with separators between each file's output
- **FR11:** User can write multi-file conversion results to a specified output directory using `--out-dir`, with filenames preserving the original name and swapping the extension

### Input Validation

- **FR12:** User can validate input files for parse-ability without producing converted output using `--validate`
- **FR13:** System can report validation failures with the file path and error description to stderr
- **FR14:** System can exit with code 1 on validation failure

### Output Formatting

- **FR15:** User can control line endings in output using `--eol` (lf or crlf)
- **FR16:** User can control indentation style using `--indent-style` (spaces or tabs)
- **FR17:** User can control indentation width using `--indent-size` (any positive integer)
- **FR18:** System can ignore `--indent-size` when `--indent-style` is set to tabs

### Error Handling

- **FR19:** System can report errors to stderr with file path and actionable description
- **FR20:** System can exit with distinct codes for different failure types (0 success, 1 validation, 2 parse, 3 IO, 4 ambiguous format)
- **FR21:** System can stop processing on first error (fail-fast behavior)

### Output Control

- **FR22:** User can suppress informational logs using `--quiet`, retaining only converted output and errors
- **FR23:** System can write converted content to stdout by default when no `--out-dir` is specified

### Distribution & Installation

- **FR24:** User can install `cjy` as an npm global package
- **FR25:** User can install `cjy` as a standalone binary via a curl-based installer script
- **FR26:** Installer script can detect the user's operating system and architecture and download the correct binary
- **FR27:** System can run as a standalone binary without requiring Node.js on the target machine
- **FR28:** System can support Linux x64, Linux arm64, macOS Intel, macOS Apple Silicon, and Windows x64

## Non-Functional Requirements

### Performance

- Single-file conversion completes in <100ms on typical hardware for files up to 1MB
- Performance scales proportionally for larger files without unreasonable degradation
- CLI startup time (no-op or `--help`) completes in <200ms
- Glob resolution and multi-file processing adds negligible per-file overhead

### Reliability & Data Integrity

- Round-trip conversion (JSON → YAML → JSON) produces semantically identical data structures — zero data loss
- All JSON data types (strings, numbers, booleans, null, arrays, objects) survive conversion without mutation
- YAML special values (anchors, aliases, multi-line strings, complex keys) are handled correctly or rejected with a clear error — never silently mangled
- Malformed input never produces partial or corrupted output — conversion either succeeds completely or fails cleanly

### Portability & Compatibility

- Standalone binaries run without Node.js or any runtime dependency on all 5 target platforms
- npm global package works on any system with Node.js 18+
- CLI behavior is identical across all supported platforms (same flags, same output, same exit codes)
- Output uses the user-specified line endings regardless of host OS

## Non-Goals

The following are explicitly out of scope for all phases:

- Querying or filtering data (no jq/yq-style expressions)
- Schema validation (only parse-ability validation)
- Comment preservation in YAML
- Configuration files (`.cjyrc`, env vars)
- Transformation pipelines
- Data manipulation beyond format conversion
