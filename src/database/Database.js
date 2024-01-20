const mongodb = require("./connectors/mongodb");

class Database {
  static collection = "collection";
  static softDelete = false;
  static timestamps = false;

  static async getCollection() {
    const db = await mongodb();
    return db.collection(this.collection);
  }
}

module.exports = Database;
