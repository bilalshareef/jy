import { expect } from 'chai'

import { convert, validate } from '../src/converter.js'
import { EXIT_PARSE, EXIT_VALIDATION } from '../src/errors.js'

describe('converter', () => {
  describe('JSON to YAML', () => {
    it('converts simple JSON to valid YAML', () => {
      const json = '{"name": "cjy", "version": 1}'
      const result = convert(json, 'json', 'test.json')
      expect(result).to.contain('name: cjy')
      expect(result).to.contain('version: 1')
    })

    it('uses serializer indent size for YAML output', () => {
      const json = '{"outer":{"inner":1}}'
      const result = convert(json, 'json', 'test.json', { yamlIndent: 4 })
      expect(result).to.contain('    inner: 1')
    })

    it('preserves multiline scalar content when YAML indent size changes', () => {
      const original = { text: 'line1\n  line2\nline3' }
      const yaml = convert(JSON.stringify(original), 'json', 'test.json', { yamlIndent: 4 })
      const backToJson = convert(yaml, 'yaml', 'test.yaml')
      expect(JSON.parse(backToJson)).to.deep.equal(original)
    })

    it('output ends with newline', () => {
      const json = '{"key": "value"}'
      const result = convert(json, 'json', 'test.json')
      expect(result).to.match(/\n$/)
    })
  })

  describe('YAML to JSON', () => {
    it('converts simple YAML to valid JSON', () => {
      const yaml = 'name: cjy\nversion: 1\n'
      const result = convert(yaml, 'yaml', 'test.yaml')
      const parsed = JSON.parse(result)
      expect(parsed).to.deep.equal({ name: 'cjy', version: 1 })
    })

    it('uses serializer indent size for JSON output', () => {
      const yaml = 'outer:\n  inner: 1\n'
      const result = convert(yaml, 'yaml', 'test.yaml', { jsonIndent: 4 })
      expect(result).to.contain('    "inner": 1')
    })

    it('uses serializer tab indentation for JSON output', () => {
      const yaml = 'outer:\n  inner: 1\n'
      const result = convert(yaml, 'yaml', 'test.yaml', { jsonIndent: '\t' })
      expect(result).to.contain('\t"inner": 1')
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
        nested: { deep: { key: 'value' } },
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
        obj: { nested: 'value' },
        str: 'hello',
      }
      const json = JSON.stringify(data)
      const yaml = convert(json, 'json', 'test.json')
      const backToJson = convert(yaml, 'yaml', 'test.yaml')
      expect(JSON.parse(backToJson)).to.deep.equal(data)
    })
  })

  describe('error handling', () => {
    it('throws CjyError with EXIT_PARSE for malformed JSON', () => {
      expect(() => convert('{invalid', 'json', 'bad.json'))
        .to.throw()
        .with.property('code', EXIT_PARSE)
    })

    it('throws CjyError with EXIT_PARSE for malformed YAML', () => {
      expect(() => convert('key: [broken: yaml', 'yaml', 'bad.yaml'))
        .to.throw()
        .with.property('code', EXIT_PARSE)
    })

    it('error message includes file path for JSON parse error', () => {
      expect(() => convert('{invalid', 'json', 'config.json')).to.throw(/config\.json/)
    })

    it('error message includes file path for YAML parse error', () => {
      expect(() => convert('key: [broken: yaml', 'yaml', 'config.yaml')).to.throw(/config\.yaml/)
    })

    it('throws CjyError with EXIT_PARSE including file path for empty YAML document', () => {
      expect(() => convert('', 'yaml', 'empty.yaml'))
        .to.throw(/empty\.yaml/)
        .with.property('code', EXIT_PARSE)
    })
  })

  describe('validate', () => {
    it('returns without throwing for valid JSON content', () => {
      expect(() => validate('{"name": "cjy", "version": 1}', 'json', 'test.json')).to.not.throw()
    })

    it('returns without throwing for valid YAML content', () => {
      expect(() => validate('name: cjy\nversion: 1\n', 'yaml', 'test.yaml')).to.not.throw()
    })

    it('throws CjyError with EXIT_VALIDATION for malformed JSON', () => {
      expect(() => validate('{invalid', 'json', 'bad.json'))
        .to.throw()
        .with.property('code', EXIT_VALIDATION)
    })

    it('throws CjyError with EXIT_VALIDATION for malformed YAML', () => {
      expect(() => validate('key: [broken: yaml', 'yaml', 'bad.yaml'))
        .to.throw()
        .with.property('code', EXIT_VALIDATION)
    })

    it('throws CjyError with EXIT_VALIDATION for empty YAML document', () => {
      expect(() => validate('', 'yaml', 'empty.yaml'))
        .to.throw()
        .with.property('code', EXIT_VALIDATION)
    })
  })
})
