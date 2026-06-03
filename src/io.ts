// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { glob, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { Format } from './format-detector.js'

import { CjyError, EXIT_IO, EXIT_PARSE } from './errors.js'

export async function readInput(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8')
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new CjyError(`File not found: ${filePath}`, EXIT_IO)
    }

    throw new CjyError(`Cannot read file: ${filePath}`, EXIT_IO)
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
        reject(new CjyError('No input provided on stdin', EXIT_PARSE))
        return
      }

      resolve(content)
    })
    process.stdin.on('error', (err: Error) => {
      reject(new CjyError(`Cannot read from stdin: ${err.message}`, EXIT_IO))
    })
    process.stdin.resume()
  })
}

export async function writeOutput(
  outDir: string,
  originalFilePath: string,
  content: string,
  targetFormat: Format,
): Promise<void> {
  const baseName = path.basename(originalFilePath, path.extname(originalFilePath))
  const targetExt = targetFormat === 'json' ? '.json' : '.yaml'
  const outputPath = path.join(outDir, baseName + targetExt)

  try {
    await mkdir(outDir, { recursive: true })
    await writeFile(outputPath, content, 'utf8')
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new CjyError(`Cannot write to directory: ${outDir}: ${reason}`, EXIT_IO)
  }
}

function isGlobPattern(arg: string): boolean {
  return arg.includes('*') || arg.includes('?') || arg.includes('[')
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function isFile(filePath: string): Promise<boolean> {
  try {
    return (await stat(filePath)).isFile()
  } catch {
    return false
  }
}

export async function resolveFilePaths(args: string[]): Promise<string[]> {
  const results: string[] = []
  for (const arg of args) {
    // eslint-disable-next-line no-await-in-loop
    const useGlobExpansion = isGlobPattern(arg) && !(await pathExists(arg))

    if (useGlobExpansion) {
      const matches: string[] = []
      // eslint-disable-next-line no-await-in-loop
      for await (const entry of glob(arg)) {
        if (await isFile(entry)) {
          matches.push(entry)
        }
      }

      if (matches.length === 0) {
        throw new CjyError(`No files matched: ${arg}`, EXIT_IO)
      }

      matches.sort()
      results.push(...matches)
    } else {
      results.push(arg)
    }
  }

  return results
}
