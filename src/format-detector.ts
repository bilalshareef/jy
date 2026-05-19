import path from 'node:path'

import {EXIT_AMBIGUOUS, JyError} from './errors.js'

export type Format = 'json' | 'yaml'

export function detectFormatFromExtension(filePath: string): Format {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case '.json': {
      return 'json'
    }

    case '.yaml':
    case '.yml': {
      return 'yaml'
    }

    default: {
      throw new JyError(`Unsupported file extension: ${filePath}`, EXIT_AMBIGUOUS)
    }
  }
}

export function getTargetFormat(sourceFormat: Format): Format {
  return sourceFormat === 'json' ? 'yaml' : 'json'
}
