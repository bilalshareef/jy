# Sprint Change Proposal — Post-Implementation Artifact Alignment

**Date:** 2026-06-03
**Author:** Bilal Shareef
**Status:** Approved ✓ (2026-06-03)
**Change Scope:** Minor
**Handoff:** Direct artifact updates — all changes are text-only

---

## Section 1: Issue Summary

### Problem Statement

All 3 epics and 11 stories are complete. During implementation, 3 deliberate deviations from the original planning artifacts were made and documented in `deferred-work.md`, but the planning artifacts (PRD, Architecture, Epics) were never updated to reflect these decisions. Additionally, the architecture's module structure diverged as implementation naturally refined boundaries.

### Discovery Context

Identified during a post-implementation alignment review (2026-06-03). All deviations are already documented in `deferred-work.md` and individual story files — this proposal formalizes the backport to planning artifacts.

### Evidence

1. **FR4 (`--to` flag) dropped** — documented in `deferred-work.md` under "Deferred from: story 1.4 scope reduction (2026-05-21)". Rationale: with only 2 formats, output is fully determined by input; same-format re-serialization deferred.
2. **FR22 (`--quiet` flag) deferred** — documented in `deferred-work.md` under same section. Rationale: CLI produces zero informational messages, making the flag a no-op.
3. **`--out-dir` renamed to `--out`** — documented in `deferred-work.md` under "Course correction during story 2.2 code review (2026-05-25)". Rationale: shorter flag name, same semantics.
4. **`--indent-style` YAML limitation** — discovered during Story 2.3 implementation. The `yaml` npm library does not support tab indentation; `--indent-style` only affects JSON output.
5. **Module structure evolved** — `serialize-options.ts` and `commands/helpers.ts` added; `output-formatter.ts` handles only EOL (indentation handled at serialization time).

---

## Section 2: Impact Analysis

### Epic Impact

No structural changes to epics. All 3 epics remain valid and complete.

| Epic | Impact |
|------|--------|
| Epic 1: Core CLI & Single-File Conversion | Text-only: remove `--to` and `--quiet` from Story 1.4 ACs |
| Epic 2: Multi-File Processing, Output Formatting & Validation | Text-only: `--out-dir` → `--out` in Story 2.2/2.3/2.4 ACs; `--indent-style` YAML note in Story 2.3 |
| Epic 3: CI/CD & Distribution | No changes |

### Story Impact

No stories added or removed. Text updates only:

| Story | Changes |
|-------|---------|
| 1.4 | Remove `--to` and `--quiet` acceptance criteria; update description |
| 2.2 | `--out-dir` → `--out` in all ACs |
| 2.3 | Add YAML limitation note for `--indent-style`; update `--indent-size` description |
| 2.4 | `--out-dir` → `--out` in `--validate` combination AC |

### Artifact Conflicts

| Artifact | Changes Needed |
|----------|---------------|
| PRD | FR4 → Post-MVP; FR22 → Post-MVP; `--out-dir` → `--out` (~8 refs); `--indent-style`/`--indent-size` YAML qualification |
| Architecture | Module list update (+2 files); file name fixes (`detector.ts` → `format-detector.ts`, `formatter.ts` → `output-formatter.ts`); formatter scope clarification; `--out-dir` → `--out` (~3 refs) |
| Epics | FR4/FR22 status in coverage map; `--out-dir` → `--out` (~15 refs); Story 1.4/2.2/2.3/2.4 AC updates |

### Technical Impact

None. All code is already correct. This proposal only updates documentation.

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment

Update planning artifacts to match the shipped implementation. No rollback, no scope change, no restructuring.

### Rationale

- All deviations are well-reasoned and documented
- Implementation is complete, tested, and working
- Changes are purely textual — no logic or behavioral impact
- The planning artifacts should reflect reality for future maintainers

### Effort Estimate: Low

All changes are find-and-replace or section rewrites within 3 markdown files.

### Risk Assessment: Low

No code changes. No behavioral changes. Pure documentation alignment.

### Timeline Impact: None

---

## Section 4: Detailed Change Proposals

### 4.1 — PRD Updates

**4.1.1 — FR4 moved to Post-MVP**

Move FR4 from "Functional Requirements > Format Conversion" to "Post-MVP Features (Phase 2)" with a note.

OLD (in Format Conversion section):
```
- **FR4:** User can explicitly specify the output format using `--to json` or `--to yaml`, overriding auto-detection
```

NEW: Remove FR4 from Format Conversion. Add to Post-MVP:
```
- `--to json|yaml` — explicit output format override (originally FR4; deferred because with only two formats, output is fully determined by input format)
```

