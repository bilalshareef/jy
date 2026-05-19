import {Args, Command} from '@oclif/core'

import {convert} from '../converter.js'
import {JyError} from '../errors.js'
import {detectFormatFromExtension} from '../format-detector.js'
import {readInput} from '../io.js'

export default class Index extends Command {
  static override args = {
    file: Args.string({description: 'File to convert', required: true}),
  }
  static override description = 'Convert between JSON and YAML formats'

  async run(): Promise<void> {
    try {
      const {args} = await this.parse(Index)
      const sourceFormat = detectFormatFromExtension(args.file)
      const content = await readInput(args.file)
      const output = convert(content, sourceFormat, args.file)
      process.stdout.write(output)
    } catch (error) {
      if (error instanceof JyError) {
        this.logToStderr(error.message)
        this.exit(error.code)
      }

      throw error
    }
  }
}
