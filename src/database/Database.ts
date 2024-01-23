import { DatabaseInterface } from "../interfaces/DatabaseInterface";
import { Db, Collection } from "mongodb";
import { MONGOLOQUENT_DATABASE, client } from "./connectors/mongodb";

class Database implements DatabaseInterface {
  protected static collection: string = "collection";
  protected static softDelete: boolean = false;
  protected static timestamps: boolean = false;
  private static db: Db;

  protected static async getCollection(): Promise<Collection> {
    if (!this.db) {
      await this.connect();
    }
    return this.db.collection(this.collection);
  }

  private static async connect(): Promise<void> {
    try {
      console.log("Connecting to database...");
      await client.connect();
      const db = client.db(MONGOLOQUENT_DATABASE);
      console.log("Connected to database");
      this.db = db;
    } catch (error) {
      throw new Error("Failed to connect to database");
    }
  }
}

export default Database;
