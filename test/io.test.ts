import {expect} from 'chai'
import path from 'node:path'
import {Readable} from 'node:stream'
import {fileURLToPath} from 'node:url'

import {EXIT_IO, EXIT_PARSE} from '../src/errors.js'
import {readInput, readStdin} from '../src/io.js'

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
      expect(content).to.contain('name: jy')
    })

    it('throws JyError with EXIT_IO for file not found', async () => {
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
      Object.defineProperty(process, 'stdin', {value: originalStdin, writable: true})
    })

    it('reads valid content from stdin', async () => {
      const mockStdin = new Readable({
        read() {
          this.push('{"key": "value"}')
          this.push(null)
        },
      })
      Object.defineProperty(process, 'stdin', {value: mockStdin, writable: true})

      const content = await readStdin()
      expect(content).to.equal('{"key": "value"}')
    })

    it('throws JyError with EXIT_PARSE for empty stdin', async () => {
      const mockStdin = new Readable({
        read() {
          this.push('')
          this.push(null)
        },
      })
      Object.defineProperty(process, 'stdin', {value: mockStdin, writable: true})

      try {
        await readStdin()
        expect.fail('Expected readStdin to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_PARSE)
        expect(error).to.have.property('message', 'No input provided on stdin')
      }
    })
  })
})
