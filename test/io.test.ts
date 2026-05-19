import {expect} from 'chai'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {EXIT_IO} from '../src/errors.js'
import {readInput} from '../src/io.js'

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
})
