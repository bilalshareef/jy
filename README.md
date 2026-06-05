<p align="center">
  <h1 align="center">jy</h1>
  <p align="center">
    Convert between JSON and YAML — fast, correct, zero config.
  </p>
</p>

<p align="center">
  <a href="https://github.com/bilalshareef/jy/actions"><img src="https://github.com/bilalshareef/jy/workflows/CI/badge.svg" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@bilalshareef/jy"><img src="https://img.shields.io/npm/v/@bilalshareef/jy.svg" alt="npm version"></a>
  <a href="https://github.com/bilalshareef/jy/releases"><img src="https://img.shields.io/github/v/release/bilalshareef/jy" alt="GitHub release"></a>
  <a href="https://www.npmjs.com/package/@bilalshareef/jy"><img src="https://img.shields.io/npm/dm/@bilalshareef/jy.svg" alt="npm downloads"></a>
  <a href="https://github.com/bilalshareef/jy/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@bilalshareef/jy.svg" alt="license"></a>
  <img src="https://img.shields.io/node/v/@bilalshareef/jy.svg" alt="node version">
</p>

---

`jy` is a cross-platform CLI tool that converts between JSON and YAML with zero configuration and zero runtime dependencies. It ships as a single binary — no Node.js, no package manager, no setup.

```bash
# That's it. JSON in, YAML out.
jy config.json > config.yaml

# Or the other way around.
jy deployment.yaml > deployment.json
```

## Why jy?

Tools like [`yq`](https://github.com/mikefarah/yq) and [`jq`](https://github.com/jqlang/jq) are powerful, but they're overbuilt for the most common use case: *"convert this file to the other format."* They come with query languages, transformation pipelines, and dozens of flags you'll never use for a simple format conversion.

`jy` applies the Unix philosophy — **do one thing well** — to JSON ↔ YAML conversion. No query language, no transformation pipelines, no schema validation. Just `jy file.json` → YAML out. The value is in what it *doesn't* do.

- **Zero friction** — install and convert your first file in under 60 seconds
- **Zero config** — no `.jyrc`, no environment variables, no config files
- **Zero dependencies** — standalone binary, no runtime required
- **CI-ready** — deterministic exit codes, stdout/stderr separation, script-safe defaults

## Installation

### npm

```bash
npm install -g @bilalshareef/jy
```

Works on any platform supported by Node.js (requires Node.js >= 22).

### Standalone binary

Prebuilt binaries are available for common platforms — no Node.js required.

**Linux / macOS:**

```bash
curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
```

Installs to `$HOME/.local` by default (`/usr/local` when run as root). You can customize the install location:

```bash
curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | JY_INSTALL_DIR=/opt/jy sh
```

Or install a specific version:

```bash
curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | JY_VERSION=v1.0.0 sh
```

**Windows:**

Download the latest `.tar.gz` for `win32-x64` from the [Releases](https://github.com/bilalshareef/jy/releases) page and extract it to a directory on your `PATH`.

**Supported platforms (standalone binary):**

| Platform | Architecture |
|---|---|
| Linux | x64, arm64 |
| macOS | Intel (x64), Apple Silicon (arm64) |
| Windows | x64 |

### Updating

**npm:**

```bash
npm update -g @bilalshareef/jy
```

**Standalone binary:**

Re-run the install command — it safely replaces the existing installation:

```bash
curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
```

## Usage

### Basic conversion

```bash
# JSON → YAML (format detected from extension)
jy config.json

# YAML → JSON
jy config.yaml
```

Output goes to stdout by default. Redirect to a file:

```bash
jy config.json > config.yaml
```

### stdin / stdout

Use `-` to read from stdin. The format is auto-detected (`{` or `[` → JSON, otherwise YAML):

```bash
cat config.json | jy -
echo '{"key": "value"}' | jy -
curl -s https://api.example.com/data | jy - > data.yaml
```

### Multiple files

Convert multiple files at once using file paths or glob patterns:

```bash
jy src/config.json src/settings.json
jy src/**/*.json
```

### Output directory

Write converted files to a directory with `--out`. Filenames are preserved with the extension swapped:

```bash
jy src/**/*.json --out dist/
# src/a.json → dist/a.yaml
# src/b.json → dist/b.yaml
```

### Validation

Check if files are valid JSON or YAML without producing output:

```bash
jy config.json --validate
jy src/**/*.yaml --validate
```

### Formatting options

Control the output format:

```bash
# Set indentation (default: 2 spaces)
jy config.yaml --indent-size 4

# Use tabs (JSON output only — YAML always uses spaces)
jy config.yaml --indent-style tabs

# Set line endings
jy config.json --eol crlf
```

## Exit codes

`jy` uses deterministic exit codes for reliable scripting and CI integration:

| Code | Meaning | Example |
|---|---|---|
| `0` | Success | All files converted |
| `1` | Validation error | `--validate` found invalid input |
| `2` | Parse error | Input file is malformed |
| `3` | I/O error | File not found, permission denied |
| `4` | Ambiguous format | Mixed JSON and YAML files in one invocation |

## CI/CD integration

`jy` is designed to be a reliable building block in CI/CD pipelines.

### GitHub Actions

```yaml
jobs:
  convert:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install jy
        run: curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
      - name: Convert configs
        run: jy src/**/*.json --out dist/
```

### GitLab CI

```yaml
convert:
  image: node:22-alpine
  before_script:
    - npm install -g @bilalshareef/jy
  script:
    - jy src/**/*.json --out dist/
```

### Docker

```dockerfile
RUN curl -fsSL https://raw.githubusercontent.com/bilalshareef/jy/main/install.sh | sh
```

### Shell scripts

```bash
#!/bin/bash
set -euo pipefail

# Convert and fail the pipeline on malformed input
jy configs/*.yaml --out build/

# Validate before deploying
jy k8s/*.yaml --validate || { echo "Invalid YAML in k8s configs"; exit 1; }
```

All output goes to stdout (pipeable), all errors to stderr (separable), and exit codes are deterministic — no special handling required.

## Flags reference

| Flag | Values | Default | Description |
|---|---|---|---|
| `--out <dir>` | directory path | — | Write converted files to a directory |
| `--validate` | — | — | Validate input without converting |
| `--eol` | `lf`, `crlf` | `lf` | Line ending style |
| `--indent-style` | `spaces`, `tabs` | `spaces` | Indentation style (JSON output only) |
| `--indent-size` | positive integer | `2` | Indentation width (ignored with `--indent-style=tabs`) |

## Uninstalling

**npm:**

```bash
npm uninstall -g @bilalshareef/jy
```

**Standalone binary (default install):**

```bash
rm -rf ~/.local/lib/jy
rm -f ~/.local/bin/jy
```

**Standalone binary (root/sudo install):**

```bash
sudo rm -rf /usr/local/lib/jy
sudo rm -f /usr/local/bin/jy
```

**Standalone binary (custom `JY_INSTALL_DIR`):**

```bash
rm -rf <JY_INSTALL_DIR>/lib/jy
rm -f <JY_INSTALL_DIR>/bin/jy
```

## Requirements

- **Standalone binary:** No dependencies — works out of the box
- **npm install:** Node.js >= 22.0.0

## Contributing

```bash
git clone https://github.com/bilalshareef/jy.git
cd jy
npm install
npm run build
npm test
```

During development, use `bin/dev.js` for hot-reloading without manual compilation:

```bash
./bin/dev.js config.json
```

## License

[MIT](LICENSE) © Mohammed Bilal Shareef
