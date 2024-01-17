const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb://localhost:27017";
let db = null;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect() {
  try {
    await client.connect();
    const db = client.db("mongorm");
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
