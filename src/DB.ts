import { Document } from "mongodb";

import QueryBuilder from "./QueryBuilder";
import { IDBLookup } from "./interfaces/IDB";

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
   * Sets the connection URI for database operations
   *
   * @template T - The type of documents stored in the collection
   * @param {string} uri - The MongoDB connection URI
   * @returns {DB<T>} A new DB instance with the specified connection
   * @static
   */
  public static connection<T>(
    this: new () => DB<T>,
    connection: string,
  ): DB<T> {
    const q = new this();
    q["$connection"] = connection;

    return q;
  }

  /**
   * Sets the connection URI for database operations on the current instance
   *
   * @param {string} uri - The MongoDB connection URI
   * @returns {this} The current DB instance for method chaining
   */
  public connection(connection: string) {
    this["$connection"] = connection;

    return this;
  }

  /**
   * Sets the database name for subsequent operations
   *
   * @template T - The type of documents stored in the collection
   * @param {string} database - The name of the database to use
   * @returns {DB<T>} A new DB instance with the specified database
   * @static
   */
  public static database<T>(this: new () => DB<T>, database: string): DB<T> {
    const q = new this();
    q["$databaseName"] = database;

    return q;
  }

  /**
   * Sets the database name for operations on the current instance
   *
   * @param {string} database - The name of the database to use
   * @returns {this} The current DB instance for method chaining
   */
  public database(database: string) {
    this["$databaseName"] = database;

    return this;
  }

  /**
   * Creates a new DB instance for the specified collection
   *
   * @template T - The type of documents stored in the collection
   * @param {string} collection - The name of the collection to operate on
   * @returns {DB<T>} A new DB instance configured for the specified collection
   * @static
   */
  public static collection<T>(
    this: new () => DB<T>,
    collection: string,
  ): DB<T> {
    const q = new this();
    q["$collection"] = collection;

    return q;
  }

  /**
   * Sets the collection name for operations on the current instance
   *
   * @param {string} collection - The name of the collection to operate on
   * @returns {this} The current DB instance for method chaining
   */
  public collection(collection: string) {
    this["$collection"] = collection;

    return this;
  }

  /**
   * Performs a MongoDB $lookup aggregation to join documents from another collection
   *
   * @param {IDBLookup} document - The lookup configuration containing from, localField, foreignField, and as properties
   * @returns {this} The current DB instance for method chaining
   */
  public lookup(document: IDBLookup) {
    this.$lookups.push({
      $lookup: document,
    });

    return this;
  }

  /**
   * Adds raw MongoDB aggregation pipeline stages to the query
   *
   * @param {Document | Document[]} documents - One or more MongoDB aggregation pipeline stages
   * @returns {this} The current DB instance for method chaining
   */
  public raw(documents: Document | Document[]) {
    const docs = Array.isArray(documents) ? documents : [documents];
    this["$stages"].push(...docs);

    return this;
  }
}
