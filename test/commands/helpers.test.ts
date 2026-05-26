import {expect} from 'chai'
import {Readable} from 'node:stream'

import {readValidateStdin} from '../../src/commands/helpers.js'
import {EXIT_IO, EXIT_VALIDATION} from '../../src/errors.js'

describe('commands helpers', () => {
  describe('readValidateStdin', () => {
    let originalStdin: typeof process.stdin

    beforeEach(() => {
      originalStdin = process.stdin
    })

    afterEach(() => {
      Object.defineProperty(process, 'stdin', {value: originalStdin, writable: true})
    })

    function mockStdinWith(content: string) {
      const mockStdin = new Readable({
        read() {
          this.push(content)
          this.push(null)
        },
      })

      Object.defineProperty(process, 'stdin', {value: mockStdin, writable: true})
    }

    it('returns stdin content when input is present', async () => {
      mockStdinWith('{"name":"jy"}')

      const content = await readValidateStdin()

      expect(content).to.equal('{"name":"jy"}')
    })

    it('remaps empty stdin from EXIT_PARSE to EXIT_VALIDATION', async () => {
      mockStdinWith('')

      try {
        await readValidateStdin()
        expect.fail('Expected readValidateStdin to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_VALIDATION)
        expect(error).to.have.property('message', 'No input provided on stdin')
      }
    })

    it('passes through non-parse stdin errors unchanged', async () => {
      const mockStdin = new Readable({
        read() {
          this.destroy(new Error('broken pipe'))
        },
      })
      Object.defineProperty(process, 'stdin', {value: mockStdin, writable: true})

      try {
        await readValidateStdin()
        expect.fail('Expected readValidateStdin to throw')
      } catch (error: unknown) {
        expect(error).to.have.property('code', EXIT_IO)
        expect(error).to.have.property('message', 'Cannot read from stdin: broken pipe')
      }
    })
  })
})