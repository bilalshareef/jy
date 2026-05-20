import {readFile} from 'node:fs/promises'

import {EXIT_IO, EXIT_PARSE, JyError} from './errors.js'

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

export async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = []
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk: string) => chunks.push(chunk))
    process.stdin.on('end', () => {
      const content = chunks.join('')
      if (content.trim().length === 0) {
        reject(new JyError('No input provided on stdin', EXIT_PARSE))
        return
      }

      resolve(content)
    })
    process.stdin.on('error', (err: Error) => {
      reject(new JyError(`Cannot read from stdin: ${err.message}`, EXIT_IO))
    })
    process.stdin.resume()
  })
}
