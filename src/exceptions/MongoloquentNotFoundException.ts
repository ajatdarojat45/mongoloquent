import MongoloquentException from "./MongoloquentException";

export default class MongoloquentNotFoundException extends MongoloquentException {
  constructor() {
    super("Not found", 404);
  }
}
