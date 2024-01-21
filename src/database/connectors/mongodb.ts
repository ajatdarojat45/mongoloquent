import { MongoClient, ServerApiVersion, Db } from "mongodb";

const MONGOLOQUENT_DATABASE: string =
  process.env.MONGOLOQUENT_DATABASE || "mongoloquent";

const MONGOLOQUENT_URI: string =
  process.env.MONGOLOQUENT_URI || "mongodb://localhost:27017";

let db: Db;

const client = new MongoClient(MONGOLOQUENT_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connect(): Promise<Db> {
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

async function getDb(): Promise<Db> {
  if (!db) {
    db = await connect();
  }
  return db;
}

export default getDb;
