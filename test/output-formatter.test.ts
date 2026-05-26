import {expect} from 'chai'

import {formatOutput} from '../src/output-formatter.js'

describe('formatOutput', () => {
  it(String.raw`converts \n to \r\n when eol is crlf`, () => {
    const result = formatOutput('line1\nline2\nline3\n', {eol: 'crlf'})
    expect(result).to.equal('line1\r\nline2\r\nline3\r\n')
  })

  it('returns content unchanged when eol is lf', () => {
    const input = 'line1\nline2\n'
    expect(formatOutput(input, {eol: 'lf'})).to.equal(input)
  })

  it('returns content unchanged when eol is undefined', () => {
    const input = 'line1\nline2\n'
    expect(formatOutput(input, {})).to.equal(input)
  })

  it('returns content unchanged with default options', () => {
    const input = 'line1\nline2\n'
    expect(formatOutput(input, {})).to.equal(input)
  })

  it('applies eol crlf without changing content otherwise', () => {
    const input = '{\n  "key": "value"\n}\n'
    const result = formatOutput(input, {eol: 'crlf'})
    expect(result).to.equal('{\r\n  "key": "value"\r\n}\r\n')
  })

  it('handles empty string input', () => {
    expect(formatOutput('', {})).to.equal('')
    expect(formatOutput('', {eol: 'crlf'})).to.equal('')
  })

  it('does not alter already spaced indentation when only eol is default', () => {
    const input = 'root:\n  level1:\n    level2\n'
    expect(formatOutput(input, {eol: 'lf'})).to.equal(input)
  })
})
