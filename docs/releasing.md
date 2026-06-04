# Releasing

This document covers the release process for `@bilalshareef/jy`.

## How it works

Pushing a `v*` tag to GitHub triggers the [release workflow](../.github/workflows/release.yml), which:

1. Runs the full CI suite (lint, build, test)
2. Verifies the tag matches the version in `package.json`
3. Packs standalone tarballs for all 5 platforms (linux-x64, linux-arm64, darwin-x64, darwin-arm64, win32-x64)
4. Creates a GitHub Release with tarballs attached
5. Publishes `@bilalshareef/jy` to npm with `--access=public`

## Pre-release checklist

- [ ] All changes are committed and pushed to `main`
- [ ] CI is green on `main`
- [ ] `npm run build && npm test` passes locally
- [ ] `NPM_TOKEN` secret is configured in GitHub repo settings

## Release steps

### 1. Bump the version

```bash
npm version <major|minor|patch>
```

This updates `package.json`, commits the change, and creates a `v*` tag.

For example, to release `1.1.0`:

```bash
npm version minor
```

Or to set an explicit version:

```bash
npm version 1.2.0
```

### 2. Push the commit and tag

```bash
git push origin main
git push origin v<version>
```

For example:

```bash
git push origin main
git push origin v1.1.0
```

> **Note:** Do not rely on `git push --follow-tags` — it only pushes annotated tags. `npm version` creates lightweight tags, which `--follow-tags` silently skips.

### 3. Monitor the release workflow

Go to **Actions** → **Release** in the GitHub repo and watch the workflow run. It should complete all 4 jobs: CI → Pack → Release → Publish.

### 4. Verify

```bash
# Check npm
npm view @bilalshareef/jy version

# Test install
npm install -g @bilalshareef/jy
jy --version
```

Also verify the [GitHub Releases](https://github.com/bilalshareef/jy/releases) page shows the new release with all 5 tarballs.

## Fixing a failed release

If the release workflow fails at any stage, delete the tag and release, fix the issue, and re-release.

### 1. Delete the GitHub Release

Either via CLI:

```bash
gh release delete v<version> --yes
```

Or via the GitHub UI: go to `https://github.com/bilalshareef/jy/releases/tag/v<version>` → click the **⋯** menu (top right of the release) → **Delete release**.

### 2. Delete the tag (remote and local)

```bash
git push origin :refs/tags/v<version>
git tag -d v<version>
```

### 3. Fix and re-release

If code changes are needed:

```bash
git add -A && git commit -m "fix: <description>"
```

Then re-tag and push:

```bash
git tag v<version>
git push origin main
git push origin v<version>
```

## Unpublishing from npm

npm allows unpublishing within 72 hours of publish:

```bash
npm unpublish @bilalshareef/jy@<version>
```

After 72 hours, you can only deprecate:

```bash
npm deprecate @bilalshareef/jy@<version> "reason"
```
