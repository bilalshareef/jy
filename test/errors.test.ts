import { expect } from 'chai'

import {
  CjyError,
  EXIT_AMBIGUOUS,
  EXIT_IO,
  EXIT_PARSE,
  EXIT_SUCCESS,
  EXIT_VALIDATION,
} from '../src/errors.js'

describe('errors module', () => {
  describe('exit code constants', () => {
    it('EXIT_SUCCESS is 0', () => {
      expect(EXIT_SUCCESS).to.equal(0)
    })

    it('EXIT_VALIDATION is 1', () => {
      expect(EXIT_VALIDATION).to.equal(1)
    })

    it('EXIT_PARSE is 2', () => {
      expect(EXIT_PARSE).to.equal(2)
    })

    it('EXIT_IO is 3', () => {
      expect(EXIT_IO).to.equal(3)
    })

    it('EXIT_AMBIGUOUS is 4', () => {
      expect(EXIT_AMBIGUOUS).to.equal(4)
    })
  })

  describe('CjyError', () => {
    it('extends Error', () => {
      const error = new CjyError('test message', EXIT_VALIDATION)
      expect(error).to.be.instanceOf(Error)
    })

    it('has name set to CjyError', () => {
      const error = new CjyError('test message', EXIT_PARSE)
      expect(error.name).to.equal('CjyError')
    })

    it('stores the message', () => {
      const error = new CjyError('something went wrong', EXIT_IO)
      expect(error.message).to.equal('something went wrong')
    })

    it('stores the exit code', () => {
      const error = new CjyError('ambiguous format', EXIT_AMBIGUOUS)
      expect(error.code).to.equal(EXIT_AMBIGUOUS)
    })

    it('code property exists and holds the assigned value', () => {
      const error = new CjyError('test', EXIT_VALIDATION)
      expect(error.code).to.equal(EXIT_VALIDATION)
    })
  })
})
