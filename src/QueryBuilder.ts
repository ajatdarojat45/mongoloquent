import { lookup } from "dns";
import {
  BulkWriteOptions,
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
 * @template T The document type
 */
export default class QueryBuilder<T> {
  /** Schema definition for the document */
  static $schema: Record<string, any>;
  /** Default MongoDB connection string */
  protected static $connection: string = MONGOLOQUENT_DATABASE_URI;
  /** Default database name */
  protected static $databaseName: string = MONGOLOQUENT_DATABASE_NAME;
  /** Collection name */
  protected static $collection: string = "";
  /** Flag to enable soft delete functionality */
  protected static $useSoftDelete: boolean = false;
  /** Flag to enable timestamps */
  protected static $useTimestamps: boolean = true;
  /** Field name for the isDeleted flag */
  protected static $isDeleted: string = "isDeleted";

  /** Timezone setting for dates */
  private $timezone: string = TIMEZONE;
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
  /** MongoDB connection string */
  protected $connection: string = "";
  /** Database name */
  protected $databaseName: string = "";
  /** Collection name */
  protected $collection: string = "mongoloquent";
  /** Flag to enable timestamps */
  protected $useTimestamps: boolean = true;
  /** Flag to enable soft delete functionality */
  protected $useSoftDelete: boolean = false;
  /** Lookup stages for aggregation pipelines */
  protected $lookups: Document[] = [];
  /** Field name for the isDeleted flag */
  protected $isDeleted: string = "isDeleted";
  /** Field name for the deletedAt timestamp */
  protected $deletedAt: string = "deletedAt";
  /** Number of documents to limit in query */
  protected $limit: number = 0;

  /** Alias for relationship */
  protected $alias: string = "";
  /** Relationship options */
  protected $options: IRelationOptions = {};

  /**
   * Constructor for the QueryBuilder class
   * Initializes properties from class static properties
   */
  constructor() {
    this.$connection = (this.constructor as typeof QueryBuilder).$connection;
    this.$databaseName = (
      this.constructor as typeof QueryBuilder
    ).$databaseName;
    this.$collection =
      (this.constructor as typeof QueryBuilder).$collection ||
      `${this.constructor.name.toLowerCase()}s`;
    this.$useSoftDelete = (
      this.constructor as typeof QueryBuilder
    ).$useSoftDelete;
    this.$useTimestamps = (
      this.constructor as typeof QueryBuilder
    ).$useTimestamps;
    this.$isDeleted = (this.constructor as typeof QueryBuilder).$isDeleted;
  }

  /**
   * Gets the MongoDB collection
   * @param collection Optional collection name
   * @returns MongoDB collection
   * @private
   */
  public getCollection(collection?: string) {
    const db = Database.getDb(this.$connection, this.$databaseName);
    return db.collection<FormSchema<T>>(collection || this.$collection);
  }

  /**
   * Inserts a document into the collection
   * @param doc Document to insert
   * @param options Insert options
   * @returns Inserted document
   */
  public async insert(doc: FormSchema<T>, options?: InsertOneOptions) {
    try {
      const collection = this.getCollection();
      let newDoc = this.checkUseTimestamps(doc);
      newDoc = this.checkUseSoftdelete(newDoc);

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
   * Alias for insert
   * @param doc Document to insert
   * @param options Insert options
   * @returns Inserted document
   */
  public async create(
    doc: FormSchema<T>,
    options?: InsertOneOptions,
  ): Promise<T> {
    return this.insert(doc, options);
  }

  /**
   * Inserts multiple documents into the collection
   * @param docs Array of documents to insert
   * @param options Bulk write options
   * @returns Array of inserted ObjectIds
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
      console.log(error);
      throw new Error(`Inserting multiple documents failed`);
    }
  }

  /**
   * Alias for insertMany
   * @param docs Array of documents to insert
   * @param options Bulk write options
   * @returns Array of inserted ObjectIds
   */
  public async createMany(
    docs: FormSchema<T>[],
    options?: BulkWriteOptions,
  ): Promise<ObjectId[]> {
    return this.insertMany(docs, options);
  }

  /**
   * Updates a document in the collection
   * @param doc Document fields to update
   * @param options FindOneAndUpdate options
   * @returns Updated document
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
      console.log(error);
      throw new Error(`Updating documents failed`);
    }
  }

  /**
   * Updates a document if it exists, otherwise creates it
   * @param filter Filter to find the document
   * @param doc Document fields to update or insert
   * @returns Updated or created document
   */
  async updateOrCreate(filter: Partial<T>, doc: Partial<FormSchema<T>>) {
    for (var key in filter) {
      if (doc.hasOwnProperty(key)) {
        this.where(key, filter[key]);
      }
    }

    const data = await this.update(doc);
    if (data) return data;

    return this.insert(doc as FormSchema<T>);
  }

  /**
   * Alias for updateOrCreate
   * @param filter Filter to find the document
   * @param doc Document fields to update or insert
   * @returns Updated or created document
   */
  async updateOrInsert(filter: Partial<T>, doc: Partial<FormSchema<T>>) {
    return this.updateOrCreate(filter, doc);
  }

  /**
   * Updates multiple documents in the collection
   * @param doc Document fields to update
   * @param options Update options
   * @returns Number of documents modified
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
   * @returns Saved document
   */
  public async save() {
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
      return this.insert(payload as FormSchema<T>);
    } else {
      // @ts-ignore
      const id = this.$original?._id;
      return this.where("_id" as keyof T, id).update(payload as FormSchema<T>);
    }
  }

  /**
   * Deletes documents matching the current query
   * @returns Number of documents deleted or soft-deleted
   */
  public async delete(): Promise<number> {
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
        );

        this.resetQuery();

        return data?.modifiedCount || 0;
      }

      const data = await collection?.deleteMany(filter);
      this.resetQuery();

      return data?.deletedCount || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  /**
   * Deletes documents by IDs
   * @param ids IDs of documents to delete
   * @returns Number of documents deleted or soft-deleted
   */
  public async destroy(...ids: (string | ObjectId)[]): Promise<number> {
    ids = ids.map((el) => {
      if (typeof el === "string") return new ObjectId(el);
      return el;
    });
    this.where("_id" as keyof T, "in", ids);
    return this.delete();
  }

  /**
   * Permanently deletes soft-deleted documents by IDs
   * @param ids IDs of documents to permanently delete
   * @returns Number of documents permanently deleted
   */
  public async forceDestroy(...ids: (string | ObjectId)[]): Promise<number> {
    try {
      ids = ids.map((el) => {
        if (typeof el === "string") return new ObjectId(el);
        return el;
      });
      this.where("_id" as keyof T, "in", ids);
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
   * Restores soft-deleted documents
   * @returns Number of documents restored
   */
  public async restore(): Promise<number> {
    try {
      this.onlyTrashed();
      const payload = {
        [this.$isDeleted]: false,
        [this.$deletedAt]: null,
      } as Partial<FormSchema<T>>;
      return await this.updateMany(payload);
    } catch (error) {
      console.log(error);
      throw new Error(`Restoring documents failed`);
    }
  }

  /**
   * Fills the current instance with data
   * @param doc Data to fill into the instance
   * @returns Current instance
   */
  public fill(doc: Partial<FormSchema<T>>) {
    Object.assign(this, doc);
    return this;
  }

  /**
   * Selects columns to include in the query result
   * @param columns Columns to include
   * @returns Current query builder instance
   */
  public select<K extends keyof T>(...columns: (K | K[])[]): QueryBuilder<T> {
    this.setColumns(...columns);
    return this;
  }

  /**
   * Excludes columns from the query result
   * @param columns Columns to exclude
   * @returns Current query builder instance
   */
  public exclude<K extends keyof T>(...columns: (K | K[])[]): QueryBuilder<T> {
    this.setExcludes(...columns);
    return this;
  }

  /**
   * Adds a where condition to the query
   * @param column Column name
   * @param operator Operator or value if comparing equality
   * @param value Value to compare against (optional if operator is the value)
   * @returns Current query builder instance
   */
  public where<K extends keyof T>(
    column: K,
    operator: any,
    value: any = null,
  ): QueryBuilder<T> {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.setWheres(column, _operator, _value, "and");

    return this;
  }

  /**
   * Adds an OR where condition to the query
   * @param column Column name
   * @param operator Operator or value if comparing equality
   * @param value Value to compare against (optional if operator is the value)
   * @returns Current query builder instance
   */
  public orWhere<K extends keyof T>(
    column: K,
    operator: any,
    value: any = null,
  ): QueryBuilder<T> {
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    this.setWheres(column, _operator, _value, "or");

    return this;
  }

  /**
   * Adds a where not equal condition to the query
   * @param column Column name
   * @param value Value to compare against
   * @returns Current query builder instance
   */
  public whereNot<K extends keyof T>(column: K, value: any): QueryBuilder<T> {
    this.setWheres(column, "ne", value, "and");

    return this;
  }

  /**
   * Adds an OR where not equal condition to the query
   * @param column Column name
   * @param value Value to compare against
   * @returns Current query builder instance
   */
  public orWhereNot<K extends keyof T>(column: K, value: any): QueryBuilder<T> {
    this.setWheres(column, "ne", value, "or");

    return this;
  }

  /**
   * Adds a where in condition to the query
   * @param column Column name
   * @param values Array of values to check against
   * @returns Current query builder instance
   */
  public whereIn<K extends keyof T>(column: K, values: any[]): QueryBuilder<T> {
    this.setWheres(column, "in", values, "and");

    return this;
  }

  /**
   * Adds an OR where in condition to the query
   * @param column Column name
   * @param values Array of values to check against
   * @returns Current query builder instance
   */
  public orWhereIn<K extends keyof T>(
    column: K,
    values: any[],
  ): QueryBuilder<T> {
    this.setWheres(column, "in", values, "or");

    return this;
  }

  /**
   * Adds a where not in condition to the query
   * @param column Column name
   * @param values Array of values to check against
   * @returns Current query builder instance
   */
  public whereNotIn<K extends keyof T>(
    column: K,
    values: any[],
  ): QueryBuilder<T> {
    this.setWheres(column, "nin", values, "and");

    return this;
  }

  /**
   * Adds an OR where not in condition to the query
   * @param column Column name
   * @param values Array of values to check against
   * @returns Current query builder instance
   */
  public orWhereNotIn<K extends keyof T>(
    column: K,
    values: any[],
  ): QueryBuilder<T> {
    this.setWheres(column, "nin", values, "or");

    return this;
  }

  /**
   * Adds a where between condition to the query
   * @param column Column name
   * @param values Array with lower and upper bounds
   * @returns Current query builder instance
   */
  public whereBetween<K extends keyof T>(
    column: K,
    values: [number, number?],
  ): QueryBuilder<T> {
    this.setWheres(column, "between", values, "and");

    return this;
  }

  /**
   * Adds an OR where between condition to the query
   * @param column Column name
   * @param values Array with lower and upper bounds
   * @returns Current query builder instance
   */
  public orWhereBetween<K extends keyof T>(
    column: K,
    values: [number, number?],
  ): QueryBuilder<T> {
    this.setWheres(column, "between", values, "or");

    return this;
  }

  /**
   * Adds a where null condition to the query
   * @param column Column name
   * @returns Current query builder instance
   */
  public whereNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "eq", null, "and");

    return this;
  }

  /**
   * Adds an OR where null condition to the query
   * @param column Column name
   * @returns Current query builder instance
   */
  public orWhereNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "eq", null, "or");

    return this;
  }

  /**
   * Adds a where not null condition to the query
   * @param column Column name
   * @returns Current query builder instance
   */
  public whereNotNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "ne", null, "and");

    return this;
  }

  /**
   * Adds an OR where not null condition to the query
   * @param column Column name
   * @returns Current query builder instance
   */
  public orWhereNotNull<K extends keyof T>(column: K): QueryBuilder<T> {
    this.setWheres(column, "ne", null, "or");

    return this;
  }

  /**
   * Includes soft-deleted documents in the query
   * @returns Current query builder instance
   */
  public withTrashed(): QueryBuilder<T> {
    this.$withTrashed = true;

    return this;
  }

  /**
   * Only retrieves soft-deleted documents in the query
   * @returns Current query builder instance
   */
  public onlyTrashed(): QueryBuilder<T> {
    this.$onlyTrashed = true;
    return this;
  }

  /**
   * Sets the number of documents to skip
   * @param value Number of documents to skip
   * @returns Current query builder instance
   */
  public offset(value: number): QueryBuilder<T> {
    this.$offset = value;

    return this;
  }

  /**
   * Alias for offset
   * @param value Number of documents to skip
   * @returns Current query builder instance
   */
  public skip(value: number): QueryBuilder<T> {
    return this.offset(value);
  }

  /**
   * Sets the maximum number of documents to return
   * @param value Maximum number of documents
   * @returns Current query builder instance
   */
  public limit(value: number): QueryBuilder<T> {
    this.$limit = value;

    return this;
  }

  /**
   * Sets the order for the query results
   * @param column Column to order by
   * @param direction Sort direction (asc or desc)
   * @param caseSensitive Whether sorting should be case sensitive
   * @returns Current query builder instance
   */
  public orderBy<K extends keyof T>(
    column: K,
    direction: "asc" | "desc" = "asc",
    caseSensitive: boolean = false,
  ): this {
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
   * @param fields Optional fields to select
   * @returns Collection of matching documents
   */
  public async get<K extends keyof T>(...fields: (K | K[])[]) {
    try {
      this.setColumns(...fields);
      const aggregate = await this.aggregate();
      const data = (await aggregate.toArray()) as T[];
      const collection = new Collection<T>(...data);
      return collection;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  /**
   * Alias for get() with no parameters
   * @returns Collection of all documents
   */
  public async all(): Promise<T[]> {
    return this.get();
  }

  /**
   * Returns only specified field values from matching documents
   * @param fields Fields to retrieve
   * @returns Object with field values
   */
  public async pluck<K extends keyof T>(...fields: (K | K[])[]) {
    const result = await this.get(...fields);
    const flattenedFields = fields.flat() as K[];
    return result.pluck(...flattenedFields);
  }

  /**
   * Returns paginated results
   * @param page Page number (starting from 1)
   * @param limit Number of items per page
   * @returns Object containing data and pagination metadata
   */
  public async paginate(
    page: number = 1,
    limit: number = this.$limit,
  ): Promise<IModelPaginate> {
    try {
      // await this.checkRelation();
      this.checkSoftDelete();
      this.generateColumns();
      this.generateExcludes();
      this.generateWheres();
      this.generateOrders();
      this.generateGroups();

      const collection = this.getCollection();
      const stages = this.getStages();
      // const lookups = this.getLookups();
      const aggregate = collection.aggregate([...stages]);

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
      console.log(error);
      throw new Error(`Pagination failed`);
    }
  }

  /**
   * Returns the first document matching the query
   * @param fields Optional fields to select
   * @returns First matching document as an enhanced instance
   */
  public async first<K extends keyof T>(
    ...fields: (K | K[])[]
  ): Promise<(this & T) | null> {
    let data = await this.get(...fields);
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
   * Returns first matching document or creates a new one
   * @param filter Filter to find existing document
   * @param doc Data to use for creation if no match is found
   * @returns Existing or newly created document
   */
  public async firstOrCreate(
    filter: Partial<FormSchema<T>>,
    doc?: Partial<FormSchema<T>>,
  ) {
    for (var key in filter) {
      if (filter.hasOwnProperty(key)) {
        this.where(key as keyof T, filter[key as keyof typeof filter]);
      }
    }

    const data = await this.first();
    if (data && Object.keys(data.$original).length > 0) return data;

    const payload = { ...filter, ...doc } as FormSchema<T>;
    return this.insert(payload as FormSchema<T>);
  }

  /**
   * Alias for firstOrCreate
   * @param filter Filter to find existing document
   * @param doc Data to use for creation if no match is found
   * @returns Existing or newly created document
   */
  public async firstOrNew(
    filter: Partial<FormSchema<T>>,
    doc?: Partial<FormSchema<T>>,
  ) {
    return this.firstOrCreate(filter, doc);
  }

  /**
   * Returns the first document matching the query or throws exception if none found
   * @param columns Optional fields to select
   * @returns First matching document
   * @throws MongoloquentNotFoundException if no document found
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
   * @param id Document ID
   * @returns Document if found
   */
  public async find(id: string | ObjectId) {
    const _id = new ObjectId(id);
    this.setId(_id);
    return this.first();
  }

  /**
   * Finds a document by ID or throws exception if not found
   * @param id Document ID
   * @returns Document
   * @throws MongoloquentNotFoundException if no document found
   */
  public async findOrFail(id: string | ObjectId) {
    const data = await this.find(id);
    if (data && Object.keys(data.$original).length === 0) {
      throw new MongoloquentNotFoundException();
    }
    return data;
  }

  /**
   * Counts documents matching the query
   * @returns Number of matching documents
   */
  public async count(): Promise<number> {
    try {
      const collection = this.getCollection();

      //     await this.checkRelation();
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
   * @param field Field name
   * @returns Maximum value
   */
  public async max<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "max");
  }

  /**
   * Returns the minimum value of a field
   * @param field Field name
   * @returns Minimum value
   */
  public async min<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "min");
  }

  /**
   * Returns the average value of a field
   * @param field Field name
   * @returns Average value
   */
  public async avg<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "avg");
  }

  /**
   * Returns the sum of values for a field
   * @param field Field name
   * @returns Sum of values
   */
  public async sum<K extends keyof T>(field: K): Promise<number> {
    return this.aggregates(field, "sum");
  }

  public groupBy<K extends keyof T>(...fields: (K | K[])[]): QueryBuilder<T> {
    const flattenedFields = fields.flat() as (keyof T)[];
    this.$groups = [...this.$groups, ...flattenedFields];
    return this;
  }

  /**
   * Performs aggregation operations on a field
   * @param field Field to aggregate
   * @param type Type of aggregation (avg, sum, max, min)
   * @returns Result of aggregation operation
   * @private
   */
  private async aggregates<K extends keyof T>(
    field: K,
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
   * @returns True if there are changes, false otherwise
   */
  public hasChanges(): boolean {
    return Object.keys(this.$changes).length > 0;
  }

  /**
   * Checks if any of the specified fields have been changed
   * @param fields Fields to check
   * @returns True if any field is dirty, false otherwise
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
   * @param fields Fields to check
   * @returns True if all fields are clean, false otherwise
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
   * @param fields Fields to check
   * @returns True if any field was changed, false otherwise
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
   * @returns Object containing changes
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
   * @param fields Fields to get original values for
   * @returns Original values
   */
  public getOriginal<K extends keyof T>(...fields: (K | K[])[]): any {
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
   * @returns Current query builder instance
   */
  public refresh(): QueryBuilder<T> {
    this.$changes = {};
    Object.assign(this, this.$original);
    return this;
  }

  /**
   * Creates a proxy for the instance to track property changes
   * @returns Proxied instance
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
   * @param field Field being changed
   * @param value New value
   * @protected
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
   * @param id Document ID
   * @private
   */
  private setId(id: ObjectId | string) {
    this.$id = id;
  }

  /**
   * Adds stages to the aggregation pipeline
   * @param doc Stage or array of stages to add
   * @private
   */
  private setStages(doc: Document | Document[]): void {
    if (Array.isArray(doc)) this.$stages = [...this.$stages, ...doc];
    else this.$stages = [...this.$stages, doc];
  }

  /**
   * Gets the current aggregation pipeline stages
   * @returns Array of stages
   * @protected
   */
  protected getStages(): Document[] {
    return this.$stages;
  }

  /**
   * Gets the current lookup stages
   * @returns Array of lookup stages
   * @protected
   */
  protected getLookups(): Document[] {
    return this.$lookups;
  }

  /**
   * Adds columns to select
   * @param columns Columns to select
   * @private
   */
  private setColumns<K extends keyof T>(...columns: (K | K[])[]): void {
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
   * @param columns Columns to exclude
   * @private
   */
  private setExcludes<K extends keyof T>(...columns: (K | K[])[]): void {
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
   * @param column Column name
   * @param operator Operator for comparison
   * @param value Value to compare against
   * @param boolean Boolean type (and/or)
   * @private
   */
  private setWheres<K extends keyof T>(
    column: K,
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
   * @param doc Order specification
   * @private
   */
  private setOrders(doc: IQueryOrder): void {
    if (Array.isArray(doc)) this.$orders = [...this.$orders, ...doc];
    else this.$orders = [...this.$orders, doc];
  }

  /**
   * Sets lookup stages for aggregation
   * @param doc Lookup stage or array of stages
   * @protected
   */
  protected setLookups(doc: Document): void {
    if (Array.isArray(doc)) this.$lookups = [...this.$lookups, ...doc];
    else this.$lookups = [...this.$lookups, doc];
  }

  /**
   * Gets the field name used for soft delete
   * @returns Field name
   */
  public getIsDeleted() {
    return this.$isDeleted;
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
  private generateWheres(): void {
    let $and: Document[] = [];
    let $or: Document[] = [];

    if (this.$id) {
      this.setStages({ $match: { _id: new ObjectId(this.$id) } });
    }

    // sort by type(E/R/S) for better peformace query in MongoDB
    this.$wheres.sort().forEach((el) => {
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
   * @returns Aggregation cursor
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

      const aggregate = collection?.aggregate([...stages, ...lookups]);

      this.resetQuery();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
  }

  /**
   * Adds timestamps to document if enabled
   * @param doc Document to modify
   * @param isNew Whether document is new
   * @returns Modified document with timestamps
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
   * @param doc Document to modify
   * @param isDeleted Whether document is being deleted
   * @returns Modified document with soft delete flags
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
