import "dotenv/config";

let databaseName: string = process.env.MONGOLOQUENT_DATABASE_NAME || "mongoloquent";

if (process.env.NODE_ENV === "test") {
  databaseName =
    process.env.MONGOLOQUENT_DATABASE_NAME || databaseName + "_test";
}

export const MONGOLOQUENT_DATABASE_NAME: string = databaseName;

export const MONGOLOQUENT_DATABASE_URI: string =
  process.env.MONGOLOQUENT_DATABASE_URI || "mongodb://localhost:27017";

export const TIME_ZONE: string = process.env.TIME_ZONE || "Asia/Jakarta"


