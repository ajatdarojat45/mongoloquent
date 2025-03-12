import BaseException from "./BaseException"

export default class ModelNotFoundException extends BaseException {
  constructor() {
    super("Not found", 404)
  }
}
