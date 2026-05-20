import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import path from 'node:path'
import {Readable} from 'node:stream'
import {fileURLToPath} from 'node:url'

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures')

describe('jy root command', () => {
  it('displays help with --help flag', async () => {
    const {stdout} = await runCommand(['--help'])
    expect(stdout).to.contain('Convert between JSON and YAML formats')
  })

  it('converts JSON file to YAML on stdout', async () => {
    const {stdout} = await runCommand([path.join(fixturesDir, 'simple.json')])
    expect(stdout).to.contain('name: jy')
    expect(stdout).to.contain('version: 1')
  })

  it('converts YAML file to JSON on stdout', async () => {
    const {stdout} = await runCommand([path.join(fixturesDir, 'simple.yaml')])
    const parsed = JSON.parse(stdout)
    expect(parsed).to.deep.equal({name: 'jy', version: 1})
  })

  it('converts .yml file to JSON on stdout', async () => {
    const {stdout} = await runCommand([path.join(fixturesDir, 'simple.yml')])
    const parsed = JSON.parse(stdout)
    expect(parsed).to.deep.equal({name: 'jy', version: 1})
  })

  it('exits with code 3 for nonexistent file', async () => {
    const {error, stderr} = await runCommand([path.join(fixturesDir, 'nonexistent.json')])
    expect(error?.oclif?.exit).to.equal(3)
    expect(stderr).to.contain('nonexistent.json')
  })

  it('exits with code 2 for malformed JSON file', async () => {
    const {error, stderr} = await runCommand([path.join(fixturesDir, 'malformed.json')])
    expect(error?.oclif?.exit).to.equal(2)
    expect(stderr).to.contain('malformed.json')
  })

  it('exits with code 4 for unrecognized extension', async () => {
    const {error, stderr} = await runCommand([path.join(fixturesDir, 'simple.json').replace('.json', '.txt')])
    expect(error?.oclif?.exit).to.equal(4)
    expect(stderr).to.contain('.txt')
  })

  it('exits with code 2 for malformed YAML file', async () => {
    const {error, stderr} = await runCommand([path.join(fixturesDir, 'malformed.yaml')])
    expect(error?.oclif?.exit).to.equal(2)
    expect(stderr).to.contain('malformed.yaml')
  })

  describe('stdin mode (jy -)', () => {
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

    it('converts JSON object from stdin to YAML', async () => {
      mockStdinWith('{"key": "value"}')
      const {stdout} = await runCommand(['-'])
      expect(stdout).to.contain('key: value')
    })

    it('converts JSON array from stdin to YAML', async () => {
      mockStdinWith('[1, 2, 3]')
      const {stdout} = await runCommand(['-'])
      expect(stdout).to.contain('- 1')
      expect(stdout).to.contain('- 2')
      expect(stdout).to.contain('- 3')
    })

    it('converts YAML from stdin to JSON', async () => {
      mockStdinWith('key: value\n')
      const {stdout} = await runCommand(['-'])
      const parsed = JSON.parse(stdout)
      expect(parsed).to.deep.equal({key: 'value'})
    })

    it('exits with code 2 for malformed stdin content', async () => {
      mockStdinWith('not: [valid: content')
      const {error, stderr} = await runCommand(['-'])
      expect(error?.oclif?.exit).to.equal(2)
      expect(stderr).to.contain('stdin')
    })

    it('exits with non-zero code for empty stdin', async () => {
      mockStdinWith('')
      const {error, stderr} = await runCommand(['-'])
      expect(error?.oclif?.exit).to.be.greaterThan(0)
      expect(stderr).to.contain('stdin')
    })
  })
})
