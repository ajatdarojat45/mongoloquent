import { DatabaseInterface } from "../interfaces/DatabaseInterface";
import { Db, Collection } from "mongodb";
import { MONGOLOQUENT_DATABASE, client } from "./connectors/mongodb";

class Database implements DatabaseInterface {
  protected static collection: string = "collection";
  protected static softDelete: boolean = false;
  protected static timestamps: boolean = false;
  private static db: Db;

  protected static getCollection(collection?: string): Collection {
    if (!this.db) {
      this.connect();
    }
    return this.db.collection(collection || this.collection);
  }

  protected static getDb(): Db {
    return this.db;
  }

  private static connect(): void {
    try {
      console.log("Mongoloquent trying to connect to database...");
      client.connect();
      const db = client.db(MONGOLOQUENT_DATABASE);
      console.log("Mongoloquent connected to database...");
      this.db = db;
    } catch (error) {
      throw new Error("Mongoloquent failed to connect to database...");
    }
  }
}

export default Database;
