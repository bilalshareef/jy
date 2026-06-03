export const EXIT_SUCCESS = 0
export const EXIT_VALIDATION = 1
export const EXIT_PARSE = 2
export const EXIT_IO = 3
export const EXIT_AMBIGUOUS = 4

export type ExitCode =
  | typeof EXIT_AMBIGUOUS
  | typeof EXIT_IO
  | typeof EXIT_PARSE
  | typeof EXIT_VALIDATION

export class CjyError extends Error {
  constructor(
    message: string,
    public readonly code: ExitCode,
  ) {
    if (!message) throw new TypeError('CjyError message must not be empty')
    super(message)
    this.name = 'CjyError'
  }
}
