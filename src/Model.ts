import {
	AggregationCursor,
	BulkWriteOptions,
	FindOneAndUpdateOptions,
	InsertOneOptions,
	ObjectId,
	OptionalId,
	OptionalUnlessRequiredId,
	UpdateFilter,
	UpdateOptions,
	WithId,
} from "mongodb";
import Relation from "./Relation";
import dayjs from "dayjs";
import { TIME_ZONE } from "./configs/app";

export default class Model extends Relation {
	/**
	 * @note This property defines timestamps for the document.
	 *
	 * @var string
	 */
	protected static $useTimestamps: boolean = false;

	/**
	 * @note This property defines timezones for the document.
	 *
	 * @var string
	 */
	protected static $timezone: string = TIME_ZONE;

	/**
	 * @note This property defines the name of the "created at" column.
	 *
	 * @var string
	 */
	protected static $CREATED_AT = "CREATED_AT";

	/**
	 * @note This property defines the name of the "updated at" column.
	 *
	 * @var string
	 */
	protected static $UPDATED_AT = "UPDATED_AT";

	/**
	 * @note This method aggregates the query stages and lookups, then executes the aggregation pipeline.
	 *
	 * @return Promise<AggregationCursor<Document>>
	 */
	static async aggregate() {
		// Check if soft delete is enabled and apply necessary filters
		this.checkSoftDelete();
		// Generate the columns to be selected in the query
		this.generateColumns();
		// Generate the columns to be excluded from the query
		this.generateExcludes();
		// Generate the where conditions for the query
		this.generateWheres();
		// Generate the order by conditions for the query
		this.generateOrders();
		// Generate the group by conditions for the query
		this.generateGroups();

		// Get the collection from the database
		const collection = this.getCollection();
		// Execute the aggregation pipeline with the generated stages and lookups
		const aggregate = collection.aggregate([...this.$stages, ...this.$lookups]);

		// Reset the query and relation states
		this.resetQuery();
		this.resetRelation();

		return aggregate;
	}

	/**
	 * @note This method retrieves all documents from the collection, excluding soft-deleted ones if applicable.
	 *
	 * @return Promise<WithId<Document>[]>
	 */
	static async all() {
		// Get the collection from the database
		const collection = this.getCollection();

		let query = {};

		// If soft delete is enabled, exclude soft-deleted documents
		if (this.$useSoftDelete) query = { isDeleted: false };

		// Retrieve all documents matching the query
		return await collection.find(query).toArray();
	}

