#!/bin/sh
set -eu

# jy installer — downloads and installs pre-built jy binaries from GitHub Releases.
# Usage: curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
#
# Environment variables:
#   JY_VERSION      — install a specific version (e.g. "v1.0.0"); defaults to latest
#   JY_INSTALL_DIR  — override install root (default: /usr/local); sets both lib and bin dirs

REPO="bilalshareef/jy"
GITHUB_API="https://api.github.com/repos/${REPO}"

# Defaults (overridable via JY_INSTALL_DIR)
INSTALL_DIR="${JY_INSTALL_DIR:-/usr/local}"
LIB_DIR="${INSTALL_DIR}/lib/jy"
BIN_DIR="${INSTALL_DIR}/bin"

# Temp directory for downloads — cleaned up on exit
tmpdir=""
staged_lib_dir=""
restore_backup_on_fail="0"
backup_lib_dir=""

# ── Helpers ──────────────────────────────────────────────────────────────────

err() {
  echo "Error: $*" >&2
  exit 1
}

info() {
  echo "  $*"
}

nearest_existing_dir() {
  probe_dir=$1

  while [ ! -e "$probe_dir" ]; do
    next_probe_dir=$(dirname "$probe_dir")
    if [ "$next_probe_dir" = "$probe_dir" ]; then
      break
    fi
    probe_dir=$next_probe_dir
  done

  printf '%s\n' "$probe_dir"
}

ensure_writable_dir() {
  target_dir=$1
  existing_dir=$(nearest_existing_dir "$target_dir")

  if [ -d "$existing_dir" ] && [ -w "$existing_dir" ]; then
    return 0
  fi

  if [ -z "${JY_INSTALL_DIR:-}" ] && [ "$INSTALL_DIR" = "/usr/local" ]; then
    err "Cannot write to ${target_dir}. Re-run with sudo or set JY_INSTALL_DIR=\$HOME/.local"
  fi

  err "Cannot write to ${target_dir}. Check permissions or set JY_INSTALL_DIR to a writable location"
}

cleanup() {
  if [ "$restore_backup_on_fail" = "1" ] && [ -n "$backup_lib_dir" ] && [ -d "$backup_lib_dir" ]; then
    if [ -d "$LIB_DIR" ]; then
      rm -rf "$LIB_DIR"
    fi
    mv "$backup_lib_dir" "$LIB_DIR"
  elif [ -n "$backup_lib_dir" ] && [ -d "$backup_lib_dir" ]; then
    rm -rf "$backup_lib_dir"
  fi

  if [ -n "$staged_lib_dir" ] && [ -d "$staged_lib_dir" ]; then
    rm -rf "$staged_lib_dir"
  fi

  if [ -n "$tmpdir" ] && [ -d "$tmpdir" ]; then
    rm -rf "$tmpdir"
  fi
}

on_exit() {
  exit_code=$?
  trap - 0 1 2 3 15
  cleanup
  exit "$exit_code"
}

on_signal() {
  signal_code=$1
  trap - 0 1 2 3 15
  cleanup
  exit "$signal_code"
}

trap 'on_exit' 0
trap 'on_signal 1' 1
trap 'on_signal 2' 2
trap 'on_signal 3' 3
trap 'on_signal 15' 15

# ── Download helpers ─────────────────────────────────────────────────────────

# Print response body to stdout
fetch() {
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL "$1"
  elif command -v wget > /dev/null 2>&1; then
    wget -qO- "$1"
  else
    err "curl or wget is required to download jy"
  fi
}

# Download URL to a file
download() {
  if command -v curl > /dev/null 2>&1; then
    curl -fsSL -o "$2" "$1"
  elif command -v wget > /dev/null 2>&1; then
    wget -q -O "$2" "$1"
  else
    err "curl or wget is required to download jy"
  fi
}

# ── Platform detection ───────────────────────────────────────────────────────

detect_platform() {
  os=$(uname -s)
  arch=$(uname -m)

  case "$os" in
    Linux)  os="linux" ;;
    Darwin) os="darwin" ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "Error: The curl installer does not support Windows." >&2
      echo "Install jy using one of these methods:" >&2
      echo "  npm install -g jy" >&2
      echo "  Or download from: https://github.com/${REPO}/releases" >&2
      exit 1
      ;;
    *)
      err "Unsupported operating system: $os. Supported: Linux, macOS"
      ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      err "Unsupported architecture: $arch. Supported: x86_64/amd64, arm64/aarch64"
      ;;
  esac
}

# ── Version resolution ───────────────────────────────────────────────────────

resolve_version() {
  if [ -n "${JY_VERSION:-}" ]; then
    version="$JY_VERSION"
    # Ensure version starts with 'v'
    case "$version" in
      v*) ;;
      *)  version="v${version}" ;;
    esac
    return
  fi

  info "Fetching latest release info..."
  release_json=$(fetch "${GITHUB_API}/releases/latest") \
    || err "Failed to fetch release information from GitHub API"

  version=$(echo "$release_json" | grep -o '"tag_name": *"[^"]*"' | head -1 | sed 's/.*"tag_name": *"//;s/"//')

  if [ -z "$version" ]; then
    err "Failed to determine latest version from GitHub API"
  fi
}

