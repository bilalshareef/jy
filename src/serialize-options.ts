import type { SerializeOptions } from './converter.js'
import type { Format } from './format-detector.js'

export function getSerializeOptions(
  targetFormat: Format,
  indentSize?: number,
  indentStyle?: 'spaces' | 'tabs',
): SerializeOptions {
  if (targetFormat === 'json') {
    return {
      jsonIndent: indentStyle === 'tabs' ? '\t' : (indentSize ?? 2),
    }
  }

  return {
    yamlIndent: indentSize ?? 2,
  }
}
