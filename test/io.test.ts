import { expect } from 'chai'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

import { EXIT_IO, EXIT_PARSE } from '../src/errors.js'
import { readInput, readStdin, resolveFilePaths, writeOutput } from '../src/io.js'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures')

describe('io', () => {
  describe('readInput', () => {
    it('reads an existing file successfully', async () => {
      const content = await readInput(path.join(fixturesDir, 'simple.json'))
      expect(content).to.be.a('string')
      expect(content).to.contain('"name"')
    })

    it('returns string content', async () => {
      const content = await readInput(path.join(fixturesDir, 'simple.yaml'))
      expect(content).to.be.a('string')
      expect(content).to.contain('name: cjy')
    })

    it('throws CjyError with EXIT_IO for file not found', async () => {
      try {
        await readInput(path.join(fixturesDir, 'nonexistent.json'))
        expect.fail('Expected readInput to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_IO)
      }
    })

    it('error message includes file path', async () => {
      const missingPath = path.join(fixturesDir, 'nonexistent.json')
      try {
        await readInput(missingPath)
        expect.fail('Expected readInput to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('message').that.includes('nonexistent.json')
      }
    })
  })

  describe('readStdin', () => {
    let originalStdin: typeof process.stdin

    beforeEach(() => {
      originalStdin = process.stdin
    })

    afterEach(() => {
      Object.defineProperty(process, 'stdin', { value: originalStdin, writable: true })
    })

    it('reads valid content from stdin', async () => {
      const mockStdin = new Readable({
        read() {
          this.push('{"key": "value"}')
          this.push(null)
        },
      })
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true })

      const content = await readStdin()
      expect(content).to.equal('{"key": "value"}')
    })

    it('throws CjyError with EXIT_PARSE for empty stdin', async () => {
      const mockStdin = new Readable({
        read() {
          this.push('')
          this.push(null)
        },
      })
      Object.defineProperty(process, 'stdin', { value: mockStdin, writable: true })

      try {
        await readStdin()
        expect.fail('Expected readStdin to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_PARSE)
        expect(error).to.have.property('message', 'No input provided on stdin')
      }
    })
  })

  describe('resolveFilePaths', () => {
    it('passes literal paths through unchanged', async () => {
      const input = [path.join(fixturesDir, 'simple.json')]
      const result = await resolveFilePaths(input)
      expect(result).to.deep.equal(input)
    })

    it('passes multiple literal paths through unchanged', async () => {
      const input = [path.join(fixturesDir, 'simple.json'), path.join(fixturesDir, 'nested.json')]
      const result = await resolveFilePaths(input)
      expect(result).to.deep.equal(input)
    })

    it('expands glob patterns matching test fixtures', async () => {
      const result = await resolveFilePaths([path.join(fixturesDir, '*.json')])
      expect(result.length).to.be.greaterThan(0)
      for (const p of result) {
        expect(p).to.match(/\.json$/)
      }
    })

    it('returns glob matches sorted alphabetically', async () => {
      const result = await resolveFilePaths([path.join(fixturesDir, '*.json')])
      const sorted = [...result].sort()
      expect(result).to.deep.equal(sorted)
    })

    it('throws CjyError with EXIT_IO for no-match glob', async () => {
      try {
        await resolveFilePaths(['nonexistent-dir-xyz/*.json'])
        expect.fail('Expected resolveFilePaths to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_IO)
        expect(error).to.have.property('message').that.includes('No files matched')
      }
    })

    it('mixes literal paths and glob expansions preserving order', async () => {
      const literal = path.join(fixturesDir, 'simple.json')
      const result = await resolveFilePaths([literal, path.join(fixturesDir, 'nested.*')])
      expect(result[0]).to.equal(literal)
      expect(result.length).to.be.greaterThan(1)
    })

    it('treats existing paths with glob metacharacters as literal files', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-literal-'))
      const literalPath = path.join(tmpDir, 'file[prod].json')
      writeFileSync(literalPath, '{"name":"cjy"}')

      try {
        const result = await resolveFilePaths([literalPath])
        expect(result).to.deep.equal([literalPath])
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('filters directories out of glob expansions', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-glob-files-'))
      const filePath = path.join(tmpDir, 'a.json')
      writeFileSync(filePath, '{"key":"value"}')
      mkdirSync(path.join(tmpDir, 'nested'))

      try {
        const result = await resolveFilePaths([path.join(tmpDir, '*')])
        expect(result).to.deep.equal([filePath])
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('expands recursive glob patterns', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-glob-recursive-'))
      const rootFile = path.join(tmpDir, 'root.json')
      const nestedDir = path.join(tmpDir, 'nested')
      const nestedFile = path.join(nestedDir, 'child.json')
      writeFileSync(rootFile, '{"root":true}')
      mkdirSync(nestedDir)
      writeFileSync(nestedFile, '{"child":true}')

      try {
        const result = await resolveFilePaths([path.join(tmpDir, '**/*.json')])
        expect(result).to.deep.equal([nestedFile, rootFile].sort())
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })
  })

  describe('writeOutput', () => {
    it('creates file with correct swapped filename in existing directory', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-writeout-'))
      try {
        await writeOutput(tmpDir, 'config.json', 'name: cjy\n', 'yaml')
        const written = readFileSync(path.join(tmpDir, 'config.yaml'), 'utf8')
        expect(written).to.equal('name: cjy\n')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('creates directory including intermediates if it does not exist', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-writeout-'))
      const nestedOut = path.join(tmpDir, 'a', 'b', 'c')
      try {
        await writeOutput(nestedOut, 'data.yaml', '{"key":"value"}\n', 'json')
        const written = readFileSync(path.join(nestedOut, 'data.json'), 'utf8')
        expect(written).to.equal('{"key":"value"}\n')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('throws CjyError with EXIT_IO when output path cannot be created', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-writeout-'))
      const blockingFile = path.join(tmpDir, 'blocking-file')
      writeFileSync(blockingFile, 'not a directory')
      try {
        await writeOutput(blockingFile, 'data.json', 'name: cjy\n', 'yaml')
        expect.fail('Expected writeOutput to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_IO)
        expect(error).to.have.property('message').that.includes('Cannot write to directory')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('swaps .json to .yaml', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-writeout-'))
      try {
        await writeOutput(tmpDir, 'file.json', 'content\n', 'yaml')
        expect(readFileSync(path.join(tmpDir, 'file.yaml'), 'utf8')).to.equal('content\n')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('swaps .yaml to .json', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-writeout-'))
      try {
        await writeOutput(tmpDir, 'file.yaml', 'content\n', 'json')
        expect(readFileSync(path.join(tmpDir, 'file.json'), 'utf8')).to.equal('content\n')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })

    it('swaps .yml to .json', async () => {
      const tmpDir = mkdtempSync(path.join(tmpdir(), 'cjy-writeout-'))
      try {
        await writeOutput(tmpDir, 'file.yml', 'content\n', 'json')
        expect(readFileSync(path.join(tmpDir, 'file.json'), 'utf8')).to.equal('content\n')
      } finally {
        rmSync(tmpDir, { recursive: true })
      }
    })
  })
})
