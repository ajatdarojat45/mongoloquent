export default class MongoloquentException extends Error {
  protected status: number | null;

  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "MongoloquentException";
    this.status = status;
  }
}

export class MongoloquentInvalidArgumentException extends MongoloquentException {
  constructor(
    message: string = "Invalid argument",
    status: number | null = null
  ) {
    super(message, status);
    this.name = "MongoloquentInvalidArgumentException";
  }
}

export class MongoloquentItemNotFoundException extends MongoloquentException {
  constructor(
    message: string = "Item not found",
    status: number | null = null
  ) {
    super(message, status);
    this.name = "MongoloquentItemNotFoundException";
  }
}

export class MongoloquentMultipleItemsFoundException extends MongoloquentException {
  constructor(
    message: string = "Multiple items found",
    status: number | null = null
  ) {
    super(message, status);
    this.name = "MongoloquentMultipleItemsFoundException";
  }
}

export class MongoloquentInvalidOperatorException extends MongoloquentException {
  constructor(
    message: string = "Invalid operator",
    status: number | null = null
  ) {
    super(message, status);
    this.name = "MongoloquentInvalidOperatorException";
  }
}
