import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import path from 'node:path'
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
})
