import {
  AggregationCursor,
  BulkWriteOptions,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
  UpdateFilter,
  UpdateOptions,
  Document,
  WithId,
} from "mongodb";
import Relation from "./Relation";
import dayjs from "./utils/dayjs";
import { TIMEZONE } from "./configs/app";
import { IModelPaginate } from "./interfaces/IModel";
import { IRelationTypes } from "./interfaces/IRelation";
import ModelNotFoundException from "./exceptions/ModelNotFoundException";

/**
 * Type utility that handles schema field selection for MongoDB documents
 * @template K - Key(s) to select from schema
 * @template T - Model type with schema definition
 * @returns Selected fields from schema type
 */
type SelectResult<K, T extends { $schema: unknown }> = K extends
  | undefined
  | void
  ? T["$schema"]
  : K extends [] | readonly []
  ? T["$schema"]
  : K extends keyof T["$schema"]
  ? Pick<T["$schema"], K>
  : K extends (keyof T["$schema"])[] | readonly (keyof T["$schema"])[]
  ? K extends { length: 0 }
    ? T["$schema"]
    : Pick<T["$schema"], K[number]>
  : T["$schema"];

/*
 * Base Model class that provides MongoDB operations and relationship functionality
 * Extends the Relation class to support various types of relationships between models
 *
 * @class
 * @extends {Relation}
 * @description Core database operations and model functionality:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Soft deletes
 * - Timestamps
 * - Query building
 * - Aggregations
 * - Pagination
 * - Model relationships
 */
export default class Model extends Relation {
  /**
   * Controls whether timestamps are automatically managed
   * When true, timestamps will be automatically set on document creation and updates
   *
   * @protected
   * @static
   * @type {boolean}
   * @default true
   */
  protected static $useTimestamps: boolean = true;

  /**
   * Defines the timezone for timestamp fields
   *
   * @protected
   * @static
   * @type {string}
   * @default TIMEZONE
   */
  protected static $timezone: string = TIMEZONE;

  /**
   * Field name for creation timestamp
   *
   * @protected
   * @static
   * @type {string}
   * @default "createdAt"
   */
  protected static $createdAt = "createdAt";

  /**
   * Field name for update timestamp
   *
   * @protected
   * @static
   * @type {string}
   * @default "updatedAt"
   */
  protected static $updatedAt = "updatedAt";

