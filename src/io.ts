import {readFile} from 'node:fs/promises'

import {EXIT_IO, JyError} from './errors.js'

export async function readInput(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new JyError(`File not found: ${filePath}`, EXIT_IO)
    }

    throw new JyError(`Cannot read file: ${filePath}`, EXIT_IO)
  }
}
