import { MongoClient, ServerApiVersion, Db } from "mongodb";

export const MONGOLOQUENT_DATABASE: string =
  process.env.MONGOLOQUENT_DATABASE || "mongoloquent";

export const MONGOLOQUENT_URI: string =
  process.env.MONGOLOQUENT_URI || "mongodb://localhost:27017";

export const client = new MongoClient(MONGOLOQUENT_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
