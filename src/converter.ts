import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'

import type { Format } from './format-detector.js'

import { EXIT_PARSE, EXIT_VALIDATION, JyError } from './errors.js'
import { getTargetFormat } from './format-detector.js'

export interface SerializeOptions {
  jsonIndent?: number | string
  yamlIndent?: number
}

export function convert(
  content: string,
  sourceFormat: Format,
  filePath: string,
  options: SerializeOptions = {},
): string {
  const data = parseContent(content, sourceFormat, filePath)
  return serialize(data, getTargetFormat(sourceFormat), options)
}

export function validate(content: string, sourceFormat: Format, filePath: string): void {
  try {
    parseContent(content, sourceFormat, filePath)
  } catch (error) {
    if (error instanceof JyError) {
      throw new JyError(error.message, EXIT_VALIDATION)
    }

    throw error
  }
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
    const detail = error instanceof Error ? error.message : String(error)
    throw new JyError(`Parse error: ${filePath} is not valid ${formatLabel}: ${detail}`, EXIT_PARSE)
  }
}

function serialize(data: unknown, format: Format, options: SerializeOptions): string {
  if (format === 'json') {
    return JSON.stringify(data, null, options.jsonIndent ?? 2) + '\n'
  }

  return stringifyYaml(data, {
    indent: options.yamlIndent ?? 2,
    lineWidth: 0,
  })
}
