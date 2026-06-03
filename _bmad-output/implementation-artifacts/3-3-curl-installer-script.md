# Story 3.3: Curl Installer Script

Status: done

## Story

As a **developer**,
I want **to install cjy with a single curl command that auto-detects my OS and architecture**,
so that **I can get cjy running in seconds without npm or manual binary downloads**.

## Acceptance Criteria

1. **Given** a Linux x64 machine, **when** the user runs `curl -fsSL https://raw.githubusercontent.com/bilalshareef/cjy/main/install.sh | sh`, **then** the script detects Linux x64 via `uname -s` and `uname -m`, downloads the correct tarball from GitHub Releases, extracts the binary to `/usr/local/bin` (or a user-specified location), and `cjy --help` works immediately

2. **Given** a Linux arm64 machine, **when** the user runs the install command, **then** the script detects arm64/aarch64 architecture and downloads the linux-arm64 tarball

3. **Given** a macOS Intel machine, **when** the user runs the install command, **then** the script detects Darwin x86_64 and downloads the darwin-x64 tarball

4. **Given** a macOS Apple Silicon machine, **when** the user runs the install command, **then** the script detects Darwin arm64 and downloads the darwin-arm64 tarball

5. **Given** a Windows machine, **when** the user attempts to run the curl installer, **then** the script prints a message directing the user to install via npm (`npm install -g cjy`) or download the binary directly from GitHub Releases

6. **Given** an unsupported OS or architecture, **when** the user runs the install command, **then** the script exits with a clear error message listing supported platforms

7. **Given** a GitHub Release with no tarball for the detected platform, **when** the download step fails, **then** the script exits with a clear error message and does not leave partial files behind

8. **Given** the installed binary, **when** the user runs `cjy --help` after installation, **then** the command executes successfully, confirming the binary is correctly placed and executable

## Tasks / Subtasks

