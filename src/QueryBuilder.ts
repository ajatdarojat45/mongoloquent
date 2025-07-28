import {
  BulkWriteOptions,
  DeleteOptions,
  Document,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateOptions,
} from "mongodb";

import Collection from "./Collection";
import Database from "./Database";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
  TIMEZONE,
} from "./configs/app";
import { MongoloquentNotFoundException } from "./exceptions/MongoloquentException";
import { IModelPaginate } from "./interfaces/IModel";
import { IQueryOrder, IQueryWhere } from "./interfaces/IQuery";
import { IRelationOptions } from "./interfaces/IRelation";
import { FormSchema } from "./types/schema";
import dayjs from "./utils/dayjs";
import operators from "./utils/operators";

/**
 * QueryBuilder class for MongoDB operations with Mongoloquent
 * Provides a fluent interface for building MongoDB queries with advanced features like
 * soft deletes, timestamps, relationships, and more.
 *
 * @template T The document type that this query will operate on
 */
export default class QueryBuilder<T> {
  /** Timezone setting for dates */
  protected $timezone: string = "";
  /** MongoDB connection string */
  protected $connection: string = "";
  /** Database name */
  protected $databaseName: string = "";
  /** Collection name */
  protected $collection: string = "";
  /** Flag to enable timestamps */
  protected $useTimestamps: boolean = true;
  /** Flag to enable soft delete functionality */
  protected $useSoftDelete: boolean = false;

  /** Field name for the createdAt timestamp */
  private $createdAt: string = "createdAt";
  /** Field name for the updatedAt timestamp */
  private $updatedAt: string = "updatedAt";
  /** Aggregation pipeline stages */
  private $stages: Document[] = [];
  /** Selected columns to include in result */
  private $columns: (keyof T)[] = [];
  /** Columns to exclude from result */
  private $excludes: (keyof T)[] = [];
  /** Where conditions for query */
  private $wheres: IQueryWhere[] = [];
  /** Order by specifications */
  private $orders: IQueryOrder[] = [];
  /** Group by specifications */
  private $groups: (keyof T)[] = [];
  /** Flag to include soft deleted documents */
  private $withTrashed: boolean = false;
  /** Flag to only retrieve soft deleted documents */
  private $onlyTrashed: boolean = false;
  /** Number of documents to skip */
  private $offset: number = 0;

  /** Document ID */
  protected $id: string | ObjectId | null = null;
  /** Original document data */
  protected $original: Partial<T> = {};
  /** Changes made to the document */
  protected $changes: Partial<Record<keyof T, any>> = {};
  /** Lookup stages for aggregation pipelines */
  protected $lookups: Document[] = [];
  /** Field name for the isDeleted flag */
  protected $isDeleted: string = "isDeleted";
  /** Field name for the deletedAt timestamp */
  protected $deletedAt: string = "deletedAt";
  /** Number of documents to limit in query */
  protected $limit: number = 0;
  /** The model's default values for attributes */
  protected $attributes: Partial<T> = {};
  /** Alias for relationship */
  protected $alias: string = "";
  /** Relationship options */
  protected $options: IRelationOptions = {};

  /**
   * Constructor for the QueryBuilder class
   * Initializes properties from class static properties
   */
  constructor() {
    this.$timezone = this.$timezone || TIMEZONE;
    this.$connection = this.$connection || MONGOLOQUENT_DATABASE_URI;
    this.$databaseName = this.$databaseName || MONGOLOQUENT_DATABASE_NAME;
    this.$collection =
      this.$collection || `${this.constructor.name.toLowerCase()}s`;
  }

  /**
   * Gets the MongoDB collection
   * @param {string} [collection] - Optional collection name to override the default
   * @returns {import('mongodb').Collection<FormSchema<T>>} MongoDB collection object
   * @public
   */
  public getCollection(collection?: string) {
    const db = Database.getDb(this.$connection, this.$databaseName);
    return db.collection<FormSchema<T>>(collection || this.$collection);
  }

  /**
   * Inserts a document into the collection
   * @param {FormSchema<T>} doc - Document to insert
   * @param {InsertOneOptions} [options] - MongoDB insert options
   * @returns {Promise<T>} Inserted document with _id
   * @throws {Error} If insertion fails
   */
  public async insert(doc: FormSchema<T>, options?: InsertOneOptions) {
    try {
      const collection = this.getCollection();
      let newDoc = this.checkUseTimestamps(doc);
      newDoc = this.checkUseSoftdelete(newDoc);

      if (typeof this.$attributes === "object")
        newDoc = { ...newDoc, ...this.$attributes };

      const data = await collection?.insertOne(
        newDoc as OptionalUnlessRequiredId<FormSchema<T>>,
        options,
      );

      this.resetQuery();
      return { _id: data?.insertedId as ObjectId, ...newDoc } as T;
    } catch (error) {
      throw new Error(`Inserting document failed`);
    }
  }

  /**
   * Alias for insert - creates a new document in the collection
   * @param {FormSchema<T>} doc - Document to create
   * @param {InsertOneOptions} [options] - MongoDB insert options
   * @returns {Promise<T>} Created document with _id
   */
  public async create(
    doc: FormSchema<T>,
    options?: InsertOneOptions,
  ): Promise<T> {
    return this.insert(doc, options);
  }

