import { Args, Command, Flags } from '@oclif/core'

import type { FormatOptions } from '../output-formatter.js'

import { convert, validate } from '../converter.js'
import { CjyError, EXIT_IO } from '../errors.js'
import {
  detectFormatFromContent,
  detectFormatFromPaths,
  getTargetFormat,
} from '../format-detector.js'
import { readInput, readStdin, resolveFilePaths, writeOutput } from '../io.js'
import { formatOutput } from '../output-formatter.js'
import { getSerializeOptions } from '../serialize-options.js'
import { readValidateStdin } from './helpers.js'

interface ParsedFlags {
  fileArgs: string[]
  formatOptions: FormatOptions
  indentSize: number | undefined
  indentStyle: 'spaces' | 'tabs' | undefined
  outDir: string | undefined
}

export default class Index extends Command {
  static override args = {
    file: Args.string({ description: 'File(s) to convert (or - for stdin)', required: true }),
  }
  static override description = 'Convert between JSON and YAML formats'
  static override flags = {
    eol: Flags.string({ description: 'Line ending style (lf or crlf)', options: ['lf', 'crlf'] }),
    'indent-size': Flags.integer({
      description:
        'Number of spaces for indentation (default: 2). Ignored when --indent-style=tabs for JSON output.',
      min: 1,
    }),
    'indent-style': Flags.string({
      description: 'Indentation style (spaces or tabs). Ignored for YAML output.',
      options: ['spaces', 'tabs'],
    }),
    out: Flags.string({ description: 'Write converted files to this directory' }),
    validate: Flags.boolean({ description: 'Validate input files without producing output' }),
  }
  static override strict = false

  async run(): Promise<void> {
    try {
      const { argv, flags } = await this.parse(Index)
      const parsed: ParsedFlags = {
        fileArgs: argv as string[],
        formatOptions: { eol: flags.eol as FormatOptions['eol'] },
        indentSize: flags['indent-size'],
        indentStyle: flags['indent-style'] as 'spaces' | 'tabs' | undefined,
        outDir: flags.out,
      }

      if (flags.validate) {
        await this.handleValidate(parsed)
        return
      }

      if (parsed.fileArgs.length === 1 && parsed.fileArgs[0] === '-') {
        await this.handleStdin(parsed)
        return
      }

      await this.handleFiles(parsed)
    } catch (error) {
      if (error instanceof CjyError) {
        this.logToStderr(error.message)
        this.exit(error.code)
      }

      throw error
    }
  }

  private async handleFiles({
    fileArgs,
    formatOptions,
    indentSize,
    indentStyle,
    outDir,
  }: ParsedFlags): Promise<void> {
    const filePaths = await resolveFilePaths(fileArgs)
    const sourceFormat = detectFormatFromPaths(filePaths)
    const targetFormat = getTargetFormat(sourceFormat)
    const serializeOptions = getSerializeOptions(targetFormat, indentSize, indentStyle)

    if (outDir) {
      for (const filePath of filePaths) {
        // eslint-disable-next-line no-await-in-loop
        const content = await readInput(filePath)
        const converted = convert(content, sourceFormat, filePath, serializeOptions)
        // eslint-disable-next-line no-await-in-loop
        await writeOutput(outDir, filePath, formatOutput(converted, formatOptions), targetFormat)
      }

      return
    }

    const separator = targetFormat === 'yaml' ? '---\n' : '\n'
    const outputs: string[] = []
    for (const filePath of filePaths) {
      // eslint-disable-next-line no-await-in-loop
      const content = await readInput(filePath)
      outputs.push(convert(content, sourceFormat, filePath, serializeOptions))
    }

    process.stdout.write(formatOutput(outputs.join(separator), formatOptions))
  }

  private async handleStdin({
    formatOptions,
    indentSize,
    indentStyle,
    outDir,
  }: ParsedFlags): Promise<void> {
    if (outDir) {
      throw new CjyError('Cannot use --out with stdin input', EXIT_IO)
    }

    const content = await readStdin()
    const sourceFormat = detectFormatFromContent(content)
    const targetFormat = getTargetFormat(sourceFormat)
    const output = convert(
      content,
      sourceFormat,
      'stdin',
      getSerializeOptions(targetFormat, indentSize, indentStyle),
    )
    process.stdout.write(formatOutput(output, formatOptions))
  }

  private async handleValidate({ fileArgs }: ParsedFlags): Promise<void> {
    if (fileArgs.length === 1 && fileArgs[0] === '-') {
      const content = await readValidateStdin()
      const sourceFormat = detectFormatFromContent(content)
      validate(content, sourceFormat, 'stdin')
      return
    }

    const filePaths = await resolveFilePaths(fileArgs)
    const sourceFormat = detectFormatFromPaths(filePaths)
    for (const filePath of filePaths) {
      // eslint-disable-next-line no-await-in-loop
      const content = await readInput(filePath)
      validate(content, sourceFormat, filePath)
    }
  }
}
