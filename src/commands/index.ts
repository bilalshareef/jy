import {Command} from '@oclif/core'

import {JyError} from '../errors.js'

export default class Index extends Command {
  static override description = 'Convert between JSON and YAML formats'

  async run(): Promise<void> {
    try {
      // Future stories will add pipeline logic here
    } catch (error) {
      if (error instanceof JyError) {
        this.logToStderr(error.message)
        this.exit(error.code)
      }

      throw error
    }
  }
}
