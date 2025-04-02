import "dotenv/config";

let databaseName: string =
  process.env.MONGOLOQUENT_DATABASE_NAME || "mug_event";

if (process.env.NODE_ENV === "test") {
  databaseName =
    process.env.MONGOLOQUENT_DATABASE_NAME || databaseName + "_test";
}

export const MONGOLOQUENT_DATABASE_NAME: string = databaseName;

export const MONGOLOQUENT_DATABASE_URI: string =
  process.env.MONGOLOQUENT_DATABASE_URI || "mongodb://localhost:27017";

export const TIMEZONE: string = process.env.TIMEZONE || "Asia/Jakarta";
