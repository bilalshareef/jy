# Sprint Change Proposal — Install Script Default Directory Fix

**Date:** 2026-06-05
**Author:** Bilal Shareef
**Triggered by:** Story 3.3 (Curl Installer Script) — post-completion bug
**Change scope:** Minor

---

## 1. Issue Summary

The `install.sh` curl installer fails for non-root users on macOS (and most Linux desktops) because:

1. **Default path requires root:** The default install directory (`/usr/local`) is not writable without `sudo` on macOS.
2. **Env var doesn't propagate through pipes:** The documented workaround `JY_INSTALL_DIR=$HOME/.local curl ... | sh` sets the variable for `curl`, not for `sh`. The `sh` process that executes the script never sees `JY_INSTALL_DIR`.

**Evidence:**
```
$ curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
Error: Cannot write to /usr/local/lib. Re-run with sudo or set JY_INSTALL_DIR=$HOME/.local

$ JY_INSTALL_DIR=~/Downloads/jy curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
Error: Cannot write to /usr/local/lib. Re-run with sudo or set JY_INSTALL_DIR=$HOME/.local
```

Both commands produce the same error — the env var override is completely ineffective.

---

## 2. Impact Analysis

### Epic Impact
- **Epic 3 (CI/CD & Distribution):** No structural change. All stories remain complete. This is a bug fix patch within Story 3.3's scope.
- **Epics 1 & 2:** No impact.

### Story Impact
- **Story 3.3 (Curl Installer Script):** Acceptance criteria assumed `/usr/local` is writable or that `JY_INSTALL_DIR` works with the documented pipe syntax. The fix addresses both assumptions.
- No other stories affected.

### Artifact Conflicts

| Artifact | Impact |
|----------|--------|
| `install.sh` | Default directory logic and error message need updating |
| `README.md` | Install examples use broken pipe syntax for env vars |
| PRD | No change needed — FR25/FR26 requirements are met once the fix lands |
| Architecture | No impact |
| CI/CD pipelines | No impact — CI runs as root, so `/usr/local` default is correct there |

### Technical Impact
- No code changes to the jy CLI itself
- No dependency changes
- No release pipeline changes
- Requires a new release to update the hosted `install.sh` on `main`

---

## 3. Recommended Approach

**Path:** Direct Adjustment — modify `install.sh` and `README.md` only.

**Rationale:**
- The fix is small and self-contained (2 files, 3 edits)
- No rollback needed — no completed work is invalidated
- No MVP scope change — this is a bug, not a feature gap
- Follows the convention used by `rustup`, `deno`, `bun`, and other modern CLI installers that default to `$HOME/.local`

**Effort:** Low
**Risk:** Low — only the default changes; explicit `JY_INSTALL_DIR` and `sudo` paths are unaffected
**Timeline impact:** None — can be implemented and released immediately

---

## 4. Detailed Change Proposals

### Change 1: `install.sh` — Smart default install directory

**Section:** Default variable assignment (lines 14–16)

OLD:
```sh
# Defaults (overridable via JY_INSTALL_DIR)
INSTALL_DIR="${JY_INSTALL_DIR:-/usr/local}"
LIB_DIR="${INSTALL_DIR}/lib/jy"
BIN_DIR="${INSTALL_DIR}/bin"
```

NEW:
```sh
# Defaults (overridable via JY_INSTALL_DIR)
# Non-root users default to $HOME/.local; root defaults to /usr/local.
if [ -n "${JY_INSTALL_DIR:-}" ]; then
  INSTALL_DIR="$JY_INSTALL_DIR"
elif [ "$(id -u)" = "0" ]; then
  INSTALL_DIR="/usr/local"
else
  INSTALL_DIR="$HOME/.local"
fi
LIB_DIR="${INSTALL_DIR}/lib/jy"
BIN_DIR="${INSTALL_DIR}/bin"
```

**Rationale:** Non-root users (95% case) get `$HOME/.local` by default so `curl ... | sh` just works. Root users keep `/usr/local`. Explicit `JY_INSTALL_DIR` always wins.

---

### Change 2: `install.sh` — Update header comment and error message

**Section:** Header comment (line 9) and `ensure_writable_dir` (lines 58–60)

OLD (header):
```sh
#   JY_INSTALL_DIR  — override install root (default: /usr/local); sets both lib and bin dirs
```

NEW (header):
```sh
#   JY_INSTALL_DIR  — override install root (default: $HOME/.local, or /usr/local for root); sets both lib and bin dirs
```

OLD (error message):
```sh
  if [ -z "${JY_INSTALL_DIR:-}" ] && [ "$INSTALL_DIR" = "/usr/local" ]; then
    err "Cannot write to ${target_dir}. Re-run with sudo or set JY_INSTALL_DIR=\$HOME/.local"
  fi
```

NEW (error message):
```sh
  if [ -z "${JY_INSTALL_DIR:-}" ]; then
    err "Cannot write to ${target_dir}. Re-run with sudo or use: curl ... | JY_INSTALL_DIR=<path> sh"
  fi
```

**Rationale:** Header reflects new default. Error guard simplified since non-root no longer defaults to `/usr/local`. Error message shows correct pipe syntax.

---

### Change 3: `README.md` — Fix install examples

**Section:** Installation — Standalone binary (lines 57–69)

OLD:
```markdown
You can customize the install location:

\```bash
JY_INSTALL_DIR=$HOME/.local curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
\```

Or install a specific version:

\```bash
JY_VERSION=v1.0.0 curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
\```
```

NEW:
```markdown
Installs to `$HOME/.local` by default (`/usr/local` when run as root). You can customize the install location:

\```bash
curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | JY_INSTALL_DIR=/opt/jy sh
\```

Or install a specific version:

\```bash
curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | JY_VERSION=v1.0.0 sh
\```
```

**Rationale:** Default `curl ... | sh` now just works. Added install path note. Fixed env var syntax (before `sh`, not before `curl`). Custom location example uses `/opt/jy` since `$HOME/.local` is already the default.

---

## 5. Implementation Handoff

**Change scope:** Minor — direct implementation by Developer agent.

**Implementation steps:**
1. Apply all 3 changes to `install.sh` and `README.md`
2. Test locally: `sh install.sh` as non-root user
3. Test locally: `sudo sh install.sh` (verify root still gets `/usr/local`)
4. Commit, push, and tag a patch release to update the hosted `install.sh`

**Success criteria:**
- `curl -fsSL ... | sh` succeeds for non-root macOS/Linux users without any env vars
- `curl -fsSL ... | JY_INSTALL_DIR=/custom/path sh` overrides correctly
- `sudo curl -fsSL ... | sh` installs to `/usr/local`
- README examples use correct pipe syntax
