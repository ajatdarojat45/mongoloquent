import { ClientSession, Document, MongoClient } from "mongodb";

import Database from "./Database";
import QueryBuilder from "./QueryBuilder";
import { MONGOLOQUENT_DATABASE_URI } from "./configs/app";
import { IDBLookup, ITransactionConfig } from "./interfaces/IDB";

/**
 * DB class represents a database collection wrapper that extends QueryBuilder
 * to provide MongoDB-like query operations.
 * @template T - The type of documents stored in the collection
 * @extends {QueryBuilder<T>}
 */
export default class DB<T> extends QueryBuilder<T> {
  /** Allow dynamic property access */
  [key: string]: any;

  protected static $timezone: string;
  protected static $connection: string;
  protected static $databaseName: string;

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
  public static collection<T>(collection: string): DB<T> {
    const q = new this() as DB<T>;
    q["$collection"] = collection;

    if (this.$connection) q.setConnection(this.$connection);
    if (this.$databaseName) q.setDatabaseName(this.$databaseName);
    if (this.$timezone) q.setTimezone(this.$timezone);

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

  /**
   * Executes a function within a MongoDB transaction and handles retries for transient errors.
   *
   * @template T - The return type of the transaction function
   * @param {function(ClientSession): Promise<T>} fn - The function to execute within the transaction.
   *        This function receives the session object and should return a Promise.
   * @param {ITransactionConfig} [config={}] - Configuration options for the transaction
   * @param {Object} [config.transactionOptions={}] - MongoDB transaction options (readConcern, writeConcern, etc.)
   * @param {number} [config.retries=1] - Maximum number of retry attempts for transient transaction errors
   * @returns {Promise<T>} A promise that resolves with the result of the transaction function
   * @throws {Error} If the transaction fails after all retry attempts
   *
   */
  static async transaction<T>(
    fn: (session: ClientSession) => Promise<T>,
    config: ITransactionConfig = {},
  ): Promise<T> {
    const client: MongoClient = Database.getClient(
      this.$connection || MONGOLOQUENT_DATABASE_URI,
    );
    const session: ClientSession = client.startSession();

    const {
      transactionOptions = {},
      retries = 1, // default retry
    } = config;

    let attempt = 0;

    while (attempt < retries) {
      try {
        const result = await session.withTransaction(async () => {
          return await fn(session);
        }, transactionOptions);

        return result;
      } catch (err: any) {
        const isRetryable =
          err.hasErrorLabel?.("TransientTransactionError") ||
          err.hasErrorLabel?.("UnknownTransactionCommitResult") ||
          err.message?.includes("TransientTransactionError") ||
          err.message?.includes("UnknownTransactionCommitResult");

        attempt++;

        if (!isRetryable || attempt >= retries) {
          throw err;
        }

        console.warn(
          `Mongoloquent Transaction retry ${attempt}/${retries} due to: ${err.message}`,
        );
      } finally {
        if (attempt >= retries || session.inTransaction() === false) {
          await session.endSession();
        }
      }
    }

    throw new Error("Transaction failed after maximum retries");
  }

  public static setConnection(connection: string): string {
    this.$connection = connection;
    return this.$connection;
  }

  public static setDatabaseName(name: string): string {
    this.$databaseName = name;
    return this.$databaseName;
  }

  public static setTimezone(timezone: string): string {
    this.$timezone = timezone;
    return this.$timezone;
  }
}
