import {expect} from 'chai'

import {EXIT_AMBIGUOUS} from '../src/errors.js'
import {detectFormatFromContent, detectFormatFromExtension, detectFormatFromPaths, getTargetFormat} from '../src/format-detector.js'

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

  describe('detectFormatFromContent', () => {
    it('detects content starting with { as json', () => {
      expect(detectFormatFromContent('{"key": "value"}')).to.equal('json')
    })

    it('detects content starting with [ as json', () => {
      expect(detectFormatFromContent('[1, 2, 3]')).to.equal('json')
    })

    it('detects content starting with { preceded by whitespace as json', () => {
      expect(detectFormatFromContent('  \n  {"key": "value"}')).to.equal('json')
    })

    it('detects YAML key-value content as yaml', () => {
      expect(detectFormatFromContent('key: value')).to.equal('yaml')
    })

    it('detects YAML list content as yaml', () => {
      expect(detectFormatFromContent('- item')).to.equal('yaml')
    })

    it('detects numeric content as yaml', () => {
      expect(detectFormatFromContent('42')).to.equal('yaml')
    })

    it('detects quoted string content as yaml', () => {
      expect(detectFormatFromContent('"hello"')).to.equal('yaml')
    })
  })

  describe('detectFormatFromPaths', () => {
    it('returns json for all-JSON paths', () => {
      expect(detectFormatFromPaths(['a.json', 'b.json'])).to.equal('json')
    })

    it('returns yaml for all-YAML paths', () => {
      expect(detectFormatFromPaths(['a.yaml', 'b.yml'])).to.equal('yaml')
    })

    it('returns json for a single JSON path', () => {
      expect(detectFormatFromPaths(['config.json'])).to.equal('json')
    })

    it('throws EXIT_AMBIGUOUS for mixed .json and .yaml paths', () => {
      expect(() => detectFormatFromPaths(['data.json', 'config.yaml']))
        .to.throw()
        .with.property('code', EXIT_AMBIGUOUS)
    })

    it('throws EXIT_AMBIGUOUS for mixed .json and .yml paths', () => {
      expect(() => detectFormatFromPaths(['data.json', 'config.yml']))
        .to.throw()
        .with.property('code', EXIT_AMBIGUOUS)
    })

    it('error message mentions mixed formats', () => {
      expect(() => detectFormatFromPaths(['a.json', 'b.yaml']))
        .to.throw(/Mixed input formats/)
    })
  })
})
