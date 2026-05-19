import {expect} from 'chai'

import {convert} from '../src/converter.js'
import {EXIT_PARSE} from '../src/errors.js'

describe('converter', () => {
  describe('JSON to YAML', () => {
    it('converts simple JSON to valid YAML', () => {
      const json = '{"name": "jy", "version": 1}'
      const result = convert(json, 'json', 'test.json')
      expect(result).to.contain('name: jy')
      expect(result).to.contain('version: 1')
    })

    it('output ends with newline', () => {
      const json = '{"key": "value"}'
      const result = convert(json, 'json', 'test.json')
      expect(result).to.match(/\n$/)
    })
  })

  describe('YAML to JSON', () => {
    it('converts simple YAML to valid JSON', () => {
      const yaml = 'name: jy\nversion: 1\n'
      const result = convert(yaml, 'yaml', 'test.yaml')
      const parsed = JSON.parse(result)
      expect(parsed).to.deep.equal({name: 'jy', version: 1})
    })

    it('output ends with newline', () => {
      const yaml = 'key: value\n'
      const result = convert(yaml, 'yaml', 'test.yaml')
      expect(result).to.match(/\n$/)
    })
  })

  describe('round-trip fidelity', () => {
    it('JSON → YAML → JSON produces identical structure', () => {
      const original = {
        array: [1, 'two', false],
        boolean: true,
        float: 3.14,
        nested: {deep: {key: 'value'}},
        nullValue: null,
        number: 42,
        string: 'hello',
      }
      const json = JSON.stringify(original)
      const yaml = convert(json, 'json', 'test.json')
      const backToJson = convert(yaml, 'yaml', 'test.yaml')
      const result = JSON.parse(backToJson)
      expect(result).to.deep.equal(original)
    })

    it('all JSON data types survive conversion', () => {
      const data = {
        arr: [1, 'two', false],
        bool: true,
        flt: 3.14,
        nil: null,
        num: 42,
        obj: {nested: 'value'},
        str: 'hello',
      }
      const json = JSON.stringify(data)
      const yaml = convert(json, 'json', 'test.json')
      const backToJson = convert(yaml, 'yaml', 'test.yaml')
      expect(JSON.parse(backToJson)).to.deep.equal(data)
    })
  })

  describe('error handling', () => {
    it('throws JyError with EXIT_PARSE for malformed JSON', () => {
      expect(() => convert('{invalid', 'json', 'bad.json')).to.throw().with.property('code', EXIT_PARSE)
    })

    it('throws JyError with EXIT_PARSE for malformed YAML', () => {
      expect(() => convert('key: [broken: yaml', 'yaml', 'bad.yaml')).to.throw().with.property('code', EXIT_PARSE)
    })

    it('error message includes file path for JSON parse error', () => {
      expect(() => convert('{invalid', 'json', 'config.json')).to.throw(/config\.json/)
    })

    it('error message includes file path for YAML parse error', () => {
      expect(() => convert('key: [broken: yaml', 'yaml', 'config.yaml')).to.throw(/config\.yaml/)
    })

    it('throws JyError with EXIT_PARSE including file path for empty YAML document', () => {
      expect(() => convert('', 'yaml', 'empty.yaml')).to.throw(/empty\.yaml/).with.property('code', EXIT_PARSE)
    })
  })
})
