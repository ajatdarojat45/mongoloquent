import QueryBuilder from "./QueryBuilder";

/**
 * DB class represents a database collection wrapper that extends QueryBuilder
 * to provide MongoDB-like query operations.
 * @template T - The type of documents stored in the collection
 * @extends {QueryBuilder<T>}
 */
export default class DB<T> extends QueryBuilder<T> {
  /** Allow dynamic property access */
  [key: string]: any;

  /**
   * Creates a new instance of the DB class
   */
  constructor() {
    super();
  }

  /**
   * Creates a new DB instance for the specified collection
   * @template T - The type of documents stored in the collection
   * @param {string} collection - The name of the collection to operate on
   * @returns {DB<T>} A new DB instance configured for the specified collection
   */
  public static collection<T>(
    this: new () => DB<T>,
    collection: string,
  ): DB<T> {
    const q = new this();
    q["$collection"] = collection;

    return q;
  }
}
