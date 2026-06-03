import path from 'node:path'

import { CjyError, EXIT_AMBIGUOUS } from './errors.js'

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
      throw new CjyError(`Unsupported file extension: ${filePath}`, EXIT_AMBIGUOUS)
    }
  }
}

export function detectFormatFromContent(content: string): Format {
  const trimmed = content.trimStart()
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json'
  }

  return 'yaml'
}

export function getTargetFormat(sourceFormat: Format): Format {
  return sourceFormat === 'json' ? 'yaml' : 'json'
}

export function detectFormatFromPaths(filePaths: string[]): Format {
  const formats = filePaths.map((p) => detectFormatFromExtension(p))
  const first = formats[0]
  for (const f of formats) {
    if (f !== first) {
      throw new CjyError(
        'Mixed input formats: cannot convert files with both .json and .yaml/.yml extensions',
        EXIT_AMBIGUOUS,
      )
    }
  }

  return first
}
