import { Db, MongoClient, ServerApiVersion, Document } from "mongodb";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
} from "./configs/app";

export default class Database {
  /**
   * This property defines the schema definition for the model.
   * 
   * @public
   * @static
   * @type {Document}
   */
  public static $schema: Document;

  /**
   * The MongoDB connection URI for the model.
   * If empty, the default URI from configuration will be used.
   *
   * @protected
   * @static
   * @type {string}
   * @default ""
   */
  protected static $connection: string = "";

  /**
   * The database name for the model.
   * If null, the default database name from configuration will be used.
   *
   * @protected
   * @static
   * @type {string|null}
   * @default null
   */
  protected static $databaseName: string | null = null;

  /**
   * Map of all connected MongoDB database instances.
   * Keys are connection strings, values are database instances.
   *
   * @private
   * @static
   * @type {Map<string, Db>}
   */
  private static $dbs: Map<string, Db> = new Map();

  /**
   * The collection name for the model.
   *
   * @public
   * @static
   * @type {string}
   * @default ""
   */
  public static $collection: string = "";

  /**
   * The primary key field name for the model.
   *
   * @protected
   * @static
   * @type {string}
   * @default "_id"
   */
  protected static $primaryKey: string = "_id";

  /**
   * Gets the current connection URI for the model.
   *
   * @protected
   * @static
   * @returns {string} The connection URI or the default URI from configuration
   */
  protected static getConnectionName(): string {
    // Return the connection URI or the default URI from the config
    return this.$connection || MONGOLOQUENT_DATABASE_URI;
  }

  /**
   * Gets the current database name for the model.
   *
   * @protected
   * @static
   * @returns {string} The database name or the default name from configuration
   */
  protected static getDatabaseName(): string {
    // Return the database name or the default name from the config
    return this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
  }

  /**
   * Retrieves a MongoDB collection instance.
   *
   * @protected
   * @static
   * @param {string} [collection] - Optional collection name. If not provided, uses the model's default collection
   * @returns {Collection} A MongoDB collection instance
   */
  protected static getCollection(collection?: string) {
    // Get the database instance
    const db = this.getDb();
    // Use the provided collection name or the default collection name
    const coll = collection || this.$collection;

    // Return the MongoDB collection
    return db?.collection<(typeof Database)["$schema"]>(coll);
  }

  /**
   * Retrieves the MongoDB database instance for the current model.
   * If a connection already exists, returns the cached instance.
   * Otherwise, creates a new connection.
   *
   * @protected
   * @static
   * @returns {Db} A MongoDB database instance
   */
  protected static getDb(): Db {
    // Determine the connection URI
    const connection =
      this.$connection !== "" ? this.$connection : MONGOLOQUENT_DATABASE_URI;
    // Create a unique key for the database connection
    const key = `${connection}_${this.$databaseName}`;

    // Check if the database connection already exists
    if (this.$dbs.has(key)) {
      // Return the existing database connection
      return this.$dbs.get(key) as Db;
    }

    // Connect to the database if the connection does not exist
    return this.connect();
  }

  /**
   * Retrieves all active MongoDB database connections.
   *
   * @protected
   * @static
   * @returns {Map<string, Db>} A map of database connections where the key is the connection string
   *                           and the value is the database instance
   */
  protected static getDbs(): Map<string, Db> {
    // Return the map of connected databases
    return this.$dbs;
  }

  /**
   * Establishes a connection to the MongoDB database.
   * Creates a new MongoClient instance and connects to the server.
   *
   * @private
   * @static
   * @returns {Db} The connected MongoDB database instance
   * @throws {Error} If the connection attempt fails
   */
  private static connect(): Db {
    try {
      console.log("Mongoloquent trying to connect to MongoDB database...");

      // Determine the connection URI
      const connection =
        this.$connection !== "" ? this.$connection : MONGOLOQUENT_DATABASE_URI;

      // Create a new MongoClient instance
      const client = new MongoClient(connection, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });

      // Connect to the MongoDB server
      client.connect();
      // Determine the database name
      const dbName = this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
      // Get the database instance
      const db = client.db(dbName);

      console.log("Mongoloquent connected to database...");

      // Create a unique key for the database connection
      const key = `${connection}_${this.$databaseName}`;
      // Store the database connection in the map
      this.$dbs.set(key, db);

      // Return the connected database
      return db;
    } catch (error) {
      console.error(
        "Mongoloquent failed to connect to MongoDB database:",
        error
      );
      // Throw an error if the connection fails
      throw new Error("Mongoloquent failed to connect to MongoDB database.");
    }
  }
}
