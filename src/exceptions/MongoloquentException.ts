/**
 * Base exception class for Mongoloquent
 * @class MongoloquentException
 * @extends Error
 */
export default class MongoloquentException extends Error {
  protected status: number | null;

  /**
   * Creates a new MongoloquentException
   * @param {string} message - Error message
   * @param {number|null} status - HTTP status code (optional)
   */
  constructor(message: string, status: number | null = null) {
    super(message);
    this.name = "MongoloquentException";
    this.status = status;
  }
}

/**
 * Exception thrown when a resource is not found
 * @class MongoloquentNotFoundException
 * @extends MongoloquentException
 */
export class MongoloquentNotFoundException extends MongoloquentException {
  /**
   * Creates a new MongoloquentNotFoundException
   * @param {string} message - Error message (defaults to "Not found")
   * @param {number|null} status - HTTP status code (optional)
   */
  constructor(message: string = "Not found", status: number | null = null) {
    super(message, status);
    this.name = "MongoloquentNotFoundException";
  }
}

/**
 * Exception thrown when an invalid argument is provided
 * @class MongoloquentInvalidArgumentException
 * @extends MongoloquentException
 */
export class MongoloquentInvalidArgumentException extends MongoloquentException {
  /**
   * Creates a new MongoloquentInvalidArgumentException
   * @param {string} message - Error message (defaults to "Invalid argument")
   * @param {number|null} status - HTTP status code (optional)
   */
  constructor(
    message: string = "Invalid argument",
    status: number | null = null,
  ) {
    super(message, status);
    this.name = "MongoloquentInvalidArgumentException";
  }
}

/**
 * Exception thrown when a specific item is not found
 * @class MongoloquentItemNotFoundException
 * @extends MongoloquentException
 */
export class MongoloquentItemNotFoundException extends MongoloquentException {
  /**
   * Creates a new MongoloquentItemNotFoundException
   * @param {string} message - Error message (defaults to "Item not found")
   * @param {number|null} status - HTTP status code (optional)
   */
  constructor(
    message: string = "Item not found",
    status: number | null = null,
  ) {
    super(message, status);
    this.name = "MongoloquentItemNotFoundException";
  }
}

/**
 * Exception thrown when multiple items are found but only one was expected
 * @class MongoloquentMultipleItemsFoundException
 * @extends MongoloquentException
 */
export class MongoloquentMultipleItemsFoundException extends MongoloquentException {
  /**
   * Creates a new MongoloquentMultipleItemsFoundException
   * @param {string} message - Error message (defaults to "Multiple items found")
   * @param {number|null} status - HTTP status code (optional)
   */
  constructor(
    message: string = "Multiple items found",
    status: number | null = null,
  ) {
    super(message, status);
    this.name = "MongoloquentMultipleItemsFoundException";
  }
}

/**
 * Exception thrown when an invalid operator is used in a query
 * @class MongoloquentInvalidOperatorException
 * @extends MongoloquentException
 */
export class MongoloquentInvalidOperatorException extends MongoloquentException {
  /**
   * Creates a new MongoloquentInvalidOperatorException
   * @param {string} message - Error message (defaults to "Invalid operator")
   * @param {number|null} status - HTTP status code (optional)
   */
  constructor(
    message: string = "Invalid operator",
    status: number | null = null,
  ) {
    super(message, status);
    this.name = "MongoloquentInvalidOperatorException";
  }
}
