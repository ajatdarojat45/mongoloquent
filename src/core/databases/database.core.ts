import { Db, MongoClient, ServerApiVersion } from "mongodb";
import { MongoloquentConfigurationException } from "../../exceptions";

export class Database {
	private static $dbs: Map<string, Db> = new Map();
	private static $clients: Map<string, MongoClient> = new Map();

	public static getDb(connection: string, databaseName: string): Db {
		const key = `${connection}_${databaseName}`;

		if (this.$dbs.has(key)) {
			return this.$dbs.get(key) as Db;
		}
		return this.connect(connection, databaseName);
	}

	protected static getDbs(): Map<string, Db> {
		return this.$dbs;
	}

	protected static getClients(): Map<string, MongoClient> {
		return this.$clients;
	}

	public static getClient(connection: string): MongoClient {
		if (this.$clients.has(connection)) {
			return this.$clients.get(connection) as MongoClient;
		}

		return this.setClient(connection);
	}

	public static setClient(connection: string): MongoClient {
		const client = new MongoClient(connection, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			},
		});

		this.$clients.set(connection, client);
		return client;
	}

	private static connect(connection: string, databaseName: string): Db {
		try {
			console.log("Mongoloquent trying to connect to MongoDB database...");

			const client = this.getClient(connection);
			client.connect();

			const db = client.db(databaseName);
			console.log("Mongoloquent connected to MongoDB database.");

			const key = `${connection}_${databaseName}`;
			this.$dbs.set(key, db);

			return db;
		} catch (error) {
			throw new MongoloquentConfigurationException(
				"Mongoloquent failed to connect to MongoDB database.",
				error,
			);
		}
	}
}
