import { MongoClient, ServerApiVersion } from "mongodb";
import "dotenv/config";

let databaseName: string = process.env.MONGOLOQUENT_DATABASE || "mongoloquent";

if (process.env.NODE_ENV === "test") {
  databaseName =
    process.env.MONGOLOQUENT_DATABASE_TEST || databaseName + "_test";
}

export const MONGOLOQUENT_DATABASE: string = databaseName;

export const MONGOLOQUENT_URI: string =
  process.env.MONGOLOQUENT_URI || "mongodb://localhost:27017";

export const client = new MongoClient(MONGOLOQUENT_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
