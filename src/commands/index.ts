import {Args, Command, Flags} from '@oclif/core'

import {convert} from '../converter.js'
import {EXIT_IO, JyError} from '../errors.js'
import {detectFormatFromContent, detectFormatFromPaths, getTargetFormat} from '../format-detector.js'
import {readInput, readStdin, resolveFilePaths, writeOutput} from '../io.js'

export default class Index extends Command {
  static override args = {
    file: Args.string({description: 'File(s) to convert (or - for stdin)', required: true}),
  }
  static override description = 'Convert between JSON and YAML formats'
  static override flags = {
    out: Flags.string({description: 'Write converted files to this directory'}),
  }
  static override strict = false

  async run(): Promise<void> {
    try {
      const {argv, flags} = await this.parse(Index)
      const fileArgs = argv as string[]
      const outDir = flags.out

      if (fileArgs.length === 1 && fileArgs[0] === '-') {
        if (outDir) {
          throw new JyError('Cannot use --out with stdin input', EXIT_IO)
        }

        const content = await readStdin()
        const sourceFormat = detectFormatFromContent(content)
        const output = convert(content, sourceFormat, 'stdin')
        process.stdout.write(output)
        return
      }

      const filePaths = await resolveFilePaths(fileArgs)
      const sourceFormat = detectFormatFromPaths(filePaths)
      const targetFormat = getTargetFormat(sourceFormat)

      if (outDir) {
        for (const filePath of filePaths) {
          // eslint-disable-next-line no-await-in-loop
          const content = await readInput(filePath)
          const converted = convert(content, sourceFormat, filePath)
          // eslint-disable-next-line no-await-in-loop
          await writeOutput(outDir, filePath, converted, targetFormat)
        }

        return
      }

      const separator = targetFormat === 'yaml' ? '---\n' : '\n'
      const outputs: string[] = []
      for (const filePath of filePaths) {
        // eslint-disable-next-line no-await-in-loop
        const content = await readInput(filePath)
        outputs.push(convert(content, sourceFormat, filePath))
      }

      process.stdout.write(outputs.join(separator))
    } catch (error) {
      if (error instanceof JyError) {
        this.logToStderr(error.message)
        this.exit(error.code)
      }

      throw error
    }
  }
}