# ── Asset URL resolution ─────────────────────────────────────────────────────

resolve_download_url() {
  platform="${os}-${arch}"

  if [ -n "${JY_VERSION:-}" ]; then
    # Fetch specific release
    release_json=$(fetch "${GITHUB_API}/releases/tags/${version}") \
      || err "Failed to fetch release ${version} from GitHub API"
  fi
  # If JY_VERSION was not set, release_json is already populated from resolve_version

  download_url=$(echo "$release_json" | grep -o '"browser_download_url": *"[^"]*'"${platform}"'[^"]*\.tar\.gz"' | head -1 | sed 's/.*"browser_download_url": *"//;s/"//')

  if [ -z "$download_url" ]; then
    err "No release asset found for platform ${platform} in release ${version}.
Supported platforms: linux-x64, linux-arm64, darwin-x64, darwin-arm64"
  fi
}

# ── Install ──────────────────────────────────────────────────────────────────

install() {
  tmpdir=$(mktemp -d 2>/dev/null || mktemp -d -t 'jy-install')
  tarball="${tmpdir}/jy.tar.gz"
  install_parent=$(dirname "$LIB_DIR")

  ensure_writable_dir "$install_parent"
  ensure_writable_dir "$BIN_DIR"

  if [ -e "$LIB_DIR" ] && [ ! -d "$LIB_DIR" ]; then
    err "Install path ${LIB_DIR} exists and is not a directory"
  fi

  if [ -e "${BIN_DIR}/jy" ] && [ ! -L "${BIN_DIR}/jy" ] && [ ! -f "${BIN_DIR}/jy" ]; then
    err "Cannot create symlink at ${BIN_DIR}/jy because a non-file entry already exists there"
  fi

  staged_lib_dir="${install_parent}/.jy-install.$$"

  info "Downloading jy ${version} for ${os}-${arch}..."
  download "$download_url" "$tarball"

  # Verify the download produced a non-empty file
  if [ ! -s "$tarball" ]; then
    err "Download failed — file is empty. URL: ${download_url}"
  fi

  info "Extracting to staging directory ${staged_lib_dir}..."
  mkdir -p "$install_parent"
  rm -rf "$staged_lib_dir"
  mkdir -p "$staged_lib_dir"
  tar xzf "$tarball" -C "$staged_lib_dir" --strip-components=1

  # Verify the extracted binary exists and is executable
  if [ ! -x "${staged_lib_dir}/bin/jy" ]; then
    err "Extraction failed — binary not found at ${staged_lib_dir}/bin/jy"
  fi

  info "Installing to ${LIB_DIR}..."
  if [ -d "$LIB_DIR" ]; then
    backup_lib_dir="${install_parent}/.jy-backup.$$"
    rm -rf "$backup_lib_dir"
    mv "$LIB_DIR" "$backup_lib_dir"
    restore_backup_on_fail="1"
  fi

  mv "$staged_lib_dir" "$LIB_DIR"
  staged_lib_dir=""

  info "Creating symlink ${BIN_DIR}/jy -> ${LIB_DIR}/bin/jy..."
  mkdir -p "$BIN_DIR"
  ln -sf "${LIB_DIR}/bin/jy" "${BIN_DIR}/jy"

  restore_backup_on_fail="0"
  if [ -n "$backup_lib_dir" ] && [ -d "$backup_lib_dir" ]; then
    rm -rf "$backup_lib_dir"
  fi
  backup_lib_dir=""
}

# ── Post-install verification ────────────────────────────────────────────────

verify() {
  if [ -x "${BIN_DIR}/jy" ] && "${BIN_DIR}/jy" --help > /dev/null 2>&1; then
    return 0
  fi
  return 1
}

# ── Main ─────────────────────────────────────────────────────────────────────

main() {
  echo "jy installer"
  echo ""

  detect_platform
  resolve_version
  resolve_download_url
  install

  echo ""
  if verify; then
    echo "✓ jy ${version} installed successfully!"
    info "Binary:  ${BIN_DIR}/jy"
    info "Library: ${LIB_DIR}"
    case ":$PATH:" in
      *":${BIN_DIR}:"*) ;;
      *) echo ""; info "Note: ${BIN_DIR} is not in your PATH. Add it with:"; info "  export PATH=\"${BIN_DIR}:\$PATH\"" ;;
    esac
  else
    echo "⚠ jy was installed but verification failed." >&2
    info "The binary is at ${BIN_DIR}/jy but 'jy --help' did not succeed." >&2
    info "You may need to add ${BIN_DIR} to your PATH." >&2
    exit 1
  fi
}

main
