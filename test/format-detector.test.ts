import {expect} from 'chai'

import {EXIT_AMBIGUOUS} from '../src/errors.js'
import {detectFormatFromExtension, getTargetFormat} from '../src/format-detector.js'

describe('format-detector', () => {
  describe('detectFormatFromExtension', () => {
    it('detects .json as json', () => {
      expect(detectFormatFromExtension('config.json')).to.equal('json')
    })

    it('detects .yaml as yaml', () => {
      expect(detectFormatFromExtension('config.yaml')).to.equal('yaml')
    })

    it('detects .yml as yaml', () => {
      expect(detectFormatFromExtension('config.yml')).to.equal('yaml')
    })

    it('is case insensitive for .JSON', () => {
      expect(detectFormatFromExtension('config.JSON')).to.equal('json')
    })

    it('is case insensitive for .YAML', () => {
      expect(detectFormatFromExtension('config.YAML')).to.equal('yaml')
    })

    it('works with directory paths', () => {
      expect(detectFormatFromExtension('path/to/file.json')).to.equal('json')
    })

    it('throws JyError with EXIT_AMBIGUOUS for .txt', () => {
      expect(() => detectFormatFromExtension('data.txt')).to.throw().with.property('code', EXIT_AMBIGUOUS)
    })

    it('throws JyError with EXIT_AMBIGUOUS for .xml', () => {
      expect(() => detectFormatFromExtension('data.xml')).to.throw().with.property('code', EXIT_AMBIGUOUS)
    })

    it('throws JyError with EXIT_AMBIGUOUS for no extension', () => {
      expect(() => detectFormatFromExtension('Makefile')).to.throw().with.property('code', EXIT_AMBIGUOUS)
    })

    it('includes file path in error message', () => {
      expect(() => detectFormatFromExtension('data.txt')).to.throw(/data\.txt/)
    })
  })

  describe('getTargetFormat', () => {
    it('returns yaml for json input', () => {
      expect(getTargetFormat('json')).to.equal('yaml')
    })

    it('returns json for yaml input', () => {
      expect(getTargetFormat('yaml')).to.equal('json')
    })
  })
})
