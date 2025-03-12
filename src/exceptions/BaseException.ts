export default class BaseException extends Error {
  protected status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
