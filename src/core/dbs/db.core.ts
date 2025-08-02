import { ClientSession, MongoClient, WithId, Document } from "mongodb";
import { IDBLookup, IDBTransactionConfig } from "../../types";
import { Database, QueryBuilder } from "../index";
import { MongoloquentTransactionException } from "../../exceptions";
import { MONGOLOQUENT_DATABASE_URI } from "../../constants";

export class DB<T = WithId<Document>> extends QueryBuilder<T> {
	[key: string]: any;

	protected static $timezone: string;
	protected static $connection: string;
	protected static $databaseName: string;

	constructor() {
		super();
	}

	public static connection<T>(
		this: new () => DB<T>,
		connection: string,
	): DB<T> {
		const q = new this();
		q.setConnection(connection);
		return q;
	}

	public connection(connection: string) {
		this.setConnection(connection);
		return this;
	}

	public static database<T>(this: new () => DB<T>, database: string): DB<T> {
		const q = new this();
		q.setDatabaseName(database);
		return q;
	}

	public database(database: string) {
		this.setDatabaseName(database);
		return this;
	}

	public static collection<T>(collection: string): DB<T> {
		const q = new this() as DB<T>;
		q.setCollection(collection);

		if (this.$connection) q.setConnection(this.$connection);
		if (this.$databaseName) q.setDatabaseName(this.$databaseName);
		if (this.$timezone) q.setTimezone(this.$timezone);

		return q;
	}

	public collection(collection: string) {
		this.setCollection(collection);
		return this;
	}

	public lookup(document: IDBLookup) {
		this.addLookup({
			$lookup: document,
		});
		return this;
	}

	public raw(documents: Document | Document[]) {
		const docs = Array.isArray(documents) ? documents : [documents];
		this["$stages"].push(...docs);

		return this;
	}

	static async transaction<T>(
		fn: (session: ClientSession) => Promise<T>,
		config: IDBTransactionConfig = {},
	): Promise<T> {
		if (!this.$connection) {
			this.setConnection(MONGOLOQUENT_DATABASE_URI);
		}

		const db = new this();
		return db.transaction(fn, config);
	}

	async transaction<T>(
		fn: (session: ClientSession) => Promise<T>,
		config: IDBTransactionConfig = {},
	): Promise<T> {
		let transactionError: any = null;
		const client: MongoClient = Database.getClient(this.getConnection());
		const session: ClientSession = client.startSession();

		const {
			transactionOptions = {},
			retries = 1, // default retry
		} = config;

		let attempt = 0;

		while (attempt < retries) {
			try {
				const result = await session.withTransaction(async () => {
					return await fn(session);
				}, transactionOptions);

				return result;
			} catch (err: any) {
				const isRetryable =
					err.hasErrorLabel?.("TransientTransactionError") ||
					err.hasErrorLabel?.("UnknownTransactionCommitResult") ||
					err.message?.includes("TransientTransactionError") ||
					err.message?.includes("UnknownTransactionCommitResult");

				attempt++;

				if (!isRetryable || attempt >= retries) {
					transactionError = err;
					throw err;
				}

				console.warn(
					`Mongoloquent Transaction retry ${attempt}/${retries} due to: ${err.message}`,
				);
			} finally {
				if (attempt >= retries || session.inTransaction() === false) {
					await session.endSession();
				}
			}
		}

		throw new MongoloquentTransactionException(
			"Transaction failed after maximum retries",
			transactionError,
		);
	}

	public static setConnection(connection: string): string {
		this.$connection = connection;
		return this.$connection;
	}

	public static setDatabaseName(name: string): string {
		this.$databaseName = name;
		return this.$databaseName;
	}

	public static setTimezone(timezone: string): string {
		this.$timezone = timezone;
		return this.$timezone;
	}
}