	/**
	 * @note This method retrieves documents based on the specified columns and query stages.
	 *
	 * @param columns - The columns to retrieve.
	 * @return Promise<Document[]>
	 */
	static async get(columns: string | string[] = []) {
		try {
			// Add the specified columns to the query
			if (Array.isArray(columns)) this.$columns.push(...columns);
			else this.$columns.push(columns);

			// Execute the aggregation pipeline
			const aggregate = await this.aggregate();

			// Convert the aggregation cursor to an array of documents
			return await aggregate.toArray();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @note This method retrieves the first document that matches the query criteria.
	 *
	 * @param columns - The columns to retrieve.
	 * @return Promise<Document|null>
	 */
	static async first(columns: string | string[] = []) {
		try {
			// Retrieve the documents based on the specified columns
			const data = await this.get(columns);
			// Return the first document if it exists, otherwise return null
			if (data.length > 0) {
				return data[0];
			}

			return null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @note This method retrieves a document by its ID.
	 *
	 * @param id - The id of the item to retrieve.
	 * @return Promise<Document|null>
	 */
	static async find(id: string | ObjectId) {
		try {
			// Add a where condition to filter by the specified ID
			this.where("_id", id);

			// Retrieve the documents matching the query
			const data = await this.get();
			// Return the first document if it exists, otherwise return null
			if (data.length > 0) {
				return data[0];
			}

			return null;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @note This method retrieves the values of a specific column from the query results.
	 *
	 * @param column - The column to pluck.
	 * @return Promise<any>
	 */
	static async pluck(column: string): Promise<any> {
		try {
			// Retrieve the documents matching the query
			const data = await this.get();

			// Map the documents to extract the values of the specified column
			return data.map((el) => el[column]);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @note This method inserts a new document into the collection, applying timestamps and soft delete if applicable.
	 *
	 * @param doc - The document to insert.
	 * @param options - Optional insert options.
	 * @return Promise<WithId<Document>>
	 */
	public static async insert(
		doc: object,
		options?: InsertOneOptions
	): Promise<object> {
		// Get the collection from the database
		const collection = this.getCollection();

		// Apply timestamps to the document if enabled
		let newDoc = this.checkUseTimestamps(doc);
		// Apply soft delete fields to the document if enabled
		newDoc = this.checkUseSoftdelete(newDoc);

		// Insert the document into the collection
		const data = await collection.insertOne(newDoc, options);

		// Return the inserted document with its ID
		return { _id: data.insertedId, ...doc };
	}

	/**
	 * @note This method is an alias for the insert method.
	 *
	 * @param doc - The document to save.
	 * @param options - Optional insert options.
	 * @return Promise<WithId<Document>>
	 */
	public static async save(
		doc: object,
		options?: InsertOneOptions
	): Promise<object> {
		return this.insert(doc, options);
	}

	/**
	 * @note This method is an alias for the insert method.
	 *
	 * @param doc - The document to create.
	 * @param options - Optional insert options.
	 * @return Promise<WithId<Document>>
	 */
	public static async create(
		doc: object,
		options?: InsertOneOptions
	): Promise<object> {
		return this.insert(doc, options);
	}

	/**
	 * @note This method inserts multiple documents into the collection, applying timestamps and soft delete if applicable.
	 *
	 * @param docs - The documents to insert.
	 * @param options - Optional bulk write options.
	 * @return Promise<ObjectId[]>
	 */
	public static async insertMany(
		docs: OptionalId<Document>[],
		options?: BulkWriteOptions
	): Promise<ObjectId[]> {
		// Get the collection from the database
		const collection = this.getCollection();

		// Apply timestamps and soft delete fields to each document if enabled
		const newDocs = docs.map((el) => {
			let newEl = this.checkUseTimestamps(el);
			newEl = this.checkUseSoftdelete(newEl);

			return newEl;
		});

		// Insert the documents into the collection
		const data = await collection.insertMany(newDocs, options);

		const result: ObjectId[] = [];

		// Extract the inserted IDs from the result
		for (var key in data.insertedIds) {
			result.push(data.insertedIds[key]);
		}

		return result;
	}

	/**
	 * @note This method updates a document in the collection, applying timestamps and soft delete if applicable.
	 *
	 * @param doc - The document to update.
	 * @param options - Optional update options.
	 * @return Promise<WithId<Document> | null>
	 */
	public static async update(
		doc: UpdateFilter<Document>,
		options?: FindOneAndUpdateOptions
	) {
		// Get the collection from the database
		const collection = this.getCollection();

		// Generate the where conditions for the query
		this.generateWheres();
		let filter = {};
		if (this.$stages.length > 0) filter = this.$stages[0].$match;

		// Apply timestamps and soft delete fields to the document if enabled
		let newDoc = this.checkUseTimestamps(doc, false);
		newDoc = this.checkUseSoftdelete(newDoc);

		// Update the document in the collection
		const data = await collection.findOneAndUpdate(
			{ ...filter },
			{
				$set: {
					...newDoc,
				},
			},
			{
				...options,
				returnDocument: "after",
			}
		);

		// Reset the query state
		this.resetQuery();
		return data;
	}

	/**
	 * @note This method updates multiple documents in the collection, applying timestamps and soft delete if applicable.
	 *
	 * @param doc - The documents to update.
	 * @param options - Optional update options.
	 * @return Promise<{ modifiedCount: number }>
	 */
	public static async updateMany(
		doc: UpdateFilter<Document>,
		options?: UpdateOptions
	): Promise<{ modifiedCount: number }> {
		// Get the collection from the database
		const collection = this.getCollection();

		// Generate the where conditions for the query
		this.generateWheres();
		let filter = {};
		if (this.$stages.length > 0) filter = this.$stages[0].$match;

		// Apply timestamps and soft delete fields to the documents if enabled
		let newDoc = this.checkUseTimestamps(doc, false);
		newDoc = this.checkUseSoftdelete(newDoc);

		// Update the documents in the collection
		const data = await collection.updateMany(
			{ ...filter },
			{
				$set: {
					...newDoc,
				},
			},
			options
		);

		// Reset the query state
		this.resetQuery();

		return {
			modifiedCount: data.modifiedCount,
		};
	}

	/**
	 * @note This method deletes a document from the collection, applying soft delete if applicable.
	 *
	 * @return Promise<WithId<Document> | null>
	 */
	public static async delete() {
		// Get the collection from the database
		const collection = this.getCollection();

		// If soft delete is enabled, update the document to mark it as deleted
		if (this.$useSoftDelete) {
			return this.update({});
		}

		// Generate the where conditions for the query
		this.generateWheres();
		let filter = {};
		if (this.$stages.length > 0) filter = this.$stages[0].$match;

		// Delete the document from the collection
		const data = await collection.findOneAndDelete(filter);
		// Reset the query state
		this.resetQuery();

		return data || null;
	}

	/**
	 * @note This method deletes multiple documents from the collection, applying soft delete if applicable.
	 *
	 * @return Promise<{ deletedCount: number }>
	 */
	static async deleteMany(): Promise<{ deletedCount: number }> {
		// Get the collection from the database
		const collection = this.getCollection();

		// If soft delete is enabled, update the documents to mark them as deleted
		if (this.$useSoftDelete) {
			const data = await this.updateMany({});
			return {
				deletedCount: data.modifiedCount,
			};
		}

		// Generate the where conditions for the query
		this.generateWheres();
		let filter = {};
		if (this.$stages.length > 0) filter = this.$stages[0].$match;

		// Delete the documents from the collection
		const data = await collection.deleteMany(filter);
		// Reset the query state
		this.resetQuery();

		return {
			deletedCount: data.deletedCount,
		};
	}

	/**
	 * @note This method deletes documents by their IDs, applying soft delete if applicable.
	 *
	 * @param ids - The ids of the documents to destroy.
	 * @return Promise<{ deletedCount: number }>
	 */
	static async destroy(
		ids: string | string[] | ObjectId | ObjectId[]
	): Promise<{ deletedCount: number }> {
		let filter = [];

		// Convert the IDs to ObjectId instances if necessary
		if (!Array.isArray(ids)) {
			filter = [new ObjectId(ids)];
		} else {
			filter = ids.map((el) => new ObjectId(el));
		}

		// If soft delete is enabled, update the documents to mark them as deleted
		if (this.$useSoftDelete) {
			const data = await this.whereIn("_id", filter).updateMany({});
			return {
				deletedCount: data.modifiedCount,
			};
		}

		// Delete the documents from the collection
		return await this.whereIn("_id", filter).deleteMany();
	}

	/**
	 * @note This method forcefully deletes documents from the collection, bypassing soft delete.
	 *
	 * This method protects developers from running forceDelete when the trait is missing.
	 *
	 * @return Promise<{ deletedCount: number }>
	 */
	public static async forceDelete(): Promise<{ deletedCount: number }> {
		// Get the collection from the database
		const collection = this.getCollection();
		// Generate the where conditions for the query
		this.generateWheres();

		let filter = {};
		if (this.$stages.length > 0) filter = this.$stages[0].$match;

		// Forcefully delete the documents from the collection
		const data = await collection.deleteMany(filter);

		// Reset the query state
		this.resetQuery();
		return {
			deletedCount: data.deletedCount,
		};
	}

	/**
	 * @note This method forcefully deletes documents by their IDs, bypassing soft delete.
	 *
	 * This method protects developers from running forceDestroy when the trait is missing.
	 *
	 * @param ids - The ids of the documents to destroy.
	 * @return Promise<{ deletedCount: number }>
	 */
	public static async forceDestroy(
		ids: string | string[] | ObjectId | ObjectId[]
	): Promise<{ deletedCount: number }> {
		let filter = [];

		// Convert the IDs to ObjectId instances if necessary
		if (!Array.isArray(ids)) {
			filter = [new ObjectId(ids)];
		} else {
			filter = ids.map((el) => new ObjectId(el));
		}

		// If soft delete is enabled, update the documents to mark them as deleted
		if (this.$useSoftDelete) {
			const data = await this.whereIn("_id", filter).updateMany({});
			return {
				deletedCount: data.modifiedCount,
			};
		}

		// Forcefully delete the documents from the collection
		return await this.whereIn("_id", filter).deleteMany();
	}

	/**
	 * @note This method restores soft deleted documents by setting isDeleted to false.
	 *
	 * @return Promise<{ modifiedCount: number }>
	 */
	static async restore(): Promise<{ modifiedCount: number }> {
		// Only include soft-deleted documents in the query
		this.onlyTrashed();

		// Update the documents to mark them as not deleted
		return await this.updateMany({ isDeleted: false });
	}

	/**
	 * @note This method retrieves the maximum value of a specified field.
	 *
	 * @param field - The field to get the maximum value of.
	 * @param type - The type of aggregation (default is "max").
	 * @return Promise<number>
	 */
	static async max(field: string, type: string = "max"): Promise<number> {
		// Get the collection from the database
		const collection = this.getCollection();
		// Generate the where conditions for the query
		this.generateWheres();

		// Execute the aggregation pipeline to get the maximum value of the specified field
		const aggregate = await collection
			.aggregate([
				...this.$stages,
				{
					$group: {
						_id: null,
						[type]: {
							[`$${type}`]: `$${field}`,
						},
					},
				},
			])
			.next();

		// Reset the query state
		this.resetQuery();

		return aggregate?.[type] || 0;
	}

	/**
	 * @note This method retrieves the minimum value of a specified field.
	 *
	 * @param field - The field to get the minimum value of.
	 * @return Promise<number>
	 */
	static async min(field: string): Promise<number> {
		return this.max(field, "min");
	}

	/**
	 * @note This method retrieves the average value of a specified field.
	 *
	 * @param field - The field to get the average value of.
	 * @return Promise<number>
	 */
	static async avg(field: string): Promise<number> {
		return this.max(field, "avg");
	}

	/**
	 * @note This method retrieves the sum of a specified field.
	 *
	 * @param field - The field to get the sum of.
	 * @return Promise<number>
	 */
	static async sum(field: string): Promise<number> {
		return this.max(field, "sum");
	}

	/**
	 * @note This method retrieves the count of documents in the collection.
	 *
	 * @return Promise<number>
	 */
	static async count(): Promise<number> {
		// Get the collection from the database
		const collection = this.getCollection();

		// Generate the where conditions for the query
		this.generateWheres();

		// Execute the aggregation pipeline to get the count of documents
		const aggregate = await collection
			.aggregate([
				...this.$stages,
				{
					$count: "total",
				},
			])
			.next();

		// Reset the query state
		this.resetQuery();
		return aggregate?.total || 0;
	}

	/**
	 * @note This method applies created_at and updated_at timestamps to the document if $useTimestamps is true.
	 *
	 * @param doc - The document to check.
	 * @param isNew - Whether the document is new.
	 * @return object
	 */
	public static checkUseTimestamps(doc: object, isNew: boolean = true): object {
		if (this.$useTimestamps) {
			const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
			const now = dayjs.utc(current).tz(this.$timezone).toDate();

			if (!isNew) return { ...doc, [this.$UPDATED_AT]: now };

			return { ...doc, [this.$CREATED_AT]: now, [this.$UPDATED_AT]: now };
		}

		return doc;
	}

	/**
	 * @note This method applies isDeleted and deleted_at fields to the document if $useSoftDelete is true.
	 *
	 * @param doc - The document to check.
	 * @param isDeleted - Whether the document is deleted.
	 * @return object
	 */
	public static checkUseSoftdelete(
		doc: object,
		isDeleted: boolean = false
	): object {
		if (this.$useSoftDelete) {
			if (isDeleted) {
				const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
				const now = dayjs.utc(current).tz(this.$timezone).toDate();

				return { ...doc, [this.$IS_DELETED]: true, [this.$DELETED_AT]: now };
			}

			return { ...doc, [this.$IS_DELETED]: false };
		}

		return doc;
	}
}
