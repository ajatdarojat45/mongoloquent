import { Db, MongoClient, ServerApiVersion } from "mongodb";

/**
 * Database class for managing MongoDB connections
 * @class Database
 */
export default class Database {
  /** Map to store database connections */
  private static $dbs: Map<string, Db> = new Map();

  /**
   * Gets a database instance for the specified connection and database name
   * @param {string} connection - MongoDB connection string
   * @param {string} databaseName - Name of the database
   * @returns {Db} MongoDB database instance
   */
  public static getDb(connection: string, databaseName: string): Db {
    // Create a unique key for the database connection
    const key = `${connection}_${databaseName}`;

    // Check if the database connection already exists
    if (this.$dbs.has(key)) {
      // Return the existing database connection
      return this.$dbs.get(key) as Db;
    }

    // Connect to the database if the connection does not exist
    return this.connect(connection, databaseName);
  }

  /**
   * Gets all database connections
   * @returns {Map<string, Db>} Map of all database connections
   */
  protected static getDbs(): Map<string, Db> {
    // Return the map of connected databases
    return this.$dbs;
  }

  /**
   * Creates a new database connection
   * @param {string} connection - MongoDB connection string
   * @param {string} databaseName - Name of the database
   * @returns {Db} MongoDB database instance
   * @throws {Error} If connection fails
   * @private
   */
  private static connect(connection: string, databaseName: string): Db {
    try {
      console.log("Mongoloquent trying to connect to MongoDB database...");

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
      // Get the database instance
      const db = client.db(databaseName);

      console.log("Mongoloquent connected to database...");

      // Create a unique key for the database connection
      const key = `${connection}_${databaseName}`;
      // Store the database connection in the map
      this.$dbs.set(key, db);

      // Return the connected database
      return db;
    } catch (error) {
      console.error(
        "Mongoloquent failed to connect to MongoDB database:",
        error,
      );
      // Throw an error if the connection fails
      throw new Error("Mongoloquent failed to connect to MongoDB database.");
    }
  }
}
