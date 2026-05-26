export interface FormatOptions {
  eol?: 'crlf' | 'lf'
}

export function formatOutput(content: string, options: FormatOptions): string {
  if (options.eol === 'crlf') {
    // Conversion runs after parse/serialize, and serializers emit LF line endings.
    // This step only rewrites those normalized LF separators to the requested output EOL.
    return content.replaceAll('\n', '\r\n')
  }

  return content
}
