/**
 * Configuration file for Mongoloquent
 * Loads and exports database configuration variables from environment
 */
import "dotenv/config";

/**
 * Database name to be used by the application
 * Uses environment variable if available, otherwise defaults to "mongoloquent"
 */
let databaseName: string =
  process.env.MONGOLOQUENT_DATABASE_NAME || "mongoloquent";

/**
 * Appends "_test" to database name when in test environment
 * Ensures tests don't interfere with development/production data
 */
if (process.env.NODE_ENV === "test") {
  databaseName =
    process.env.MONGOLOQUENT_DATABASE_NAME || databaseName + "_test";
}

/**
 * Exported database name that will be used by the application
 * @type {string}
 */
export const MONGOLOQUENT_DATABASE_NAME: string = databaseName;

/**
 * MongoDB connection URI
 * Uses environment variable if available, otherwise defaults to local MongoDB instance
 * @type {string}
 */
export const MONGOLOQUENT_DATABASE_URI: string =
  process.env.MONGOLOQUENT_DATABASE_URI || "mongodb://localhost:27017";

/**
 * Application timezone setting
 * Uses environment variable if available, otherwise defaults to "Asia/Jakarta"
 * @type {string}
 */
export const TIMEZONE: string = process.env.TIMEZONE || "Asia/Jakarta";
