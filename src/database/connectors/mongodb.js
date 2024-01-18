const { MongoClient, ServerApiVersion } = require("mongodb");

const MONGODB_DB = process.env.MONGODB_DB || "mongorm";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
let db = null;

const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    return db;
  } catch (error) {
    console.log(error, "mongorm error - can't connect to database");
  }
}

async function getDb() {
  if (!db) {
    db = await connect();
  }
  return db;
}

module.exports = getDb;