  /**
   * Retrieves all documents from the collection, excluding soft-deleted ones if applicable
   *
   * @public
   * @static
   * @async
   * @return Promise<T["$schema"][]> Array of documents
   * @throws {Error} When fetching fails
   */
  public static async all<T extends typeof Model>(
    this: T
  ): Promise<T["$schema"][]> {
    try {
      return this.get();
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching all documents failed`);
    }
  }

  /**
   * Retrieves documents based on the specified columns and query stages
   *
   * @public
   * @static
   * @async
   * @param {string|string[]} [columns=[]] - The columns to retrieve
   * @returns {Promise<Document[]>} Array of documents
   * @throws {Error} When fetching fails
   */
  public static async get<
    T extends typeof Model,
    K extends
      | keyof T["$schema"]
      | (keyof T["$schema"])[]
      | undefined = undefined
  >(this: T, columns?: K) {
    try {
      // Add the specified columns to the query
      this.setColumns(columns as string[]);

      // Execute the aggregation pipeline
      const aggregate = await this.aggregate();

      // Convert the aggregation cursor to an array of documents
      return (await aggregate.toArray()) as SelectResult<K, T>[];
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  /**
   * Retrieves paginated documents from the collection
   *
   * @public
   * @static
   * @async
   * @param {number} [page=1] - The page number to retrieve
   * @param {number} [limit=this.$limit] - The number of documents per page
   * @returns {Promise<IModelPaginate>} Paginated result
   * @throws {Error} When pagination fails
   */
  public static async paginate<T extends typeof Model>(
    this: T,
    page: number = 1,
    limit: number = this.$limit
  ): Promise<IModelPaginate<T["$schema"]>> {
    try {
      await this.checkRelation();
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
      const stages = this.getStages();
      const lookups = this.getLookups();
      const aggregate = collection.aggregate([...stages, ...lookups]);

      // Get the total count of documents
      let totalResult = await collection
        .aggregate([
          ...stages,
          {
            $count: "total",
          },
        ])
        .next();
      let total = 0;

      if (totalResult?.total) total = totalResult?.total;

      // Get the paginated documents
      const result = await aggregate
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      // Reset the query and relation states
      this.reset();

      return {
        data: result,
        meta: {
          total,
          page,
          limit,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Pagination failed`);
    }
  }

  /**
   * Retrieves the first document that matches the query criteria
   *
   * @public
   * @static
   * @async
   * @param {string|string[]} [columns=[]] - The columns to retrieve
   * @returns {Promise<Document|null>} The first document or null if not found
   * @throws {Error} When fetching fails
   */
  public static async first<
    T extends typeof Model,
    K extends
      | keyof T["$schema"]
      | [keyof T["$schema"], ...(keyof T["$schema"])[]]
      | undefined = undefined
  >(this: T, columns?: K) {
    try {
      // Retrieve the documents based on the specified columns
      const data = await this.get(columns);

      // Return the first document if it exists, otherwise return null
      if (data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching first document failed`);
    }
  }

  /**
   * Retrieves the first document that matches the specified condition
   *
   * @public
   * @static
   * @async
   * @param {string} column - The column to check
   * @param {any} operator - The operator to use
   * @param {any} [value=null] - The value to compare
   * @returns {Promise<Document|null>} The first document or null if not found
   * @throws {Error} When fetching fails
   */
  public static async firstWhere(
    column: string,
    operator: any,
    value: any = null
  ) {
    this.where(column, operator, value);
    return this.first();
  }

  /**
   * Retrieves the first document that matches the query criteria or throws an exception if not found
   *
   * @public
   * @static
   * @async
   * @param {string|string[]} [columns=[]] - The columns to retrieve
   * @returns {Promise<Document>} The first document
   * @throws {ModelNotFoundException} When no document is found
   */
  public static async firstOrFail<
    T extends typeof Model,
    K extends
      | keyof T["$schema"]
      | [keyof T["$schema"], ...(keyof T["$schema"])[]]
      | undefined = undefined
  >(this: T, columns?: K) {
    const data = await this.first(columns);
    if (!data) throw new ModelNotFoundException();
    return data;
  }

  /**
   * Retrieves the first document that matches the specified condition or creates a new one
   *
   * @public
   * @static
   * @async
   * @param {object} doc - The document to check or create
   * @returns {Promise<Document>} The first document or the newly created document
   * @throws {Error} When fetching or creating fails
   */
  public static async firstOrCreate(doc: object) {
    const collection = this.getCollection();

    if (this.$useSoftDelete) {
      doc = { ...doc, [this.$isDeleted]: false };
    }

    const data = await collection.findOne(doc);
    if (!data) return await this.insert(doc);

    return data;
  }

  /**
   * Retrieves the first document that matches the specified condition or creates a new one
   *
   * @public
   * @static
   * @async
   * @param {object} doc - The document to check or create
   * @returns {Promise<Document>} The first document or the newly created document
   * @throws {Error} When fetching or creating fails
   */
  public static async firstOrNew(doc: object) {
    return this.firstOrCreate(doc);
  }

  /**
   * Retrieves the values of a specific column from the query results
   *
   * @public
   * @static
   * @async
   * @param {string} column - The column to pluck
   * @returns {Promise<any>} Array of values
   * @throws {Error} When plucking fails
   */
  public static async pluck<
    T extends typeof Model,
    K extends keyof T["$schema"]
  >(this: T, column: K) {
    try {
      // Retrieve the documents matching the query
      const data = await this.get();

      // Map the documents to extract the values of the specified column
      return data.map((el) => el[column]);
    } catch (error) {
      console.log(error);
      throw new Error(`Plucking column values failed`);
    }
  }

  /**
   * Inserts a new document into the collection, applying timestamps and soft delete if applicable
   *
   * @public
   * @static
   * @async
   * @param {object} doc - The document to insert
   * @param {InsertOneOptions} [options] - Optional insert options
   * @returns {Promise<WithId<Document>>} The inserted document with its ID
   * @throws {Error} When inserting fails
   */
  public static async insert<T extends typeof Model>(
    this: T,
    doc: T["$schema"],
    options?: InsertOneOptions
  ) {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Apply timestamps to the document if enabled
      let newDoc = this.checkUseTimestamps(doc);
      // Apply soft delete fields to the document if enabled
      newDoc = this.checkUseSoftdelete(newDoc);

      newDoc = this.checkRelationship(newDoc);
      // Insert the document into the collection
      const data = await collection.insertOne(newDoc, options);

      this.reset();
      // Return the inserted document with its ID
      return { _id: data.insertedId, ...newDoc } as WithId<T["$schema"]>;
    } catch (error) {
      console.log(error);
      throw new Error(`Inserting document failed`);
    }
  }

  /**
   * Alias for the insert method
   *
   * @public
   * @static
   * @async
   * @param {object} doc - The document to save
   * @param {InsertOneOptions} [options] - Optional insert options
   * @returns {Promise<WithId<Document>>} The inserted document with its ID
   * @throws {Error} When inserting fails
   */
  public static async save<T extends typeof Model>(
    this: T,
    doc: T["$schema"],
    options?: InsertOneOptions
  ) {
    return this.insert(doc, options);
  }

  /**
   * Alias for the insert method
   *
   * @public
   * @static
   * @async
   * @param {object} doc - The document to create
   * @param {InsertOneOptions} [options] - Optional insert options
   * @returns {Promise<WithId<Document>>} The inserted document with its ID
   * @throws {Error} When inserting fails
   */
  public static async create<T extends typeof Model>(
    this: T,
    doc: T["$schema"],
    options?: InsertOneOptions
  ) {
    return this.insert(doc, options);
  }

  /**
   * Inserts multiple documents into the collection, applying timestamps and soft delete if applicable
   *
   * @public
   * @static
   * @async
   * @param {object[]} docs - The documents to insert
   * @param {BulkWriteOptions} [options] - Optional bulk write options
   * @returns {Promise<ObjectId[]>} Array of inserted document IDs
   * @throws {Error} When inserting fails
   */
  public static async insertMany<T extends typeof Model>(
    this: T,
    docs: T["$schema"][],
    options?: BulkWriteOptions
  ): Promise<ObjectId[]> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Apply timestamps and soft delete fields to each document if enabled
      const newDocs = docs.map((el) => {
        let newEl = this.checkUseTimestamps(el);
        newEl = this.checkUseSoftdelete(newEl);
        newEl = this.checkRelationship(newEl);

        return newEl;
      });

      // Insert the documents into the collection
      const data = await collection.insertMany(newDocs, options);

      const result: ObjectId[] = [];

      // Extract the inserted IDs from the result
      for (var key in data.insertedIds) {
        result.push(data.insertedIds[key]);
      }

      this.reset();
      return result;
    } catch (error) {
      console.log(error);
      throw new Error(`Inserting multiple documents failed`);
    }
  }

  /**
   * Updates or creates a document based on the specified condition
   *
   * @public
   * @static
   * @async
   * @param {object} doc - The document to update or create
   * @returns {Promise<Document>} The updated or newly created document
   * @throws {Error} When updating or creating fails
   */
  static async updateOrCreate(
    filter: { [key: string]: any },
    doc: { [key: string]: any }
  ) {
    for (var key in filter) {
      if (doc.hasOwnProperty(key)) {
        this.where(key, filter[key]);
      }
    }

    const data = await this.update(doc);
    if (data) return data;

    return this.insert(doc);
  }

  /**
   * Updates a single document in the collection that matches the query criteria
   * - Applies timestamps if enabled
   * - Handles soft delete state
   * - Supports relationship-aware updates
   * - Returns the updated document
   *
   * @public
   * @static
   * @async
   * @param {UpdateFilter<Document>} doc - The update operations to apply
   * @param {FindOneAndUpdateOptions} [options={}] - MongoDB update options
   * @returns {Promise<Document|null>} The updated document or null if not found
   * @throws {Error} When update operation fails
   * @example
   * ```typescript
   * // Update a document
   * await Model.where('_id', id).update({ name: 'updated' });
   *
   * // Update with options
   * await Model.update(doc, { upsert: true });
   * ```
   */
  public static async update<T extends typeof Model>(
    this: T,
    doc: Partial<T["$schema"]>,
    options?: FindOneAndUpdateOptions
  ) {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Generate the where conditions for the query
      await this.checkRelation();
      // Check if soft delete is enabled and apply necessary filters
      this.checkSoftDelete();
      // Generate the columns to be selected in the query
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;
      // Apply timestamps and soft delete fields to the documents if enabled
      let newDoc = this.checkUseTimestamps(doc, false);
      newDoc = this.checkUseSoftdelete(newDoc);
      delete (newDoc as any)._id;

      // Update the documents in the collection
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

      // Reset the query and relation states
      this.reset();
      return data as WithId<T["$schema"]> | null;
    } catch (error) {
      console.log(error);
      throw new Error(`Updating documents failed`);
    }
  }

  /**
   * Updates multiple documents in the collection, applying timestamps and soft delete if applicable
   *
   * @public
   * @static
   * @async
   * @param {UpdateFilter<Document>} doc - The documents to update
   * @param {UpdateOptions} [options] - Optional update options
   * @returns {Promise<number>} The number of modified documents
   * @throws {Error} When updating fails
   */
  public static async updateMany<T extends typeof Model>(
    this: T,
    doc: Partial<T["$schema"]>,
    options?: UpdateOptions
  ): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Generate the where conditions for the query
      await this.checkRelation();
      // Check if soft delete is enabled and apply necessary filters
      this.checkSoftDelete();
      // Generate the columns to be selected in the query
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;
      // Apply timestamps and soft delete fields to the documents if enabled
      let newDoc = this.checkUseTimestamps(doc, false);
      newDoc = this.checkUseSoftdelete(newDoc);
      delete (newDoc as any)._id;

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

      // Reset the query and relation states
      this.reset();
      return data.modifiedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Updating multiple documents failed`);
    }
  }

  /**
   * Deletes documents by their IDs, applying soft delete if applicable
   *
   * @public
   * @static
   * @async
   * @param {string|string[]|ObjectId|ObjectId[]} ids - The ids of the documents to destroy
   * @returns {Promise<number>} The number of deleted documents
   * @throws {Error} When deleting fails
   */
  public static async destroy(
    ids: string | string[] | ObjectId | ObjectId[]
  ): Promise<number> {
    try {
      let filter = [];

      // Convert the IDs to ObjectId instances if necessary
      if (!Array.isArray(ids)) {
        filter = [new ObjectId(ids)];
      } else {
        filter = ids.map((el) => new ObjectId(el));
      }

      // Delete the documents from the collection
      return await this.whereIn("_id", filter).delete();
    } catch (error) {
      console.log(error);
      throw new Error(`Destroying documents failed`);
    }
  }

  /**
   * Deletes multiple documents from the collection, applying soft delete if applicable
   *
   * @public
   * @static
   * @async
   * @returns {Promise<number>} The number of deleted documents
   * @throws {Error} When deleting fails
   */
  public static async delete(): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();
      // Generate the where conditions for the query
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      // If soft delete is enabled, update the documents to mark them as deleted
      if (this.$useSoftDelete) {
        let doc = this.checkUseTimestamps({}, false);
        doc = this.checkUseSoftdelete(doc, true);

        const data = await collection.updateMany(
          { ...filter },
          {
            $set: {
              ...doc,
            },
          }
        );

        this.reset();

        return data.modifiedCount;
      }

      // Delete the documents from the collection
      const data = await collection.deleteMany(filter);
      // Reset the query state
      this.reset();

      return data.deletedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  /**
   * Forcefully deletes documents from the collection, bypassing soft delete
   *
   * @public
   * @static
   * @async
   * @returns {Promise<number>} The number of deleted documents
   * @throws {Error} When deleting fails
   */
  public static async forceDelete(): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();
      // Generate the where conditions for the query
      this.onlyTrashed();
      this.generateWheres();

      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      // Forcefully delete the documents from the collection
      const data = await collection.deleteMany(filter);

      // Reset the query state
      this.reset();
      return data.deletedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Force deleting documents failed`);
    }
  }

  /**
   * Forcefully deletes documents by their IDs, bypassing soft delete
   *
   * @public
   * @static
   * @async
   * @param {string|string[]|ObjectId|ObjectId[]} ids - The ids of the documents to destroy
   * @returns {Promise<number>} The number of deleted documents
   * @throws {Error} When deleting fails
   */
  public static async forceDestroy(
    ids: string | string[] | ObjectId | ObjectId[]
  ): Promise<number> {
    try {
      const collection = this.getCollection();
      let id = [];

      // Convert the IDs to ObjectId instances if necessary
      if (!Array.isArray(ids)) {
        id = [new ObjectId(ids)];
      } else {
        id = ids.map((el) => new ObjectId(el));
      }

      // Generate the where conditions for the query
      this.onlyTrashed().whereIn("_id", id);
      this.generateWheres();

      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      // Forcefully delete the documents from the collection
      const data = await collection.deleteMany(filter);

      this.reset();

      return data.deletedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Force destroying documents failed`);
    }
  }

  /**
   * Restores soft deleted documents by setting isDeleted to false
   *
   * @public
   * @static
   * @async
   * @returns {Promise<number>} The number of restored documents
   * @throws {Error} When restoring fails
   */
  public static async restore(): Promise<number> {
    try {
      // Only include soft-deleted documents in the query
      this.onlyTrashed();

      // Update the documents to mark them as not deleted
      return await this.updateMany({ [this.$isDeleted]: false });
    } catch (error) {
      console.log(error);
      throw new Error(`Restoring documents failed`);
    }
  }

  /**
   * Performs aggregation operations on a specified field
   *
   * @private
   * @static
   * @async
   * @param {string} field - The field to aggregate
   * @param {string} type - The type of aggregation (e.g., "max", "min", "avg", "sum")
   * @returns {Promise<number>} The aggregated value
   * @throws {Error} When aggregation fails
   */
  private static async aggregation<
    T extends typeof Model,
    K extends keyof T["$schema"]
  >(this: T, field: K, type: string): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();
      await this.checkRelation();
      // Check if soft delete is enabled and apply necessary filters
      this.checkSoftDelete();
      // Generate the columns to be selected in the query
      this.generateWheres();

      const stages = this.getStages();
      // Execute the aggregation pipeline to get the maximum value of the specified field
      const aggregate = await collection
        .aggregate([
          ...stages,
          {
            $group: {
              _id: null,
              [type]: {
                [`$${String(type)}`]: `$${String(field)}`,
              },
            },
          },
        ])
        .next();

      // Reset the query state
      this.reset();

      return typeof aggregate?.[type] === "number" ? aggregate[type] : 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching maximum value failed`);
    }
  }

  /**
   * Retrieves the maximum value of a specified field
   *
   * @public
   * @static
   * @async
   * @param {string} field - The field to get the maximum value of
   * @returns {Promise<number>} The maximum value
   * @throws {Error} When fetching fails
   */
  public static async max<T extends typeof Model, K extends keyof T["$schema"]>(
    this: T,
    field: K
  ): Promise<number> {
    return this.aggregation(field, "max");
  }

  /**
   * Retrieves the minimum value of a specified field
   *
   * @public
   * @static
   * @async
   * @param {string} field - The field to get the minimum value of
   * @returns {Promise<number>} The minimum value
   * @throws {Error} When fetching fails
   */
  public static async min<T extends typeof Model, K extends keyof T["$schema"]>(
    this: T,
    field: K
  ): Promise<number> {
    return this.aggregation(field, "min");
  }

  /**
   * Retrieves the average value of a specified field
   *
   * @public
   * @static
   * @async
   * @param {string} field - The field to get the average value of
   * @returns {Promise<number>} The average value
   * @throws {Error} When fetching fails
   */
  public static async avg<T extends typeof Model, K extends keyof T["$schema"]>(
    this: T,
    field: K
  ): Promise<number> {
    return this.aggregation(field, "avg");
  }

  /**
   * Retrieves the average value of a specified field
   *
   * @public
   * @static
   * @async
   * @param {string} field - The field to get the average value of
   * @returns {Promise<number>} The average value
   * @throws {Error} When fetching fails
   */
  public static async average(field: string) {
    return this.avg(field);
  }

  /**
   * Retrieves the sum of a specified field
   *
   * @public
   * @static
   * @async
   * @param {string} field - The field to get the sum of
   * @returns {Promise<number>} The sum
   * @throws {Error} When fetching fails
   */
  public static async sum<T extends typeof Model, K extends keyof T["$schema"]>(
    this: T,
    field: K
  ): Promise<number> {
    return this.aggregation(field, "sum");
  }

  /**
   * Retrieves the count of documents in the collection
   *
   * @public
   * @static
   * @async
   * @returns {Promise<number>} The count of documents
   * @throws {Error} When fetching fails
   */
  public static async count(): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      await this.checkRelation();
      // Check if soft delete is enabled and apply necessary filters
      this.checkSoftDelete();
      // Generate the columns to be selected in the query
      this.generateWheres();

      const stages = this.getStages();
      // Execute the aggregation pipeline to get the count of documents
      const aggregate = await collection
        .aggregate([
          ...stages,
          {
            $count: "total",
          },
        ])
        .next();

      // Reset the query state
      this.reset();
      return aggregate?.total || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching document count failed`);
    }
  }

  /**
   * Checks if a document contains a specific value
   *
   * @public
   * @static
   * @async
   * @param {any} value - The value to check
   * @returns {Promise<boolean>} True if the value exists, false otherwise
   * @throws {Error} When checking fails
   */
  public static async contains(value: any): Promise<boolean> {
    const collection = this.getCollection();

    // Check if soft delete is enabled and apply necessary filters
    this.checkSoftDelete();
    // Generate the columns to be selected in the query
    this.generateWheres();
    const stages = this.getStages();
    let filter = {};
    if (stages.length > 0) filter = stages[0].$match;

    const exist =
      (await collection.findOne({
        ...filter,
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: { $objectToArray: "$$ROOT" },
                  as: "field",
                  cond: { $eq: ["$$field.v", value] },
                },
              },
            },
            0,
          ],
        },
      })) !== null;

    return exist;
  }

  /**
   * Checks if a document has a specific field
   *
   * @public
   * @static
   * @async
   * @param {string} field - The field to check
   * @returns {Promise<boolean>} True if the field exists, false otherwise
   * @throws {Error} When checking fails
   */
  public static async has(field: string): Promise<boolean> {
    const collection = this.getCollection();

    // Check if soft delete is enabled and apply necessary filters
    this.checkSoftDelete();
    // Generate the columns to be selected in the query
    this.generateWheres();
    const stages = this.getStages();
    let filter = {};
    if (stages.length > 0) filter = stages[0].$match;

    const exist =
      (await collection.findOne({
        ...filter,
        $expr: {
          $gt: [
            {
              $size: {
                $filter: {
                  input: { $objectToArray: "$$ROOT" },
                  as: "field",
                  cond: { $eq: ["$$field.k", field] },
                },
              },
            },
            0,
          ],
        },
      })) !== null;

    return exist;
  }

  /**
   * Retrieves the last document that matches the query criteria
   *
   * @public
   * @static
   * @async
   * @returns {Promise<Document|null>} The last document or null if not found
   * @throws {Error} When fetching fails
   */
  public static async last() {
    const data = await this.get();
    if (data.length < 1) return null;

    return data[data.length - 1];
  }

  /**
   * Retrieves documents with only the specified fields
   *
   * @public
   * @static
   * @async
   * @param {string|string[]} fields - The fields to retrieve
   * @returns {Promise<Document[]>} Array of documents
   * @throws {Error} When fetching fails
   */
  public static async only(fields: string | string[]) {
    return this.get(fields);
  }

  /**
   * Aggregates the query stages and lookups, then executes the aggregation pipeline
   *
   * @private
   * @static
   * @async
   * @returns {Promise<AggregationCursor<Document>>} The aggregation cursor
   * @throws {Error} When aggregation fails
   */
  private static async aggregate<T extends typeof Model>(this: T) {
    try {
      await this.checkRelation();
      // Check if soft delete is enabled and apply necessary filters
      this.checkSoftDelete();
      // Generate the columns to be selected in the query
      this.generateColumns();
      // Generate the columns to be excluded from the query
      this.generateExcludes();
      // Generate the where conditions for the query
      this.generateWheres();
      this.generateOffset();
      this.generateLimit();
      // Generate the order by conditions for the query
      this.generateOrders();
      // Generate the group by conditions for the query
      this.generateGroups();

      // Get the collection from the database
      const collection = this.getCollection();
      // Execute the aggregation pipeline with the generated stages and lookups
      const stages = this.getStages();
      const lookups = this.getLookups();
      const aggregate = collection.aggregate([
        ...stages,
        ...lookups,
      ]) as AggregationCursor<T["$schema"]>;

      // Reset the query and relation states
      this.reset();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
  }

  /**
   * Helper function to validate and apply timestamps to documents
   * Handles both creation and update timestamps based on the model's configuration
   *
   * @private
   * @static
   * @param {object} doc - The document to which timestamps should be applied
   * @param {boolean} [isNew=true] - Whether this is a new document (true) or an update (false)
   * @returns {object} The document with appropriate timestamps applied
   * @example
   * ```typescript
   * // For a new document:
   * checkUseTimestamps({ name: 'test' }, true)
   * // Returns { name: 'test', createdAt: Date, updatedAt: Date }
   *
   * // For an update:
   * checkUseTimestamps({ name: 'updated' }, false)
   * // Returns { name: 'updated', updatedAt: Date }
   * ```
   */
  private static checkUseTimestamps(
    doc: object,
    isNew: boolean = true
  ): object {
    if (this.$useTimestamps) {
      const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
      const now = dayjs.utc(current).tz(this.$timezone).toDate();

      if (!isNew) return { ...doc, [this.$updatedAt]: now };

      return { ...doc, [this.$createdAt]: now, [this.$updatedAt]: now };
    }

    return doc;
  }

  /**
   * Helper function to handle soft delete functionality
   * Manages the isDeleted flag and deletedAt timestamp for soft-deletable models
   *
   * @private
   * @static
   * @param {object} doc - The document to which soft delete fields should be applied
   * @param {boolean} [isDeleted=false] - Whether to mark the document as deleted
   * @returns {object} The document with appropriate soft delete fields applied
   * @example
   * ```typescript
   * // When marking as deleted:
   * checkUseSoftdelete({ name: 'test' }, true)
   * // Returns { name: 'test', isDeleted: true, deletedAt: Date }
   *
   * // When not deleted:
   * checkUseSoftdelete({ name: 'test' }, false)
   * // Returns { name: 'test', isDeleted: false }
   * ```
   */
  private static checkUseSoftdelete(
    doc: object,
    isDeleted: boolean = false
  ): object {
    if (this.$useSoftDelete) {
      if (isDeleted) {
        const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
        const now = dayjs.utc(current).tz(this.$timezone).toDate();

        return { ...doc, [this.$isDeleted]: true, [this.$deletedAt]: now };
      }

      return { ...doc, [this.$isDeleted]: false };
    }

    return doc;
  }

  /**
   * Helper function to process relationships during document operations
   * Applies the necessary relationship fields based on the relationship type
   *
   * @private
   * @static
   * @param {object} doc - The document to process for relationships
   * @returns {object} The document with relationship fields applied
   * @example
   * ```typescript
   * // For hasMany relationship:
   * checkRelationship({ name: 'test' })
   * // Returns { name: 'test', parentId: ObjectId }
   *
   * // For morphMany relationship:
   * checkRelationship({ name: 'test' })
   * // Returns { name: 'test', morphType: 'ParentModel', morphId: ObjectId }
   * ```
   */
  private static checkRelationship(doc: object): object {
    const relationship = this.getRelationship();
    if (!relationship) return doc;

    switch (relationship.type) {
      case IRelationTypes.hasMany:
        return { ...doc, [relationship.foreignKey]: relationship.parentId };

      case IRelationTypes.belongsToMany:
        return doc;

      case IRelationTypes.hasManyThrough:
        return doc;

      case IRelationTypes.morphMany:
        return {
          ...doc,
          [relationship.morphType]: relationship.parentModelName,
          [relationship.morphId]: relationship.parentId,
        };

      case IRelationTypes.morphTo:
        return {
          ...doc,
          [relationship.morphType]: relationship.parentModelName,
          [relationship.morphId]: relationship.parentId,
        };

      case IRelationTypes.morphToMany:
        return doc;

      case IRelationTypes.morphedByMany:
        return {
          ...doc,
          [relationship.morphType]: this.name,
          [relationship.foreignKey]: relationship.parentId,
        };

      default:
        return doc;
    }
  }

  /**
   * Utility method to reset query builder and relationship states
   * Ensures clean state for subsequent queries
   *
   * @private
   * @static
   * @returns {void}
   * @example
   * ```typescript
   * // After completing a query:
   * Model.reset();
   * ```
   */
  private static reset(): void {
    const relatedModel = this.getRelatedModel();
    if (relatedModel) relatedModel.reset();

    this.resetQuery();
    this.resetRelation();
  }

  /**
   * Helper function to process relationship conditions
   * Applies the appropriate filters based on relationship type
   *
   * @private
   * @static
   * @returns {Promise<void>}
   * @example
   * ```typescript
   * // Before executing a query:
   * await Model.checkRelation();
   * ```
   */
  private static async checkRelation() {
    const relationship = this.getRelationship();

    switch (relationship?.type) {
      case IRelationTypes.hasMany:
        this.where(relationship.foreignKey, relationship.parentId);
        break;

      case IRelationTypes.belongsToMany:
        const btmColl = this.getCollection(relationship.pivotModel.$collection);

        const btmIds = await btmColl
          .find({
            [relationship.foreignPivotKey]: relationship.parentId,
          })
          .map((el) => el[relationship.relatedPivotKey])
          .toArray();

        this.whereIn("_id", btmIds);
        break;

      case IRelationTypes.hasManyThrough:
        const hmtColl = this.getCollection(
          relationship.throughModel.$collection
        );

        const hmtIds = await hmtColl
          .find({
            [relationship.foreignKey]: relationship.parentId,
          })
          .map((el) => el._id)
          .toArray();

        this.whereIn(relationship.foreignKeyThrough, hmtIds);
        break;

      case IRelationTypes.morphMany:
        this.where(relationship.morphType, relationship.parentModelName).where(
          relationship.morphId,
          relationship.parentId
        );
        break;

      case IRelationTypes.morphToMany:
        const mtmColl = this.getCollection(relationship.morphCollectionName);
        const key = `${relationship.model.name.toLowerCase()}Id`;

        const mtmIds = await mtmColl
          .find({
            [relationship.morphType]: relationship.parentModelName,
            [relationship.morphId]: relationship.parentId,
          })
          .map((el) => el[key])
          .toArray();

        this.whereIn("_id", mtmIds);
        break;

      case IRelationTypes.morphedByMany:
        const mbmColl = this.getCollection(relationship.morphCollectionName);

        const mbmIds = await mbmColl
          .find({
            [relationship.morphType]: this.name,
            [relationship.foreignKey]: relationship.parentId,
          })
          .map((el) => el[relationship.morphId])
          .toArray();

        this.whereIn("_id", mbmIds);
        break;

      default:
        break;
    }
  }
}
