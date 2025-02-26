import { Collection, Db } from "mongodb"
import { IDb } from "./interfaces/IDatabase"
import { MONGOLOQUENT_DATABASE_NAME, MONGOLOQUENT_DATABASE_URI, client } from "./configs/mongodb"

export default class Database {
  /**
   * The connection name for the model.
   *
   * @var string|null
   */
  protected static $connection: string | null = null

  /**
   * The database name for the model.
   *
   * @var string|null
   */
  protected static $databaseName: string | null = null

  /**
   * List of connected databases
   *
   * @var IDb[]
   */
  private static $dbs: IDb[] = []

  /**
   * The connection name for the model.
   *
   * @var string
   */
  public static $collection: string = ""

  /**
   * The primary key for the model.
   *
   * @var string
   */
  protected static $primaryKey: string = "_id"

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
   * Get Mongodb collection
   *
   * @param string collection
   *
   * @return Collection
   */
  protected static getCollection(collection?: string): Collection {
    const db = this.getDb()

    if (!db) {
      this.connect();
    }

    return db.collection(collection || this.$collection)
  }

  /**
   * Get Mongodb database
   *
   * @return Db
   */
  protected static getDb(): Db {
    const db = this.$dbs.find(el => el.name === this.$connection)

    return db?.db as Db
  }

  /**
   * Connect to Mongodb database
   *
   * @return void
   */
  private static connect(): void {
    try {
      console.log("Mongoloquent trying to connect to Mongodb database...");

      client.connect();
      const dbName = this.$databaseName || MONGOLOQUENT_DATABASE_NAME
      const db = client.db(dbName);

      console.log("Mongoloquent connected to database...");

      const name = this.$connection || MONGOLOQUENT_DATABASE_URI
      this.$dbs.push({ db, name })

    } catch (error) {
      throw new Error("Mongoloquent failed to connect to Mongodb database...");
    }
  }
}