**4.1.2 — FR22 moved to Post-MVP**

Move FR22 from "Functional Requirements > Output Control" to "Post-MVP Features (Phase 2)" with a note.

OLD:
```
- **FR22:** User can suppress informational logs using `--quiet`, retaining only converted output and errors
```

NEW: Remove FR22 from Output Control. Add to Post-MVP:
```
- `--quiet` — suppress informational logs (originally FR22; deferred because the CLI currently produces zero informational messages)
```

**4.1.3 — `--out-dir` → `--out` throughout**

Replace all `--out-dir` references with `--out` in the PRD (~8 occurrences).

**4.1.4 — `--indent-style` / `--indent-size` YAML qualification**

Update the Formatting Options table and FR16/FR18 to reflect the YAML limitation.

OLD:
```
- `--indent-size` ignored when `--indent-style=tabs`
- Formatting applied post-serialization to both JSON and YAML output
```

NEW:
```
- `--indent-size` ignored when `--indent-style=tabs` (JSON output only)
- `--indent-style` applies to JSON output only; YAML output always uses spaces (library limitation)
- Formatting applied post-serialization
```

**4.1.5 — Story 1.4 references in CLI requirements**

Remove `--to` from Input Handling table and `--quiet` from Scripting Support section.

### 4.2 — Architecture Updates

**4.2.1 — Module list update**

OLD (6 modules):
```
- `src/detector.ts` — Format detection logic
- `src/converter.ts` — Parse + serialize orchestration
- `src/formatter.ts` — EOL and indentation post-processing
- `src/io.ts` — File reading, glob resolution, output writing
- `src/errors.ts` — Error types mapped to exit codes 0–4
- `src/commands/index.ts` — oclif command
```

NEW (8 modules):
```
- `src/errors.ts` — Error types mapped to exit codes 0–4
- `src/format-detector.ts` — Format detection logic (extension-based + content inspection)
- `src/converter.ts` — Parse + serialize orchestration
- `src/serialize-options.ts` — Maps CLI indent flags to serializer-specific options
- `src/output-formatter.ts` — EOL post-processing
- `src/io.ts` — File reading, glob resolution, output writing
- `src/commands/helpers.ts` — Stdin validation helper
- `src/commands/index.ts` — oclif command (single root command wiring the pipeline)
```

**4.2.2 — Formatter scope clarification**

Update the "Output Formatting" pipeline stage and module boundary descriptions to reflect that indentation is handled at serialization time via `serialize-options.ts`, while `output-formatter.ts` handles only EOL conversion.

**4.2.3 — `--out-dir` → `--out`**

Replace ~3 references in testing strategy, data flow, and project structure sections.

**4.2.4 — Project directory structure update**

Add `serialize-options.ts` and `commands/helpers.ts` to the directory tree. Update test file list to include `commands/helpers.test.ts`. Note: `.eslintrc.json`, `.prettierrc.json`, `.mocharc.json` → `eslint.config.mjs` (flat config).

### 4.3 — Epics Updates

**4.3.1 — FR Coverage Map**

Update FR4 and FR22 entries to show "Deferred to Post-MVP" instead of Epic 1 coverage.

**4.3.2 — Story 1.4 rewrite**

Rename from "Output Format Override & Quiet Mode" to reflect actual scope (Story 1.4 was completed with reduced scope — `--to` and `--quiet` were removed). Update title, description, and acceptance criteria.

**4.3.3 — Story 2.2 flag name**

Replace all `--out-dir` with `--out` in acceptance criteria (~6 occurrences).

**4.3.4 — Story 2.3 YAML limitation**

Add note that `--indent-style` is ignored for YAML output. Update acceptance criteria for tabs to specify JSON output only.

**4.3.5 — Story 2.4 flag name**

Replace `--out-dir` with `--out` in the `--validate` combination AC.

**4.3.6 — Requirements Inventory**

Update FR4, FR11, FR22, FR16, FR18 descriptions to match current reality.

---

## Section 5: Implementation Handoff

### Change Scope Classification: Minor

Direct artifact updates. No backlog reorganization or strategic replan needed.

### Handoff

Self-service — all 3 planning artifacts updated in this same session.

### Success Criteria

- PRD reflects actual shipped CLI behavior (no `--to`, no `--quiet`, `--out` not `--out-dir`, YAML indent limitation)
- Architecture module list matches actual `src/` directory
- Epics FR coverage map and story ACs match implementation
- No contradictions between planning artifacts and `deferred-work.md`
