import mongodb from "./connectors/mongodb";

class Database {
  protected static collection: string = "collection";
  protected static softDelete: boolean = false;
  protected static timestamps: boolean = false;

  static async getCollection() {
    const db = await mongodb();
    return db.collection(this.collection);
  }
}

export default Database;