  /**
   * Inserts multiple documents into the collection
   * @param {FormSchema<T>[]} docs - Array of documents to insert
   * @param {BulkWriteOptions} [options] - MongoDB bulk write options
   * @returns {Promise<ObjectId[]>} Array of inserted document IDs
   * @throws {Error} If bulk insertion fails
   */
  public async insertMany(
    docs: FormSchema<T>[],
    options?: BulkWriteOptions,
  ): Promise<ObjectId[]> {
    try {
      const collection = this.getCollection();
      const newDocs = docs.map((el) => {
        let newEl = this.checkUseTimestamps(el);
        newEl = this.checkUseSoftdelete(newEl);

        if (typeof this.$attributes === "object")
          newEl = { ...newEl, ...this.$attributes };

        return newEl;
      });

      // Insert the documents into the collection
      const data = await collection?.insertMany(
        newDocs as OptionalUnlessRequiredId<FormSchema<T>>[],
        options,
      );

      const result: ObjectId[] = [];

      // Extract the inserted IDs from the result
      for (const key in data?.insertedIds) {
        result.push(
          data?.insertedIds[key as unknown as keyof typeof data.insertedIds],
        );
      }

      this.resetQuery();
      return result;
    } catch (error) {
      throw new Error(`Inserting multiple documents failed`);
    }
  }

  /**
   * Alias for insertMany - creates multiple documents in the collection
   * @param {FormSchema<T>[]} docs - Array of documents to create
   * @param {BulkWriteOptions} [options] - MongoDB bulk write options
   * @returns {Promise<ObjectId[]>} Array of created document IDs
   */
  public async createMany(
    docs: FormSchema<T>[],
    options?: BulkWriteOptions,
  ): Promise<ObjectId[]> {
    return this.insertMany(docs, options);
  }

  /**
   * Updates a document in the collection based on the current query
   * @param {Partial<FormSchema<T>>} doc - Document fields to update
   * @param {FindOneAndUpdateOptions} [options={}] - MongoDB findOneAndUpdate options
   * @returns {Promise<Document>} Updated document
   * @throws {Error} If update fails
   */
  public async update(
    doc: Partial<FormSchema<T>>,
    options: FindOneAndUpdateOptions = {},
  ) {
    try {
      const collection = this.getCollection();
      this.checkSoftDelete();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;
      let newDoc = this.checkUseTimestamps(doc, false);
      newDoc = this.checkUseSoftdelete(newDoc);
      delete (newDoc as any)._id;

      const data = await collection.findOneAndUpdate(
        { ...filter },
        {
          $set: {
            ...(newDoc as Partial<T>),
          },
        },
        {
          ...options,
          returnDocument: "after",
        },
      );

      // Reset the query and relation states
      this.resetQuery();
      return data;
    } catch (error) {
      throw new Error(`Updating documents failed`);
    }
  }

  /**
   * Updates a document if it exists, otherwise creates it
   * @param {Partial<FormSchema<T>>} filter - Filter to find the document
   * @param {Partial<FormSchema<T>>} [doc] - Document fields to update or insert
   * @param {FindOneAndUpdateOptions | InsertOneOptions} [options] - MongoDB options
   * @returns {Promise<Document>} Updated or created document
   */
  async updateOrCreate(
    filter: Partial<FormSchema<T>>,
    doc?: Partial<FormSchema<T>>,
    options?: FindOneAndUpdateOptions | InsertOneOptions,
  ) {
    for (var key in filter) {
      if (filter.hasOwnProperty(key)) {
        this.where(key as keyof T, filter[key as keyof typeof filter]);
      }
    }

    const payload = { ...filter, ...doc };

    const data = await this.update(payload, options);
    if (data) return data;

    return this.insert(payload as FormSchema<T>, options);
  }

  /**
   * Alias for updateOrCreate
   * @param {Partial<FormSchema<T>>} filter - Filter to find the document
   * @param {Partial<FormSchema<T>>} [doc] - Document fields to update or insert
   * @param {FindOneAndUpdateOptions | InsertOneOptions} [options] - MongoDB options
   * @returns {Promise<Document>} Updated or created document
   */
  async updateOrInsert(
    filter: Partial<FormSchema<T>>,
    doc?: Partial<FormSchema<T>>,
    options?: FindOneAndUpdateOptions | InsertOneOptions,
  ) {
    return this.updateOrCreate(filter, doc, options);
  }