- [x] Task 1: Create `install.sh` in the project root (AC: #1, #2, #3, #4, #5, #6)
  - [x] 1.1 Add POSIX-compatible shebang (`#!/bin/sh`) and `set -eu` for strict error handling
  - [x] 1.2 Define configurable constants: `REPO` (`bilalshareef/cjy`), `INSTALL_DIR` (default `/usr/local/lib/cjy`), `BIN_DIR` (default `/usr/local/bin`), and `TMPDIR` fallback
  - [x] 1.3 Implement OS detection via `uname -s` → map `Linux` → `linux`, `Darwin` → `darwin`; exit with error on Windows (`MINGW*`, `MSYS*`, `CYGWIN*`) or any other unknown OS
  - [x] 1.4 Implement architecture detection via `uname -m` → map `x86_64`/`amd64` → `x64`, `arm64`/`aarch64` → `arm64`; exit with error on unsupported architectures
  - [x] 1.5 Implement version resolution: accept `CJY_VERSION` environment variable or call GitHub API (`https://api.github.com/repos/{REPO}/releases/latest`) to discover the latest release tag; parse `tag_name` from JSON response using `grep`/`sed` (no `jq` dependency)
  - [x] 1.6 Construct the download URL by finding the correct asset: query the release assets and match the asset name containing the detected `{os}-{arch}` platform string; extract `browser_download_url` from the API response
  - [x] 1.7 Implement download using `curl -fsSL` with fallback to `wget -qO-` if curl is unavailable
  - [x] 1.8 Extract tarball to `INSTALL_DIR` (create with `mkdir -p`), create symlink from `BIN_DIR/cjy` → `INSTALL_DIR/cjy/bin/cjy`
  - [x] 1.9 Add cleanup logic: remove tarball from temp directory on success or failure (`trap` cleanup on EXIT)
  - [x] 1.10 Print success message with installed version and path, or print actionable error message on failure
  - [x] 1.11 Support `CJY_INSTALL_DIR` environment variable to override install location (both lib and bin directories)

- [x] Task 2: Handle download failure and partial file cleanup (AC: #7)
  - [x] 2.1 Verify download succeeded (check HTTP status / file size > 0) before extracting
  - [x] 2.2 On any failure during download or extraction, remove temporary files and partially extracted directories via the EXIT trap
  - [x] 2.3 Verify the extracted binary exists and is executable before creating symlinks

- [x] Task 3: Post-install verification (AC: #8)
  - [x] 3.1 After installation, run `cjy --help` (or `cjy --version` if available) to verify the binary works
  - [x] 3.2 Print clear success or failure message based on verification result

- [x] Task 4: Script testing and validation (AC: #1-#8)
  - [x] 4.1 Manually test the script on macOS (the dev machine) — verify OS/arch detection, download, extraction, and symlink creation work end-to-end
  - [x] 4.2 Test with `CJY_INSTALL_DIR` override to verify custom install locations work
  - [x] 4.3 Test error paths: invalid OS string, invalid arch, network failure simulation (wrong URL), missing `curl`/`wget`
  - [x] 4.4 Verify the script is POSIX-compliant (no bashisms) using `shellcheck install.sh` if available

### Review Findings

- [x] [Review][Patch] Replace non-portable `trap ... EXIT` usage with a POSIX-compatible exit trap [install.sh:73]
- [x] [Review][Patch] Clean up partially extracted files when extraction aborts before binary verification [install.sh:54]
- [x] [Review][Patch] Avoid in-place extraction into the live install directory so failed upgrades cannot leave stale files or delete a working install [install.sh:179]
- [x] [Review][Patch] Detect unwritable default install paths and print the required `sudo` / `CJY_INSTALL_DIR=$HOME/.local` guidance instead of failing with raw filesystem errors [install.sh:147]
- [x] [Review][Defer] Standalone release entrypoint requires `bash` on minimal Linux images, so installer success still depends on a pre-existing packaging constraint [tmp/linux-x64/cjy/bin/cjy:1] — deferred, pre-existing

## Dev Notes

### Critical: Tarball Naming and Download Strategy

The oclif-produced tarballs follow this naming convention:
```
cjy-v{VERSION}-{GIT_SHA}-{OS}-{ARCH}.tar.gz
```

**Examples from the current build:**
- `cjy-v0.0.0-8b03846-linux-x64.tar.gz`
- `cjy-v0.0.0-8b03846-darwin-arm64.tar.gz`

**The git SHA in the filename makes direct URL construction impossible.** The installer MUST use the GitHub Releases API to find the correct asset URL. The approach:

1. Query `https://api.github.com/repos/bilalshareef/cjy/releases/latest` (or a specific tag via `https://api.github.com/repos/bilalshareef/cjy/releases/tags/v{VERSION}`)
2. Parse the JSON response to find the asset whose `name` contains the target platform string (e.g., `darwin-arm64`)
3. Extract the `browser_download_url` for that asset
4. Download via the extracted URL

**GitHub Release asset download URL pattern:**
```
https://github.com/bilalshareef/cjy/releases/download/v{VERSION}/{ASSET_NAME}
```

### Critical: Tarball Internal Structure

The tarball extracts to a `cjy/` directory containing a complete oclif standalone application:

```
cjy/
├── bin/
│   ├── cjy          # Shell script entry point (resolves symlinks, finds bundled node)
│   ├── cjy.cmd      # Windows entry point
│   ├── node         # Bundled Node.js binary for the target platform
│   ├── run          # oclif production run script (referenced by bin/cjy)
│   ├── run.js       # Node.js production entry point
│   └── dev.js       # Development entry point (not needed in production)
├── lib/             # Compiled TypeScript output
├── node_modules/    # Bundled dependencies
├── package.json
├── package-lock.json
├── oclif.manifest.json
├── LICENSE
└── README.md
```

**Key insight:** The `bin/cjy` script uses `get_script_dir` to resolve the real directory when called via symlink. This means the installer can safely:
1. Extract the whole `cjy/` directory to a lib location (e.g., `/usr/local/lib/cjy`)
2. Create a symlink: `/usr/local/bin/cjy` → `/usr/local/lib/cjy/bin/cjy`

The `bin/cjy` script will follow the symlink back to its real directory and find `bin/node`, `bin/run`, `lib/`, etc. relative to itself.

### Critical: No jq Dependency

The installer script MUST NOT depend on `jq` — it's not available on most systems by default. Parse the GitHub API JSON response using `grep`, `sed`, or `awk` — all POSIX-standard tools.

**Pattern for extracting the download URL without jq:**
```sh
# Find the asset URL matching the platform
download_url=$(echo "$release_json" | grep -o '"browser_download_url": *"[^"]*'"$os-$arch"'[^"]*"' | head -1 | sed 's/.*"browser_download_url": *"//;s/"//')
```

**Pattern for extracting tag_name without jq:**
```sh
tag=$(echo "$release_json" | grep -o '"tag_name": *"[^"]*"' | head -1 | sed 's/.*"tag_name": *"//;s/"//')
```

### Critical: POSIX Compatibility

The script MUST be POSIX `/bin/sh` compatible — NOT bash-specific. This ensures it works on:
- Alpine Linux (ash/busybox)
- Debian/Ubuntu minimal images (dash)
- macOS (zsh as default, but `/bin/sh` is available)
- Any CI Docker container

**Forbidden constructs:**
- `[[ ]]` — use `[ ]` instead
- `$( )` is POSIX-safe, backticks also work
- Arrays — not available in POSIX sh
- `local` — technically not POSIX but widely supported; acceptable
- `function` keyword — use `fname() {` syntax
- `source` — use `.` instead
- String comparison with `==` — use `=` in `[ ]`

### Installation Directory Strategy

**Default layout (no root required if user has write access):**
```
/usr/local/lib/cjy/     ← full extracted tarball content
/usr/local/bin/cjy      ← symlink to /usr/local/lib/cjy/bin/cjy
```

**Custom install with `CJY_INSTALL_DIR`:**
```
$CJY_INSTALL_DIR/lib/cjy/    ← full extracted tarball content
$CJY_INSTALL_DIR/bin/cjy     ← symlink
```

If writing to `/usr/local/` requires root, the script should detect this and either:
- Suggest `sudo` usage: `curl -fsSL ... | sudo sh`
- Or suggest setting `CJY_INSTALL_DIR=$HOME/.local`

**Do NOT auto-escalate privileges** — never auto-run `sudo` inside the script.

### Windows Detection

Windows Git Bash / MSYS2 / Cygwin will report `uname -s` as `MINGW64_NT-*`, `MSYS_NT-*`, or `CYGWIN_NT-*`. The script should detect these and print a helpful message:

```
Error: The curl installer does not support Windows.
Install cjy using one of these methods:
  npm install -g cjy
  Or download the binary from: https://github.com/bilalshareef/cjy/releases
```

### Error Messages

All error messages must be written to stderr. Use a consistent error function:
```sh
err() {
  echo "Error: $*" >&2
  exit 1
}
```

### Cleanup Strategy

Use a trap to clean up temporary files on any exit:
```sh
tmpdir=""
cleanup() {
  if [ -n "$tmpdir" ] && [ -d "$tmpdir" ]; then
    rm -rf "$tmpdir"
  fi
}
trap cleanup EXIT
```

This ensures no partial downloads or extracted files are left behind, even if the script is interrupted (Ctrl+C sends SIGINT, which triggers EXIT trap).

### Previous Story Intelligence

**From Story 3.2 (Binary Packaging & Release Pipeline):**
- Release workflow at `.github/workflows/release.yml` triggers on `v*` tags
- Tarballs are uploaded to GitHub Releases via `softprops/action-gh-release@v2`
- All 5 tarballs are attached as release assets: `dist/*.tar.gz`
- Repository URL: `https://github.com/bilalshareef/cjy`
- `@oclif/plugin-plugins` was removed in Story 3.2 — no plugin system to worry about
- Pack uses Node.js 22.16.0 as bundled runtime

**From Story 3.1 (CI Pipeline & npm Package):**
- `package.json` has `bin.cjy` → `bin/run.js` for npm installations
- Repository: `bilalshareef/cjy` (also in `package.json` repository field)

### Git Intelligence

- Branch: `develop` (all work done here)
- Last 3 commits:
  - `feat: implement story 3.2 - binary packaging release pipeline`
  - `feat: create story 3.2 - binary packaging release pipeline`
  - `feat: create implement 3.1 - ci pipeline npm package configuration`
- Commit pattern: `feat: implement story X.Y - description`

### Reference Installer Pattern

Here is a reference implementation skeleton for the installer script:

```sh
#!/bin/sh
set -eu

REPO="bilalshareef/cjy"
GITHUB_API="https://api.github.com/repos/${REPO}"

# --- Helper functions ---

err() { echo "Error: $*" >&2; exit 1; }
info() { echo "  $*"; }

# --- OS/Arch detection ---

detect_platform() {
  os=$(uname -s)
  arch=$(uname -m)

  case "$os" in
    Linux)  os="linux" ;;
    Darwin) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "Error: The curl installer does not support Windows." >&2
      echo "Install cjy using one of these methods:" >&2
      echo "  npm install -g cjy" >&2
      echo "  Or download from: https://github.com/${REPO}/releases" >&2
      exit 1 ;;
    *) err "Unsupported operating system: $os. Supported: Linux, macOS" ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *) err "Unsupported architecture: $arch. Supported: x86_64, arm64" ;;
  esac
}

# --- Version resolution ---

resolve_version() {
  if [ -n "${CJY_VERSION:-}" ]; then
    version="$CJY_VERSION"
  else
    # Query GitHub API for latest release tag
    release_info=$(download_url_stdout "${GITHUB_API}/releases/latest")
    version=$(echo "$release_info" | grep -o '"tag_name": *"[^"]*"' | head -1 | sed 's/.*"//;s/"//')
    [ -n "$version" ] || err "Failed to determine latest version from GitHub API"
  fi
}

# --- Download helper ---

download_url_stdout() {
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL "$1"
  elif command -v wget > /dev/null 2>&1; then
    wget -qO- "$1"
  else
    err "curl or wget is required"
  fi
}

download_url_file() {
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL -o "$2" "$1"
  elif command -v wget > /dev/null 2>&1; then
    wget -q -O "$2" "$1"
  else
    err "curl or wget is required"
  fi
}
```

**The dev agent should use this as a starting point but must implement the complete script — this is not copy-paste-ready.**

### What This Story Does NOT Include

- No Windows `.exe` installer or PowerShell install script
- No auto-update mechanism (no `@oclif/plugin-update`)
- No signature verification or checksum validation of downloaded tarballs (could be added as a follow-up if needed)
- No uninstall script (manual removal: `rm /usr/local/bin/cjy && rm -rf /usr/local/lib/cjy`)
- No shell completion installation — deferred to Phase 2
- No CI test for the installer script — manual testing only for this story
- No changes to existing source code — this story creates one new file (`install.sh`) only

### Project Structure Notes

Files to create (NEW):
- `install.sh` — project root, curl installer script

Files to update (UPDATE):
- None — no existing files are modified by this story

The `install.sh` is listed in the architecture document's project directory structure at the root level.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md — Distribution Strategy section]
- [Source: _bmad-output/planning-artifacts/architecture.md — Project Directory Structure — `install.sh` at root]
- [Source: _bmad-output/planning-artifacts/epics.md — Story 3.3 acceptance criteria]
- [Source: _bmad-output/planning-artifacts/prd.md — FR25, FR26, FR28]
- [Source: _bmad-output/implementation-artifacts/3-2-binary-packaging-release-pipeline.md — tarball naming, release workflow details]
- [Source: .github/workflows/release.yml — GitHub Release asset upload via softprops/action-gh-release]
- [Source: dist/*.tar.gz — actual tarball naming: cjy-v0.0.0-8b03846-{platform}.tar.gz]
- [Source: tmp/darwin-arm64/cjy/bin/cjy — oclif binary entry point, symlink resolution via get_script_dir]
- [Source: GitHub API docs — releases endpoint, asset browser_download_url field]

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6 (GitHub Copilot)

### Debug Log References
None — no halts or blockers during implementation.

### Completion Notes List
- Created `install.sh` (160 lines) as a fully POSIX-compatible (`/bin/sh`) installer script
- Platform detection: Linux/macOS via `uname -s`, x64/arm64 via `uname -m`, Windows detection (MINGW/MSYS/CYGWIN) with helpful fallback message
- Version resolution: `CJY_VERSION` env var override or GitHub API latest release auto-discovery; JSON parsed with grep/sed (no jq dependency)
- Asset resolution: queries GitHub Releases API, matches `browser_download_url` by `{os}-{arch}` platform string to handle git-SHA-containing filenames
- Download: `curl -fsSL` with `wget -qO-` fallback; downloads to temp dir, verifies non-empty before extraction
- Install layout: extracts to `INSTALL_DIR/lib/cjy/`, symlinks `INSTALL_DIR/bin/cjy` → lib binary; `CJY_INSTALL_DIR` env var overrides default `/usr/local`
- Cleanup: EXIT trap removes temp directory on success or failure; partial extraction cleaned on binary verification failure
- Post-install: runs `cjy --help` to verify binary works; prints clear success/failure message
- Testing: end-to-end tested on macOS arm64 with mock HTTP server; verified CJY_VERSION override, CJY_INSTALL_DIR override, network failure, missing platform asset, and cleanup behavior
- shellcheck 0.11.0 passes with zero warnings
- Full project test suite (134 tests), lint, and prettier all pass — no regressions

### Change Log
- 2026-06-02: Created install.sh — curl installer script for cjy binary distribution (Story 3.3)

### File List
- install.sh (NEW) — POSIX-compatible curl installer script
