import { EXIT_PARSE, EXIT_VALIDATION, JyError } from '../errors.js'
import { readStdin } from '../io.js'

export async function readValidateStdin(): Promise<string> {
  try {
    return await readStdin()
  } catch (error) {
    if (error instanceof JyError && error.code === EXIT_PARSE) {
      throw new JyError(error.message, EXIT_VALIDATION)
    }

    throw error
  }
}
