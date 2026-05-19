import {parse as parseYaml, stringify as stringifyYaml} from 'yaml'

import type {Format} from './format-detector.js'

import {EXIT_PARSE, JyError} from './errors.js'
import {getTargetFormat} from './format-detector.js'

export function convert(content: string, sourceFormat: Format, filePath: string): string {
  const data = parseContent(content, sourceFormat, filePath)
  return serialize(data, getTargetFormat(sourceFormat))
}

function parseContent(content: string, format: Format, filePath: string): unknown {
  try {
    if (format === 'json') {
      return JSON.parse(content)
    }

    const parsed = parseYaml(content)
    if (parsed === null) {
      throw new JyError(`Parse error: ${filePath} is an empty document`, EXIT_PARSE)
    }

    return parsed
  } catch (error) {
    if (error instanceof JyError) throw error
    const formatLabel = format === 'json' ? 'JSON' : 'YAML'
    throw new JyError(`Parse error: ${filePath} is not valid ${formatLabel}`, EXIT_PARSE)
  }
}

function serialize(data: unknown, format: Format): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2) + '\n'
  }

  return stringifyYaml(data, {lineWidth: 0})
}
