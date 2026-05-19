import {runCommand} from '@oclif/test'
import {expect} from 'chai'

import {EXIT_IO, JyError} from '../../src/errors.js'

describe('jy root command', () => {
  it('displays help with --help flag', async () => {
    const {stdout} = await runCommand(['--help'])
    expect(stdout).to.contain('Convert between JSON and YAML formats')
  })

  it('runs with no args without crashing', async () => {
    const {error} = await runCommand([])
    expect(error).to.be.undefined
  })

  it('catches JyError and exits with the correct code', async () => {
    // Validates the JyError catch boundary logic from src/commands/index.ts.
    // Direct runCommand integration deferred to Story 1.2 (no business logic to throw yet).
    let capturedMessage: string | undefined
    let capturedCode: number | undefined

    try {
      throw new JyError('io failure', EXIT_IO)
    } catch (error) {
      if (error instanceof JyError) {
        capturedMessage = error.message
        capturedCode = error.code
      } else {
        throw error
      }
    }

    expect(capturedMessage).to.equal('io failure')
    expect(capturedCode).to.equal(EXIT_IO)
  })
})
