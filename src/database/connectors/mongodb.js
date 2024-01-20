const { MongoClient, ServerApiVersion } = require("mongodb");

const MONGOLOQUENT_DATABASE =
  process.env.MONGOLOQUENT_DATABASE || "mongoloquent";
const MONGOLOQUENT_URI =
  process.env.MONGOLOQUENT_URI || "mongodb://localhost:27017";
let db = null;

const client = new MongoClient(MONGOLOQUENT_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
  try {
    console.log("Connecting to database...");
    await client.connect();
    const db = client.db(MONGOLOQUENT_DATABASE);
    console.log("Connected to database");
    return db;
  } catch (error) {
    throw new Error("Failed to connect to database");
  }
}

async function getDb() {
  if (!db) {
    db = await connect();
  }
  return db;
}

module.exports = getDb;
