import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
} from "./configs/app";

export default class Database {
  /**
   * The connection name for the model.
   *
   * @var string
   */
  protected static $connection: string = "";

  /**
   * The database name for the model.
   *
   * @var string|null
   */
  protected static $databaseName: string | null = null;

  /**
   * List of connected databases
   *
   * @var mongodb/Db
   */
  private static $dbs: Map<string, Db> = new Map();

  /**
   * The connection name for the model.
   *
   * @var string
   */
  public static $collection: string = "";

  /**
   * The primary key for the model.
   *
   * @var string
   */
  protected static $primaryKey: string = "_id";

  /**
   * Get the current connection name for the model.
   *
   * @return string
   */
  protected static getConnectionName(): string {
    return this.$connection || MONGOLOQUENT_DATABASE_URI;
  }

  /**
   * Get the current database name for the model.
   *
   * @return string
   */
  protected static getDatabaseName(): string {
    return this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
  }

  /**
   * Get MongoDB collection.
   *
   * @param {string} [collection] - The collection name.
   * @return {Collection} The MongoDB collection.
   */
  protected static getCollection(collection?: string): Collection {
    const db = this.getDb();
    const coll = collection || this.$collection;

    return db?.collection(coll);
  }

  /**
   * Get MongoDB database.
   *
   * @return {Db} The MongoDB database.
   */
  protected static getDb(): Db {
    const connection =
      this.$connection !== "" ? this.$connection : MONGOLOQUENT_DATABASE_URI;
    const key = `${connection}_${this.$databaseName}`;

    if (this.$dbs.has(key)) {
      return this.$dbs.get(key) as Db;
    }

    return this.connect();
  }

  /**
   * Get MongoDB databases.
   *
   * @return {Map<string, Db>} The map of connected databases.
   */
  protected static getDbs(): Map<string, Db> {
    return this.$dbs;
  }

  /**
   * Connect to MongoDB database.
   *
   * @return {Db} The connected MongoDB database.
   * @throws {Error} If connection fails.
   */
  public static connect(): Db {
    try {
      console.log("Mongoloquent trying to connect to MongoDB database...");

      const connection =
        this.$connection !== "" ? this.$connection : MONGOLOQUENT_DATABASE_URI;

      const client = new MongoClient(connection, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
      });

      client.connect();
      const dbName = this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
      const db = client.db(dbName);

      console.log("Mongoloquent connected to database...");

      const key = `${connection}_${this.$databaseName}`;
      this.$dbs.set(key, db);

      return db;
    } catch (error) {
      console.error("Mongoloquent failed to connect to MongoDB database:", error);
      throw new Error("Mongoloquent failed to connect to MongoDB database.");
    }
  }
}
