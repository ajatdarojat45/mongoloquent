import { Collection, Db, MongoClient, ServerApiVersion } from "mongodb";
import {
	MONGOLOQUENT_DATABASE_NAME,
	MONGOLOQUENT_DATABASE_URI,
} from "./configs/app";

export default class Database {
	/**
	 * @note This property stores the connection URI for the model.
	 * @var {string}
	 */
	protected static $connection: string = "";

	/**
	 * @note This property stores the database name for the model.
	 * @var {string|null}
	 */
	protected static $databaseName: string | null = null;

	/**
	 * @note This property stores the list of connected databases.
	 * @var {Map<string, Db>}
	 */
	private static $dbs: Map<string, Db> = new Map();

	/**
	 * @note This property stores the collection name for the model.
	 * @var {string}
	 */
	public static $collection: string = "";

	/**
	 * @note This property stores the primary key for the model.
	 * @var {string}
	 */
	protected static $primaryKey: string = "_id";

	/**
	 * @note This method returns the current connection URI for the model.
	 * @return {string} The connection URI.
	 */
	protected static getConnectionName(): string {
		// Return the connection URI or the default URI from the config
		return this.$connection || MONGOLOQUENT_DATABASE_URI;
	}

	/**
	 * @note This method returns the current database name for the model.
	 * @return {string} The database name.
	 */
	protected static getDatabaseName(): string {
		// Return the database name or the default name from the config
		return this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
	}

	/**
	 * @note This method retrieves the MongoDB collection specified by the model.
	 * @param {string} [collection] - The collection name.
	 * @return {Collection} The MongoDB collection.
	 */
	protected static getCollection(collection?: string): Collection {
		// Get the database instance
		const db = this.getDb();
		// Use the provided collection name or the default collection name
		const coll = collection || this.$collection;

		// Return the MongoDB collection
		return db?.collection(coll);
	}

	/**
	 * @note This method retrieves the MongoDB database specified by the model.
	 * @return {Db} The MongoDB database.
	 */
	protected static getDb(): Db {
		// Determine the connection URI
		const connection =
			this.$connection !== "" ? this.$connection : MONGOLOQUENT_DATABASE_URI;
		// Create a unique key for the database connection
		const key = `${connection}_${this.$databaseName}`;

		// Check if the database connection already exists
		if (this.$dbs.has(key)) {
			// Return the existing database connection
			return this.$dbs.get(key) as Db;
		}

		// Connect to the database if the connection does not exist
		return this.connect();
	}

	/**
	 * @note This method retrieves the map of connected MongoDB databases.
	 * @return {Map<string, Db>} The map of connected databases.
	 */
	protected static getDbs(): Map<string, Db> {
		// Return the map of connected databases
		return this.$dbs;
	}

	/**
	 * @note This method establishes a connection to the MongoDB database.
	 * @return {Db} The connected MongoDB database.
	 * @throws {Error} If connection fails.
	 */
	public static connect(): Db {
		try {
			console.log("Mongoloquent trying to connect to MongoDB database...");

			// Determine the connection URI
			const connection =
				this.$connection !== "" ? this.$connection : MONGOLOQUENT_DATABASE_URI;

			// Create a new MongoClient instance
			const client = new MongoClient(connection, {
				serverApi: {
					version: ServerApiVersion.v1,
					strict: true,
					deprecationErrors: true,
				},
			});

			// Connect to the MongoDB server
			client.connect();
			// Determine the database name
			const dbName = this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
			// Get the database instance
			const db = client.db(dbName);

			console.log("Mongoloquent connected to database...");

			// Create a unique key for the database connection
			const key = `${connection}_${this.$databaseName}`;
			// Store the database connection in the map
			this.$dbs.set(key, db);

			// Return the connected database
			return db;
		} catch (error) {
			console.error("Mongoloquent failed to connect to MongoDB database:", error);
			// Throw an error if the connection fails
			throw new Error("Mongoloquent failed to connect to MongoDB database.");
		}
	}
}
