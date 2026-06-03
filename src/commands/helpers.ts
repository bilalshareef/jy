import { CjyError, EXIT_PARSE, EXIT_VALIDATION } from '../errors.js'
import { readStdin } from '../io.js'

export async function readValidateStdin(): Promise<string> {
  try {
    return await readStdin()
  } catch (error) {
    if (error instanceof CjyError && error.code === EXIT_PARSE) {
      throw new CjyError(error.message, EXIT_VALIDATION)
    }

    throw error
  }
}
