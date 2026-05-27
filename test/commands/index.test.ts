import { runCommand } from '@oclif/test'
import { expect } from 'chai'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

describe('jy root command', () => {
  it('displays help with --help flag', async () => {
    const { stdout } = await runCommand(['--help'])
    expect(stdout).to.contain('Convert between JSON and YAML formats')
  })

  it('converts JSON file to YAML on stdout', async () => {
    const { stdout } = await runCommand([path.join(fixturesDir, 'simple.json')])
    expect(stdout).to.contain('name: jy')
    expect(stdout).to.contain('version: 1')
  })

  it('converts YAML file to JSON on stdout', async () => {
    const { stdout } = await runCommand([path.join(fixturesDir, 'simple.yaml')])
    const parsed = JSON.parse(stdout)
    expect(parsed).to.deep.equal({ name: 'jy', version: 1 })
  })

  it('converts .yml file to JSON on stdout', async () => {
    const { stdout } = await runCommand([path.join(fixturesDir, 'simple.yml')])
    const parsed = JSON.parse(stdout)
    expect(parsed).to.deep.equal({ name: 'jy', version: 1 })
  })

  it('exits with code 3 for nonexistent file', async () => {
    const { error, stderr } = await runCommand([path.join(fixturesDir, 'nonexistent.json')])
    expect(error?.oclif?.exit).to.equal(3)
    expect(stderr).to.contain('nonexistent.json')
  })

  it('exits with code 2 for malformed JSON file', async () => {
    const { error, stderr } = await runCommand([path.join(fixturesDir, 'malformed.json')])
    expect(error?.oclif?.exit).to.equal(2)
    expect(stderr).to.contain('malformed.json')
  })

  it('exits with code 4 for unrecognized extension', async () => {
    const { error, stderr } = await runCommand([
      path.join(fixturesDir, 'simple.json').replace('.json', '.txt'),
    ])
    expect(error?.oclif?.exit).to.equal(4)
    expect(stderr).to.contain('.txt')
  })

  it('exits with code 2 for malformed YAML file', async () => {
    const { error, stderr } = await runCommand([path.join(fixturesDir, 'malformed.yaml')])
    expect(error?.oclif?.exit).to.equal(2)
    expect(stderr).to.contain('malformed.yaml')
  })

  describe('multi-file conversion', () => {
    it('converts multiple JSON files to YAML with exactly one separator between outputs', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'nested.json'),
      ])
      expect(stdout.startsWith('---\n')).to.equal(false)
      expect(stdout.endsWith('---\n')).to.equal(false)
      expect(stdout.match(/---\n/g)).to.have.length(1)
      expect(stdout).to.contain('name: jy')
    })

    it('converts multiple YAML files to JSON with exactly one blank line between outputs', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'simple.yaml'),
        path.join(fixturesDir, 'simple.yml'),
      ])
      expect(stdout.startsWith('\n\n')).to.equal(false)
      expect(stdout.endsWith('\n\n')).to.equal(false)
      const parts = stdout.split('\n\n')
      expect(parts).to.have.length(2)
      const first = JSON.parse(parts[0])
      const second = JSON.parse(parts[1])
      expect(first).to.deep.equal({ name: 'jy', version: 1 })
      expect(second).to.deep.equal({ name: 'jy', version: 1 })
    })

    it('exits with code 4 for mixed-format file args', async () => {
      const { error, stderr } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'simple.yaml'),
      ])
      expect(error?.oclif?.exit).to.equal(4)
      expect(stderr).to.contain('Mixed input formats')
    })

    it('exits with code 2 on fail-fast for malformed second file', async () => {
      const { error, stderr } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'malformed.json'),
      ])
      expect(error?.oclif?.exit).to.equal(2)
      expect(stderr).to.contain('malformed.json')
    })

    it('expands glob pattern for JSON files', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-glob-'))
      writeFileSync(path.join(tmpDir, 'a.json'), '{"key": "alpha"}')
      writeFileSync(path.join(tmpDir, 'b.json'), '{"key": "beta"}')
      try {
        const { stdout } = await runCommand([path.join(tmpDir, '*.json')])
        expect(stdout).to.contain('---\n')
        expect(stdout).to.contain('key: alpha')
        expect(stdout).to.contain('key: beta')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('expands recursive glob patterns for JSON files', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-recursive-glob-'))
      const nestedDir = path.join(tmpDir, 'nested')
      writeFileSync(path.join(tmpDir, 'a.json'), '{"key": "alpha"}')
      writeFileSync(path.join(tmpDir, 'ignore.yaml'), 'key: ignored\n')
      mkdirSync(nestedDir)
      writeFileSync(path.join(nestedDir, 'b.json'), '{"key": "beta"}')

      try {
        const { stdout } = await runCommand([path.join(tmpDir, '**/*.json')])
        expect(stdout.match(/---\n/g)).to.have.length(1)
        expect(stdout).to.contain('key: alpha')
        expect(stdout).to.contain('key: beta')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('exits with code 3 for glob with no matches', async () => {
      const { error, stderr } = await runCommand(['nonexistent-dir-xyz/*.json'])
      expect(error?.oclif?.exit).to.equal(3)
      expect(stderr).to.contain('No files matched')
    })
  })

  describe('stdin mode (jy -)', () => {
    let originalStdin: typeof process.stdin

    beforeEach(() => {
      originalStdin = process.stdin
    })

    afterEach(() => {
      Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true })
    })

    function mockStdinWith(content: string) {
      const mockStdin = new Readable({
        read() {
          this.push(content)
          this.push(null)
        },
      })
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true })
    }

    it('converts JSON object from stdin to YAML', async () => {
      mockStdinWith('{"key": "value"}')
      const { stdout } = await runCommand(['-'])
      expect(stdout).to.contain('key: value')
    })

    it('converts JSON array from stdin to YAML', async () => {
      mockStdinWith('[1, 2, 3]')
      const { stdout } = await runCommand(['-'])
      expect(stdout).to.contain('- 1')
      expect(stdout).to.contain('- 2')
      expect(stdout).to.contain('- 3')
    })

    it('converts YAML from stdin to JSON', async () => {
      mockStdinWith('key: value\n')
      const { stdout } = await runCommand(['-'])
      const parsed = JSON.parse(stdout)
      expect(parsed).to.deep.equal({ key: 'value' })
    })

    it('exits with code 2 for malformed stdin content', async () => {
      mockStdinWith('not: [valid: content')
      const { error, stderr } = await runCommand(['-'])
      expect(error?.oclif?.exit).to.equal(2)
      expect(stderr).to.contain('stdin')
    })

    it('exits with non-zero code for empty stdin', async () => {
      mockStdinWith('')
      const { error, stderr } = await runCommand(['-'])
      expect(error?.oclif?.exit).to.be.greaterThan(0)
      expect(stderr).to.contain('stdin')
    })
  })

  describe('--out', () => {
    it('writes single JSON file as YAML to out dir with .yaml extension', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      const outDir = path.join(tmpDir, 'output')
      try {
        const { stdout } = await runCommand([
          path.join(fixturesDir, 'simple.json'),
          '--out',
          outDir,
        ])
        expect(stdout).to.equal('')
        const written = readFileSync(path.join(outDir, 'simple.yaml'), 'utf8')
        expect(written).to.contain('name: jy')
        expect(written).to.contain('version: 1')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('writes single YAML file as JSON to out dir with .json extension', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      const outDir = path.join(tmpDir, 'output')
      try {
        const { stdout } = await runCommand([
          path.join(fixturesDir, 'simple.yaml'),
          '--out',
          outDir,
        ])
        expect(stdout).to.equal('')
        const written = readFileSync(path.join(outDir, 'simple.json'), 'utf8')
        const parsed = JSON.parse(written)
        expect(parsed).to.deep.equal({ name: 'jy', version: 1 })
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('writes multiple JSON files to out dir', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      const outDir = path.join(tmpDir, 'output')
      try {
        const { stdout } = await runCommand([
          path.join(fixturesDir, 'simple.json'),
          path.join(fixturesDir, 'nested.json'),
          '--out',
          outDir,
        ])
        expect(stdout).to.equal('')
        const simple = readFileSync(path.join(outDir, 'simple.yaml'), 'utf8')
        expect(simple).to.contain('name: jy')
        const nested = readFileSync(path.join(outDir, 'nested.yaml'), 'utf8')
        expect(nested).to.contain('nested')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('creates output dir when it does not exist including nested path', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      const outDir = path.join(tmpDir, 'a', 'b', 'c')
      try {
        await runCommand([path.join(fixturesDir, 'simple.json'), '--out', outDir])
        const written = readFileSync(path.join(outDir, 'simple.yaml'), 'utf8')
        expect(written).to.contain('name: jy')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('writes nothing to stdout when --out is used', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      try {
        const { stdout } = await runCommand([
          path.join(fixturesDir, 'simple.json'),
          '--out',
          tmpDir,
        ])
        expect(stdout).to.equal('')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('exits with code 3 when output path cannot be created', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      const blockingFile = path.join(tmpDir, 'blocking-file')
      writeFileSync(blockingFile, 'not a directory')
      try {
        const { error, stderr } = await runCommand([
          path.join(fixturesDir, 'simple.json'),
          '--out',
          blockingFile,
        ])
        expect(error?.oclif?.exit).to.equal(3)
        expect(stderr).to.contain('Cannot write to directory')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('exits with code 3 when stdin is used with --out', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-outdir-'))
      const originalStdin = process.stdin
      const mockStdin = new Readable({
        read() {
          this.push('{"key": "value"}')
          this.push(null)
        },
      })
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true })
      try {
        const { error, stderr } = await runCommand(['-', '--out', tmpDir])
        expect(error?.oclif?.exit).to.equal(3)
        expect(stderr).to.contain('Cannot use --out with stdin input')
      } finally {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true })
        rmSync(tmpDir, { recursive: true })
      }
    })
  })

  describe('formatting flags', () => {
    it(String.raw`--eol crlf produces output with \r\n line endings (JSON→YAML)`, async () => {
      const { stdout } = await runCommand([path.join(fixturesDir, 'simple.json'), '--eol', 'crlf'])
      expect(stdout).to.contain('\r\n')
      expect(stdout).to.contain('name: jy')
    })

    it(String.raw`--eol lf produces output with \n line endings for YAML→JSON`, async () => {
      const { stdout } = await runCommand([path.join(fixturesDir, 'simple.yaml'), '--eol', 'lf'])
      expect(stdout).to.contain('"name": "jy"')
      expect(stdout).not.to.contain('\r\n')
    })

    it('--indent-size 4 produces 4-space indented output (JSON→YAML)', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'nested.json'),
        '--indent-size',
        '4',
      ])
      expect(stdout).to.contain('    deep:')
      expect(stdout).to.contain('        key: value')
    })

    it('--indent-style tabs produces tab-indented output (YAML→JSON)', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'nested.yaml'),
        '--indent-style',
        'tabs',
      ])
      expect(stdout).to.contain('\t"string"')
      expect(stdout).to.contain('\t\t"key"')
    })

    it('--indent-style tabs --indent-size 4 ignores indentSize and uses tabs', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'nested.yaml'),
        '--indent-style',
        'tabs',
        '--indent-size',
        '4',
      ])
      expect(stdout).to.contain('\t"string"')
      expect(stdout).to.contain('\t\t"key"')
      expect(stdout).not.to.match(/^ {4}"/m)
    })

    it('--indent-style tabs is ignored for JSON→YAML while indent-size still applies', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'nested.json'),
        '--indent-style',
        'tabs',
        '--indent-size',
        '4',
      ])
      expect(stdout).to.contain('    deep:')
      expect(stdout).not.to.contain('\t')
    })

    it('formatting flags with --out write formatted file', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-fmt-out-'))
      const outDir = path.join(tmpDir, 'output')
      try {
        await runCommand([
          path.join(fixturesDir, 'nested.json'),
          '--out',
          outDir,
          '--eol',
          'crlf',
          '--indent-size',
          '4',
        ])
        const written = readFileSync(path.join(outDir, 'nested.yaml'), 'utf8')
        expect(written).to.contain('\r\n')
        expect(written).to.contain('    deep:')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('formatting flags with multi-file conversion apply consistently', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'nested.json'),
        '--indent-size',
        '4',
      ])
      expect(stdout).to.contain('    deep:')
      expect(stdout).to.contain('        key: value')
    })

    it('formatting flags with multi-file conversion apply crlf to separators', async () => {
      const { stdout } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'nested.json'),
        '--eol',
        'crlf',
      ])
      expect(stdout).to.contain('---\r\n')
      expect(stdout).not.to.contain('---\n')
    })

    describe('formatting flags with stdin', () => {
      let originalStdin: typeof process.stdin

      beforeEach(() => {
        originalStdin = process.stdin
      })

      afterEach(() => {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true })
      })

      function mockStdinWith(content: string) {
        const mockStdin = new Readable({
          read() {
            this.push(content)
            this.push(null)
          },
        })
        Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true })
      }

      it('stdin with --indent-size 4 produces 4-space indented output', async () => {
        mockStdinWith('{"a":{"b":1}}')
        const { stdout } = await runCommand(['-', '--indent-size', '4'])
        expect(stdout).to.contain('    b: 1')
      })
    })
  })

  describe('--validate', () => {
    it('valid JSON file exits without error and produces no stdout', async () => {
      const { error, stdout } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        '--validate',
      ])
      expect(error).to.be.undefined
      expect(stdout).to.equal('')
    })

    it('valid YAML file exits without error and produces no stdout', async () => {
      const { error, stdout } = await runCommand([
        path.join(fixturesDir, 'simple.yaml'),
        '--validate',
      ])
      expect(error).to.be.undefined
      expect(stdout).to.equal('')
    })

    it('malformed JSON file exits with code 1 and stderr contains file path', async () => {
      const { error, stderr } = await runCommand([
        path.join(fixturesDir, 'malformed.json'),
        '--validate',
      ])
      expect(error?.oclif?.exit).to.equal(1)
      expect(stderr).to.contain('malformed.json')
      expect(stderr).to.match(/not valid JSON: .+/)
    })

    it('malformed YAML file exits with code 1 and stderr contains file path', async () => {
      const { error, stderr } = await runCommand([
        path.join(fixturesDir, 'malformed.yaml'),
        '--validate',
      ])
      expect(error?.oclif?.exit).to.equal(1)
      expect(stderr).to.contain('malformed.yaml')
    })

    it('multiple valid JSON files exit with code 0 and empty stdout', async () => {
      const { error, stdout } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'nested.json'),
        '--validate',
      ])
      expect(error).to.be.undefined
      expect(stdout).to.equal('')
    })

    it('multi-file with one malformed exits with code 1 (fail-fast)', async () => {
      const { error, stderr } = await runCommand([
        path.join(fixturesDir, 'simple.json'),
        path.join(fixturesDir, 'malformed.json'),
        '--validate',
      ])
      expect(error?.oclif?.exit).to.equal(1)
      expect(stderr).to.contain('malformed.json')
    })

    it('glob pattern with all valid files exits with code 0', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-validate-glob-'))
      writeFileSync(path.join(tmpDir, 'a.json'), '{"key": "alpha"}')
      writeFileSync(path.join(tmpDir, 'b.json'), '{"key": "beta"}')
      try {
        const { error, stdout } = await runCommand([path.join(tmpDir, '*.json'), '--validate'])
        expect(error).to.be.undefined
        expect(stdout).to.equal('')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    describe('stdin with --validate', () => {
      let originalStdin: typeof process.stdin

      beforeEach(() => {
        originalStdin = process.stdin
      })

      afterEach(() => {
        Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true })
      })

      function mockStdinWith(content: string) {
        const mockStdin = new Readable({
          read() {
            this.push(content)
            this.push(null)
          },
        })
        Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true })
      }

      it('valid JSON from stdin exits without error and produces no stdout', async () => {
        mockStdinWith('{"a": 1}')
        const { error, stdout } = await runCommand(['-', '--validate'])
        expect(error).to.be.undefined
        expect(stdout).to.equal('')
      })

      it('malformed content from stdin exits with code 1', async () => {
        mockStdinWith('not: [valid: content')
        const { error, stderr } = await runCommand(['-', '--validate'])
        expect(error?.oclif?.exit).to.equal(1)
        expect(stderr).to.contain('stdin')
      })

      it('empty stdin exits with code 1', async () => {
        mockStdinWith('')
        const { error, stderr } = await runCommand(['-', '--validate'])
        expect(error?.oclif?.exit).to.equal(1)
        expect(stderr).to.contain('No input provided on stdin')
      })
    })

    it('--validate combined with --out writes no files to output directory', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'jy-validate-out-'))
      const outDir = path.join(tmpDir, 'output')
      try {
        const { error, stdout } = await runCommand([
          path.join(fixturesDir, 'simple.json'),
          '--validate',
          '--out',
          outDir,
        ])
        expect(error).to.be.undefined
        expect(stdout).to.equal('')
        // outDir should not be created at all since validate produces no output
        expect(() => readFileSync(path.join(outDir, 'simple.yaml'), 'utf8')).to.throw()
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })
  })
})