  /**
   * Updates multiple documents in the collection matching the current query
   * @param {Partial<FormSchema<T>>} doc - Document fields to update
   * @param {UpdateOptions} [options] - MongoDB updateMany options
   * @returns {Promise<number>} Number of documents modified
   * @throws {Error} If bulk update fails
   */
  public async updateMany(
    doc: Partial<FormSchema<T>>,
    options?: UpdateOptions,
  ): Promise<number> {
    try {
      const collection = this.getCollection();

      this.checkSoftDelete();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;
      let newDoc = this.checkUseTimestamps(doc, false);
      newDoc = this.checkUseSoftdelete(newDoc);
      delete (newDoc as any)._id;

      // Update the documents in the collection
      const data = await collection.updateMany(
        { ...filter },
        {
          $set: {
            ...(newDoc as Partial<T>),
          },
        },
        options,
      );

      // Reset the query and relation states
      this.resetQuery();
      return data.modifiedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Updating multiple documents failed`);
    }
  }

  /**
   * Saves the current instance to the database (insert or update)
   * @param {UpdateOptions | FindOneAndUpdateOptions} [options] - MongoDB options for update
   * @returns {Promise<T|Document>} Saved document
   */
  public async save(options?: UpdateOptions | FindOneAndUpdateOptions) {
    let payload = {};
    for (const key in this.$changes) {
      if (key.startsWith("$") || key === "_id") continue;
      payload = {
        ...payload,
        // @ts-ignore
        [key]: this.$changes[key],
      };
    }

    if (Object.keys(this.$original).length === 0) {
      const result = await this.insert(payload as FormSchema<T>, options);
      this.$original = { ...result };
      Object.assign(this, result);
      // @ts-ignore
      this.$id = this._id;
      return result;
    } else {
      // @ts-ignore
      const id = this.$original?._id;
      return this.where("_id" as keyof T, id).update(
        payload as FormSchema<T>,
        options as FindOneAndUpdateOptions,
      );
    }
  }

  /**
   * Deletes documents matching the current query (soft delete if enabled)
   * @param {DeleteOptions | UpdateOptions} [options] - MongoDB options for deletion
   * @returns {Promise<number>} Number of documents deleted or soft-deleted
   * @throws {Error} If deletion fails
   */
  public async delete(
    options?: DeleteOptions | UpdateOptions,
  ): Promise<number> {
    try {
      const collection = this.getCollection();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      if (this.$useSoftDelete) {
        let doc = this.checkUseTimestamps({}, false);
        doc = this.checkUseSoftdelete(doc, true);

        const data = await collection?.updateMany(
          { ...filter },
          {
            $set: {
              ...(doc as Partial<T>),
            },
          },
          options,
        );

        this.resetQuery();

        return data?.modifiedCount || 0;
      }

      const data = await collection?.deleteMany(filter, options);
      this.resetQuery();

      return data?.deletedCount || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  /**
   * Deletes documents matching the current query
   * @param {DeleteOptions} [options] - MongoDB options for deletion
   * @returns {Promise<number>} Number of documents deleted
   * @throws {Error} If deletion fails
   */
  public async forceDelete(options?: DeleteOptions): Promise<number> {
    try {
      const collection = this.getCollection();
      this.generateWheres();
      const stages = this.getStages();
      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      const data = await collection?.deleteMany(filter, options);
      this.resetQuery();

      return data?.deletedCount || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  /**
   * Deletes documents by IDs (soft delete if enabled)
   * @param {...(string|ObjectId|Array<string|ObjectId>)[]} ids - IDs of documents to delete
   * @returns {Promise<number>} Number of documents deleted or soft-deleted
   */
  public async destroy(
    ...ids: (string | ObjectId | (string | ObjectId)[])[]
  ): Promise<number> {
    let flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
      return acc.concat(Array.isArray(id) ? id : [id]);
    }, []);

    flattenedIds = flattenedIds.map((el) => {
      if (typeof el === "string") return new ObjectId(el);
      return el;
    });

    this.where("_id" as keyof T, "in", flattenedIds);
    return this.delete();
  }

  /**
   * Permanently deletes soft-deleted documents by IDs
   * @param {...(string|ObjectId|Array<string|ObjectId>)[]} ids - IDs of documents to permanently delete
   * @returns {Promise<number>} Number of documents permanently deleted
   * @throws {Error} If force deletion fails
   */
  public async forceDestroy(
    ...ids: (string | ObjectId | (string | ObjectId)[])[]
  ): Promise<number> {
    try {
      let flattenedIds = ids.reduce<(string | ObjectId)[]>((acc, id) => {
        return acc.concat(Array.isArray(id) ? id : [id]);
      }, []);

      flattenedIds = flattenedIds.map((el) => {
        if (typeof el === "string") return new ObjectId(el);
        return el;
      });

      this.where("_id" as keyof T, "in", flattenedIds);
      this.onlyTrashed();
      this.generateWheres();
      const stages = this.getStages();

      let filter = {};
      if (stages.length > 0) filter = stages[0].$match;

      const collection = this.getCollection();
      const data = await collection.deleteMany(filter);
      this.resetQuery();

      return data.deletedCount;
    } catch (error) {
      console.log(error);
      throw new Error(`Force deleting documents failed`);
    }
  }

  /**
   * Restores soft-deleted documents matching the current query
   * @returns {Promise<number>} Number of documents restored
   * @throws {Error} If restoration fails
   */
  public async restore(options?: UpdateOptions): Promise<number> {
    try {
      this.onlyTrashed();
      const payload = {
        [this.$isDeleted]: false,
        [this.$deletedAt]: null,
      } as Partial<FormSchema<T>>;
      return await this.updateMany(payload, options);
    } catch (error) {
      console.log(error);
      throw new Error(`Restoring documents failed`);
    }
  }

  /**
   * Fills the current instance with data
   * @param {Partial<FormSchema<T>>} doc - Data to fill into the instance
   * @returns {this} Current query builder instance
   */
  public fill(doc: Partial<FormSchema<T>>) {
    Object.assign(this, doc);
    return this;
  }

  /**
   * Selects columns to include in the query result
   * @param {...(K|K[])[]} columns - Columns to include
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public select<K extends keyof T>(
    ...columns: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    this.setColumns(...columns);
    return this;
  }

  /**
   * Excludes columns from the query result
   * @param {...(K|K[])[]} columns - Columns to exclude
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public exclude<K extends keyof T | string>(
    ...columns: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    this.setExcludes(...columns);
    return this;
  }

  /**
   * Adds a where condition to the query
   * @param {K} column - Column name
   * @param {any} operator - Operator or value if comparing equality
   * @param {any} [value=null] - Value to compare against (optional if operator is the value)
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public where<K extends keyof T>(
    column: K | (string & {}),
    operator: any,
    value: any = null,
  ) {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.setWheres(column, _operator, _value, "and");

    return this;
  }

  /**
   * Adds an OR where condition to the query
   * @param {K} column - Column name
   * @param {any} operator - Operator or value if comparing equality
   * @param {any} [value=null] - Value to compare against (optional if operator is the value)
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhere<K extends keyof T>(
    column: K | (string & {}),
    operator: any,
    value: any = null,
  ) {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.setWheres(column, _operator, _value, "or");

    return this;
  }

  /**
   * Adds a where not equal condition to the query
   * @param {K} column - Column name
   * @param {any} value - Value to compare against
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public whereNot<K extends keyof T>(column: K | (string & {}), value: any) {
    this.setWheres(column, "ne", value, "and");

    return this;
  }

  /**
   * Adds an OR where not equal condition to the query
   * @param {K} column - Column name
   * @param {any} value - Value to compare against
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhereNot<K extends keyof T>(column: K | (string & {}), value: any) {
    this.setWheres(column, "ne", value, "or");

    return this;
  }

  /**
   * Adds a where in condition to the query
   * @param {K} column - Column name
   * @param {any[]} values - Array of values to check against
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public whereIn<K extends keyof T>(column: K | (string & {}), values: any[]) {
    this.setWheres(column, "in", values, "and");

    return this;
  }

  /**
   * Adds an OR where in condition to the query
   * @param {K} column - Column name
   * @param {any[]} values - Array of values to check against
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhereIn<K extends keyof T>(
    column: K | (string & {}),
    values: any[],
  ) {
    this.setWheres(column, "in", values, "or");

    return this;
  }

  /**
   * Adds a where not in condition to the query
   * @param {K} column - Column name
   * @param {any[]} values - Array of values to check against
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public whereNotIn<K extends keyof T>(
    column: K | (string & {}),
    values: any[],
  ) {
    this.setWheres(column, "nin", values, "and");

    return this;
  }

  /**
   * Adds an OR where not in condition to the query
   * @param {K} column - Column name
   * @param {any[]} values - Array of values to check against
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhereNotIn<K extends keyof T>(
    column: K | (string & {}),
    values: any[],
  ) {
    this.setWheres(column, "nin", values, "or");

    return this;
  }

  /**
   * Adds a where between condition to the query
   * @param {K} column - Column name
   * @param {[number, number?]} values - Array with lower and upper bounds
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public whereBetween<K extends keyof T>(
    column: K | (string & {}),
    values: [number, number?],
  ) {
    this.setWheres(column, "between", values, "and");

    return this;
  }

  /**
   * Adds an OR where between condition to the query
   * @param {K} column - Column name
   * @param {[number, number?]} values - Array with lower and upper bounds
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhereBetween<K extends keyof T>(
    column: K | (string & {}),
    values: [number, number?],
  ) {
    this.setWheres(column, "between", values, "or");

    return this;
  }

  /**
   * Adds a where null condition to the query
   * @param {K} column - Column name
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public whereNull<K extends keyof T>(column: K | (string & {})) {
    this.setWheres(column, "eq", null, "and");

    return this;
  }

  /**
   * Adds an OR where null condition to the query
   * @param {K} column - Column name
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhereNull<K extends keyof T>(column: K | (string & {})) {
    this.setWheres(column, "eq", null, "or");

    return this;
  }

  /**
   * Adds a where not null condition to the query
   * @param {K} column - Column name
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public whereNotNull<K extends keyof T>(column: K | (string & {})) {
    this.setWheres(column, "ne", null, "and");

    return this;
  }

  /**
   * Adds an OR where not null condition to the query
   * @param {K} column - Column name
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orWhereNotNull<K extends keyof T>(column: K | (string & {})) {
    this.setWheres(column, "ne", null, "or");

    return this;
  }

  /**
   * Includes soft-deleted documents in the query
   * @returns {this} Current query builder instance
   */
  public withTrashed() {
    this.$withTrashed = true;

    return this;
  }

  /**
   * Only retrieves soft-deleted documents in the query
   * @returns {this} Current query builder instance
   */
  public onlyTrashed() {
    this.$onlyTrashed = true;
    return this;
  }

  /**
   * Sets the number of documents to skip
   * @param {number} value - Number of documents to skip
   * @returns {this} Current query builder instance
   */
  public offset(value: number) {
    this.$offset = value;

    return this;
  }

  /**
   * Alias for offset - sets the number of documents to skip
   * @param {number} value - Number of documents to skip
   * @returns {this} Current query builder instance
   */
  public skip(value: number) {
    return this.offset(value);
  }

  /**
   * Sets the maximum number of documents to return
   * @param {number} value - Maximum number of documents
   * @returns {this} Current query builder instance
   */
  public limit(value: number) {
    this.$limit = value;

    return this;
  }

  /**
   * Sets the order for the query results
   * @param {K} column - Column to order by
   * @param {"asc"|"desc"} [direction="asc"] - Sort direction (asc or desc)
   * @param {boolean} [caseSensitive=false] - Whether sorting should be case sensitive
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public orderBy<K extends keyof T>(
    column: K | (string & {}),
    direction: "asc" | "desc" = "asc",
    caseSensitive: boolean = false,
  ) {
    const payload = {
      column,
      order: direction,
      caseSensitive: caseSensitive,
    } as any;
    this.setOrders(payload);

    return this;
  }

  /**
   * Executes the query and returns all matching documents
   * @param {...(K|K[])[]} fields - Optional fields to select
   * @returns {Promise<Collection<T>>} Collection of matching documents
   * @throws {Error} If query execution fails
   * @template K - Keys of document type T
   */
  public async get<K extends keyof T>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    try {
      this.setColumns(...fields);
      const aggregate = await this.aggregate();
      const data = (await aggregate.toArray()) as T[];
      const collection = new Collection<T>(...data);
      return collection;
    } catch (error) {
      throw new Error(`Fetching documents failed`);
    }
  }

  /**
   * Alias for get() with no parameters - returns all documents
   * @returns {Promise<T[]>} Collection of all documents
   */
  public async all(): Promise<T[]> {
    return this.get();
  }

  /**
   * Returns only specified field values from matching documents
   * @param {...(K|K[])[]} fields - Fields to retrieve
   * @returns {Promise<any>} Object with field values
   * @template K - Keys of document type T
   */
  public async pluck<K extends keyof T>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    const result = await this.get(...fields);
    const flattenedFields = fields.flat() as K[];
    return result.pluck(...flattenedFields);
  }

  /**
   * Returns paginated results with metadata
   * @param {number} [page=1] - Page number (starting from 1)
   * @param {number} [limit=15] - Number of items per page
   * @returns {Promise<IModelPaginate>} Object containing data and pagination metadata
   * @throws {Error} If pagination fails
   */
  public async paginate(
    page: number = 1,
    limit: number = 15,
  ): Promise<IModelPaginate> {
    try {
      this.checkSoftDelete();
      this.generateColumns();
      this.generateExcludes();
      this.generateWheres();
      this.generateOrders();
      this.generateGroups();

      const collection = this.getCollection();
      const stages = this.getStages();
      const lookups = this.getLookups();
      const aggregate = collection.aggregate([...stages, ...lookups]);

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

      const result = await aggregate
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      // Reset the query and relation states
      this.resetQuery();

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
      throw new Error(`Pagination failed`);
    }
  }

  /**
   * Returns the first document matching the query as an enhanced instance
   * @param {...(K|K[])[]} fields - Optional fields to select
   * @returns {Promise<T | null>} First matching document or null if none found
   * @template K - Keys of document type T
   */
  public async first<K extends keyof T>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ): Promise<T | null> {
    let data = await this.get(...fields);
    if (data && data.length > 0) {
      this.$original = { ...data[0] };
    }

    if (data.length === 0) {
      return null;
    }

    let result = data[0] as T;
    return result as T;
  }

  /**
   * Returns first matching document or creates a new one
   * @param {Partial<FormSchema<T>>} filter - Filter to find existing document
   * @param {Partial<FormSchema<T>>} [doc] - Data to use for creation if no match is found
   * @param {InsertOneOptions} [options] - MongoDB insert options
   * @returns {Promise<any>} Existing or newly created document
   */
  public async firstOrCreate(
    filter: Partial<FormSchema<T>>,
    doc?: Partial<FormSchema<T>>,
    options?: InsertOneOptions,
  ) {
    for (var key in filter) {
      if (filter.hasOwnProperty(key)) {
        this.where(key as keyof T, filter[key as keyof typeof filter]);
      }
    }

    const data = await this.first();
    if (data) return data;

    const payload = { ...filter, ...doc } as FormSchema<T>;
    return this.insert(payload as FormSchema<T>, options);
  }

  /**
   * Alias for firstOrCreate - returns existing document or creates a new model instance
   * @param {Partial<FormSchema<T>>} filter - Filter to find existing document
   * @param {Partial<FormSchema<T>>} [doc] - Data to use for the new instance if no match is found
   * @param {InsertOneOptions} [options] - MongoDB insert options
   * @returns {Promise<any>} Existing or newly created document
   */
  public async firstOrNew(
    filter: Partial<FormSchema<T>>,
    doc?: Partial<FormSchema<T>>,
    options?: InsertOneOptions,
  ) {
    return this.firstOrCreate(filter, doc, options);
  }

  /**
   * Returns the first document matching the query or throws exception if none found
   * @param {...(K|K[])[]} columns - Optional fields to select
   * @returns {Promise<any>} First matching document
   * @throws {MongoloquentNotFoundException} If no document found
   * @template K - Keys of document type T
   */
  public async firstOrFail<K extends keyof T>(...columns: (K | K[])[]) {
    const data = await this.first(...columns);
    if (!data) {
      throw new MongoloquentNotFoundException();
    }

    return data;
  }

  /**
   * Finds a document by ID
   * @param {string|ObjectId} id - Document ID
   * @returns {Promise<any>} Document if found, or null
   */
  public async find(id: string | ObjectId) {
    const _id = new ObjectId(id);
    this.setId(_id);

    let data = await this.get();
    if (data && data.length > 0) {
      this.$original = { ...data[0] };
    }

    if (data.length === 0) {
      return null;
    }

    let result = data[0] as T;
    const self = this;
    const handler = {
      set(target: any, prop: string, value: any) {
        // @ts-ignore
        if (prop in result) {
          self.trackChange(prop as keyof T, value);
        }
        target[prop] = value;
        return true;
      },
    };

    // Assign properties to this instance
    // @ts-ignore
    this.$id = result?._id;
    Object.assign(this, result);

    // Create a proxy for the combined object
    return new Proxy(this, handler) as this & T;
  }

  /**
   * Finds a document by ID or throws exception if not found
   * @param {string|ObjectId} id - Document ID
   * @returns {Promise<any>} Document
   * @throws {MongoloquentNotFoundException} If no document found
   */
  public async findOrFail(id: string | ObjectId) {
    const data = await this.find(id);
    if (!data) {
      throw new MongoloquentNotFoundException();
    }
    return data;
  }

  /**
   * Counts documents matching the query
   * @returns {Promise<number>} Number of matching documents
   * @throws {Error} If count operation fails
   */
  public async count(): Promise<number> {
    try {
      const collection = this.getCollection();

      this.checkSoftDelete();
      this.generateWheres();

      const stages = this.getStages();
      const aggregate = await collection
        .aggregate([
          ...stages,
          {
            $count: "total",
          },
        ])
        .next();

      this.resetQuery();
      return aggregate?.total || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching document count failed`);
    }
  }

  /**
   * Returns the maximum value of a field
   * @param {K} field - Field name
   * @returns {Promise<number>} Maximum value
   * @template K - Keys of document type T
   */
  public async max<K extends keyof T>(
    field: K | (string & {}),
  ): Promise<number> {
    return this.aggregates(field, "max");
  }

  /**
   * Returns the minimum value of a field
   * @param {K} field - Field name
   * @returns {Promise<number>} Minimum value
   * @template K - Keys of document type T
   */
  public async min<K extends keyof T>(
    field: K | (string & {}),
  ): Promise<number> {
    return this.aggregates(field, "min");
  }

  /**
   * Returns the average value of a field
   * @param {K} field - Field name
   * @returns {Promise<number>} Average value
   * @template K - Keys of document type T
   */
  public async avg<K extends keyof T>(
    field: K | (string & {}),
  ): Promise<number> {
    return this.aggregates(field, "avg");
  }

  /**
   * Returns the sum of values for a field
   * @param {K} field - Field name
   * @returns {Promise<number>} Sum of values
   * @template K - Keys of document type T
   */
  public async sum<K extends keyof T>(
    field: K | (string & {}),
  ): Promise<number> {
    return this.aggregates(field, "sum");
  }

  /**
   * Groups the query results by specified fields
   * @param {...(K|K[])[]} fields - Fields to group by
   * @returns {this} Current query builder instance
   * @template K - Keys of document type T
   */
  public groupBy<K extends keyof T>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    const flattenedFields = fields.flat() as (keyof T)[];
    this.$groups = [...this.$groups, ...flattenedFields];
    return this;
  }

  /**
   * Performs aggregation operations on a field
   * @param {K} field - Field to aggregate
   * @param {"avg"|"sum"|"max"|"min"} type - Type of aggregation operation
   * @returns {Promise<number>} Result of aggregation operation
   * @private
   * @template K - Keys of document type T
   */
  private async aggregates<K extends keyof T>(
    field: K | (string & {}),
    type: "avg" | "sum" | "max" | "min",
  ): Promise<number> {
    try {
      const collection = this.getCollection();
      //await this.checkRelation();
      this.checkSoftDelete();
      this.generateWheres();

      const stages = this.getStages();
      const aggregate = await collection
        .aggregate([
          ...stages,
          {
            $group: {
              _id: null,
              [type]: {
                // @ts-ignore
                [`$${type}`]: `$${field}`,
              },
            },
          },
        ])
        .next();

      // Reset the query state
      this.resetQuery();
      return typeof aggregate?.[type] === "number" ? aggregate[type] : 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching maximum value failed`);
    }
  }

  /**
   * Checks if the model has any changes
   * @returns {boolean} True if there are changes, false otherwise
   */
  public hasChanges(): boolean {
    return Object.keys(this.$changes).length > 0;
  }

  /**
   * Checks if any of the specified fields have been changed
   * @param {...(K|K[])[]} fields - Fields to check
   * @returns {boolean} True if any field is dirty, false otherwise
   * @template K - Keys of document type T
   */
  public isDirty<K extends keyof T>(...fields: (K | K[])[]): boolean {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      return flattenedFields.some((field) => field in this.$changes);
    }

    return this.hasChanges();
  }

  /**
   * Checks if all of the specified fields are unchanged
   * @param {...(K|K[])[]} fields - Fields to check
   * @returns {boolean} True if all fields are clean, false otherwise
   * @template K - Keys of document type T
   */
  public isClean<K extends keyof T>(...fields: (K | K[])[]): boolean {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      return flattenedFields.every((field) => !(field in this.$changes));
    }
    return !this.hasChanges();
  }

  /**
   * Checks if any of the specified fields were changed
   * @param {...(K|K[])[]} fields - Fields to check
   * @returns {boolean} True if any field was changed, false otherwise
   * @template K - Keys of document type T
   */
  public wasChanged<K extends keyof T>(...fields: (K | K[])[]): boolean {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      return flattenedFields.some((field) => {
        const _new = this.$changes[field];
        const old = this.$original[field];
        return _new && old !== _new;
      });
    }
    return this.hasChanges();
  }

  /**
   * Gets all changes made to the model
   * @returns {Partial<Record<keyof T, { old: any; new: any }>>} Object containing changes
   */
  public getChanges(): Partial<Record<keyof T, { old: any; new: any }>> {
    const changes: Partial<Record<keyof T, { old: any; new: any }>> = {};
    // Remove any property starting with $
    for (const key in this.$changes) {
      if (key.startsWith("$")) continue;
      const _new = this.$changes[key];
      const old = this.$original[key];
      if (_new && old !== _new) {
        changes[key] = _new;
      }
    }

    return changes;
  }

  /**
   * Gets original values of specified fields
   * @param {...(K|K[])[]} fields - Fields to get original values for
   * @returns {Partial<Record<keyof T, any>>} Original values of specified fields, or all original values if no fields specified
   * @template K - Keys of document type T
   */
  public getOriginal<K extends keyof T>(...fields: (K | K[])[]) {
    if (fields && fields.length > 0) {
      const flattenedFields = fields.flat() as (keyof T)[];
      const original: Partial<Record<keyof T, any>> = {};
      flattenedFields.forEach((field) => {
        if (field in this.$original) {
          original[field] = this.$original[field];
        }
      });
      return original;
    }
    return this.$original;
  }

  /**
   * Refreshes the model with its original values
   * @returns {this} Current query builder instance
   */
  public refresh() {
    this.$changes = {};
    Object.assign(this, this.$original);
    return this;
  }

  /**
   * Creates a proxy for the instance to track property changes
   * @returns {this & T} Proxied instance
   * @protected
   */
  protected createProxy(): this & T {
    return new Proxy(this, {
      set: (target, prop, value) => {
        // @ts-ignore
        if (!prop.startsWith("$") && value !== target.$original[prop]) {
          // @ts-ignore
          target.$changes[prop] = value;
        }

        // @ts-ignore
        target[prop] = value;
        return true;
      },
    }) as this & T;
  }

  /**
   * Tracks changes to a field
   * @param {K} field - Field being changed
   * @param {any} value - New value
   * @protected
   * @template K - Keys of document type T
   */
  protected trackChange<K extends keyof T>(field: K, value: any): void {
    // check if property starts with $

    // If field is not in $original, initialize it
    if (!(field in this.$original)) {
      // Get initial value from schema if possible
      const schema = (this.constructor as any).$schema;
      this.$original[field] =
        schema && field in schema ? schema[field] : undefined;
    }

    // Only track changes if the value is different
    if (this.$original[field] !== value) {
      // Skip tracking for $original property
      if (field === ("$original" as any)) {
        return;
      }

      if (!this.$changes[field]) {
        this.$changes[field] = value;
      } else {
        this.$changes[field] = value;
      }
    }
  }

  /**
   * Sets the document ID for query
   * @param {ObjectId|string} id - Document ID
   * @private
   */
  private setId(id: ObjectId | string) {
    this.$id = id;
  }

  /**
   * Adds stages to the aggregation pipeline
   * @param {Document|Document[]} doc - Stage or array of stages to add
   * @private
   */
  private setStages(doc: Document | Document[]): void {
    if (Array.isArray(doc)) this.$stages = [...this.$stages, ...doc];
    else this.$stages = [...this.$stages, doc];
  }

  /**
   * Gets the current aggregation pipeline stages
   * @returns {Document[]} Array of stages
   * @protected
   */
  protected getStages(): Document[] {
    return this.$stages;
  }

  /**
   * Gets the current lookup stages
   * @returns {Document[]} Array of lookup stages
   * @protected
   */
  protected getLookups(): Document[] {
    return this.$lookups;
  }

  /**
   * Adds columns to select
   * @param {...(K|K[])[]} columns - Columns to select
   * @private
   * @template K - Keys of document type T
   */
  private setColumns<K extends keyof T>(
    ...columns: (K | (string & {}) | (K | (string & {}))[])[]
  ): void {
    if (Array.isArray(columns)) {
      const flattenedColumns = columns.flat() as unknown as keyof T[];
      this.$columns = [
        ...this.$columns,
        ...(flattenedColumns as unknown as (keyof T)[]),
      ];
    } else this.$columns = [...this.$columns, columns];
  }

  /**
   * Adds columns to exclude
   * @param {...(K|K[])[]} columns - Columns to exclude
   * @private
   * @template K - Keys of document type T
   */
  private setExcludes<K extends keyof T>(
    ...columns: (K | (string & {}) | (K | (string & {}))[])[]
  ): void {
    if (Array.isArray(columns)) {
      const flattenedColumns = columns.flat() as unknown as keyof T[];
      this.$excludes = [
        ...this.$excludes,
        ...(flattenedColumns as unknown as (keyof T)[]),
      ];
    } else this.$excludes = [...this.$excludes, columns];
  }

  /**
   * Adds a where condition
   * @param {K} column - Column name
   * @param {any} operator - Operator for comparison
   * @param {any} value - Value to compare against
   * @param {string} [boolean="and"] - Boolean type (and/or)
   * @private
   * @template K - Keys of document type T
   */
  private setWheres<K extends keyof T>(
    column: K | (string & {}),
    operator: any,
    value: any,
    boolean: string = "and",
  ): void {
    // Determine type of query E|R|S
    const ep = ["eq", "ne", "=", "!="];
    let type = "R";
    if (ep.includes(operator)) type = "E";

    // Add the where clause to the $wheres array
    this.$wheres = [
      ...this.$wheres,
      { column, operator: operator, value, boolean, type },
    ] as any;
  }

  /**
   * Sets order by clauses
   * @param {IQueryOrder} doc - Order specification
   * @private
   */
  private setOrders(doc: IQueryOrder): void {
    if (Array.isArray(doc)) this.$orders = [...this.$orders, ...doc];
    else this.$orders = [...this.$orders, doc];
  }

  /**
   * Sets lookup stages for aggregation
   * @param {Document} doc - Lookup stage or array of stages
   * @protected
   */
  protected setLookups(doc: Document): void {
    if (Array.isArray(doc)) this.$lookups = [...this.$lookups, ...doc];
    else this.$lookups = [...this.$lookups, doc];
  }

  public getIsDeleted(): string {
    return this.$isDeleted;
  }

  public setConnection(connection: string): string {
    this.$connection = connection;
    return this.$connection;
  }

  public setDatabaseName(name: string): string {
    this.$databaseName = name;
    return this.$databaseName;
  }

  public setTimezone(timezone: string): string {
    this.$timezone = timezone;
    return this.$timezone;
  }

  /**
   * Adds soft delete condition to the query if enabled
   * @private
   */
  private checkSoftDelete<K extends keyof T>(): void {
    if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
      this.where(this.$isDeleted as K, false);
  }

  /**
   * Generates projection for selected columns
   * @private
   */
  private generateColumns(): void {
    let $project = {};
    // Add each selected column to the $project stage
    this.$columns.forEach((el) => {
      $project = { ...$project, [el]: 1 };
    });

    // Add the $project stage to the $stages array if there are selected columns
    if (Object.keys($project).length > 0) this.$stages.push({ $project });
  }

  /**
   * Generates projection for excluded columns
   * @private
   */
  private generateExcludes(): void {
    let $project = {};
    // Add each excluded column to the $project stage
    this.$excludes.forEach((el) => {
      $project = { ...$project, [el]: 0 };
    });

    // Add the $project stage to the $stages array if there are excluded columns
    if (Object.keys($project).length > 0) this.$stages.push({ $project });
  }

  /**
   * Generates match conditions for the query
   * @private
   */
  private generateWheres(isNested: boolean = false): void {
    let $and: Document[] = [];
    let $or: Document[] = [];

    if (this.$id) {
      this.setStages({ $match: { _id: new ObjectId(this.$id) } });
    }

    // sort by type(E/R/S) for better peformace query in MongoDB
    const typeOrder = ["E", "R", "S"];
    this.$wheres
      .filter((el) => isNested ? el.column.includes('.') : !el.column.includes('.'))
      .sort((a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)).forEach((el) => {
        const op = operators.find(
          (op) => op.operator === el.operator || op.mongoOperator === el.operator,
        );

        let value;
        if (el.column === "_id") {
          if (Array.isArray(el.value))
            value = el.value.map((val) => new ObjectId(val));
          else value = new ObjectId(el.value);
        }

        let condition = {
          [el.column]: {
            [`$${op?.mongoOperator}`]: value || el.value,
          },
          $options: op?.options,
        };

        if (el.operator === "between")
          condition = {
            [el.column]: {
              $gte: el.value?.[0],
              $lte: el.value?.[el.value.length - 1],
            },
            $options: op?.options,
          };

        if (!condition.$options) delete condition.$options;

        if (el.boolean === "and") $and.push(condition);
        else $or.push(condition);
      });

    if ($or.length > 0) {
      if ($and.length > 0) $or.push({ $and });
      let queries = {
        $or,
      };

      if (this.$useSoftDelete && !this.$withTrashed) {
        queries = {
          [this.$isDeleted]: false,
          $or,
        };
      }

      if (this.$useSoftDelete && this.$onlyTrashed) {
        queries = {
          [this.$isDeleted]: true,
          $or,
        };
      }

      this.setStages({ $match: queries });
      return;
    }

    if ($and.length > 0) {
      let queries = {
        $and,
      };

      if (this.$onlyTrashed) {
        queries = {
          [this.$isDeleted]: true,
          $and,
        };
      }
      this.setStages({ $match: queries });
      return;
    }

    if (this.$onlyTrashed) {
      this.setStages({ $match: { [this.$isDeleted]: true } });
    }
  }

  /**
   * Generates ordering stages for the query
   * @private
   */
  private generateOrders(): void {
    let $project = {
      document: "$$ROOT",
    };

    let $sort = {};

    this.$orders.forEach((el) => {
      $project = { ...$project, [el.column]: 1 };
      const direction = el.order === "asc" ? 1 : -1;

      if (el.caseSensitive) {
        $project = {
          ...$project,
          [`lowercase_${el.column}`]: { $toLower: `$${el.column}` },
        };
        $sort = {
          ...$sort,
          [`lowercase_${el.column}`]: direction,
        };
      } else $sort = { ...$sort, [el.column]: direction };
    });

    const orders = [
      { $project },
      { $sort },
      {
        $replaceRoot: {
          newRoot: "$document",
        },
      },
    ];

    if (this.$orders.length > 0) this.setStages(orders);
  }

  /**
   * Generates grouping stages for the query
   * @private
   */
  private generateGroups(): void {
    let _id = {};

    this.$groups.forEach((el: any) => {
      _id = { ..._id, [el]: `$${el}` };
    });

    const $group = {
      _id,
      count: { $sum: 1 },
    };

    if (this.$groups.length > 0) this.setStages({ $group });
  }

  /**
   * Generates limit stage for the query
   * @protected
   */
  protected generateLimit(): void {
    if (this.$limit > 0) this.setStages({ $limit: this.$limit });
  }

  /**
   * Generates skip (offset) stage for the query
   * @protected
   */
  protected generateOffset(): void {
    if (this.$offset > 0) this.setStages({ $skip: this.$offset });
  }

  /**
   * Performs MongoDB aggregation with all generated stages
   * @returns {Promise<import('mongodb').AggregationCursor>} Aggregation cursor
   * @private
   */
  private async aggregate() {
    try {
      this.checkSoftDelete();
      this.generateWheres();
      this.generateColumns();
      this.generateExcludes();
      this.generateOffset();
      this.generateLimit();
      this.generateOrders();
      this.generateGroups();

      const collection = this.getCollection();
      const stages = this.getStages();
      const lookups = this.getLookups();

      this.$stages = [];
      this.$columns = [];
      this.$excludes = [];

      this.generateWheres(true)
      const nestedStages = this.getStages()

      const aggregate = collection?.aggregate([...stages, ...lookups, ...nestedStages]);

      this.resetQuery();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
  }

  /**
   * Adds timestamps to document if enabled
   * @param {Partial<FormSchema<T>>} doc - Document to modify
   * @param {boolean} [isNew=true] - Whether document is new
   * @returns {Partial<FormSchema<T>>} Modified document with timestamps
   * @private
   */
  private checkUseTimestamps(
    doc: Partial<FormSchema<T>>,
    isNew: boolean = true,
  ): Partial<FormSchema<T>> {
    if (this.$useTimestamps) {
      const current = dayjs().format("YYYY/MM/DD HH:mm:ss");
      const now = dayjs.utc(current).tz(this.$timezone).toDate();

      if (!isNew) return { ...doc, [this.$updatedAt]: now };

      return { ...doc, [this.$createdAt]: now, [this.$updatedAt]: now };
    }

    return doc;
  }

  /**
   * Adds soft delete flags to document if enabled
   * @param {Partial<FormSchema<T>>} doc - Document to modify
   * @param {boolean} [isDeleted=false] - Whether document is being deleted
   * @returns {Partial<FormSchema<T>>} Modified document with soft delete flags
   * @private
   */
  private checkUseSoftdelete(
    doc: Partial<FormSchema<T>>,
    isDeleted: boolean = false,
  ): Partial<FormSchema<T>> {
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
   * Resets all query state variables
   * @private
   */
  private resetQuery(): void {
    this.$withTrashed = false;
    this.$onlyTrashed = false;
    this.$stages = [];
    this.$lookups = [];
    this.$columns = [];
    this.$excludes = [];
    this.$wheres = [];
    this.$orders = [];
    this.$groups = [];
    this.$offset = 0;
    this.$limit = 0;
  }
}
