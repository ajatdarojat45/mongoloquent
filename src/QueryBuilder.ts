import {
  BulkWriteOptions,
  Db,
  Document,
  Filter,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
  OptionalUnlessRequiredId,
  UpdateOptions,
} from "mongodb";
import { IQueryBuilder, IQueryOrder, IQueryWhere } from "./interfaces/IQuery";
import {
  MONGOLOQUENT_DATABASE_NAME,
  MONGOLOQUENT_DATABASE_URI,
  TIMEZONE,
} from "./configs/app";
import Database from "./Database";
import operators from "./utils/operators";
import dayjs from "./utils/dayjs";
import MongoloquentNotFoundException from "./exceptions/MongoloquentNotFoundException";
import Collection from "./Collection";
import { FormSchema } from "./types/schema";
import { IMongoloquentSchema } from "./interfaces/ISchema";

export default class QueryBuilder {
  public static $schema: unknown;
  private $connection: string = "";
  private $databaseName: string | null = null;
  private $collection: string = "mongoloquent";
  private $db: Db;
  private $useTimestamps: boolean = true;
  private $timezone: string = TIMEZONE;
  private $createdAt: string = "createdAt";
  private $updatedAt: string = "updatedAt";
  private $id: string | ObjectId | null = null;

  /**
   * Stores the current aggregation pipeline stages
   */
  private $stages: Document[] = [];

  /**
   * Stores the columns that should be returned
   */
  private $columns: string[] = [];

  /**
   * Stores the columns that should be excluded
   */
  private $excludes: string[] = [];

  /**
   * Stores the where constraints for the query
   */
  private $wheres: IQueryWhere[] = [];

  /**
   * Stores the orderings for the query
   */
  private $orders: IQueryOrder[] = [];

  /**
   * Stores the groupings for the query
   */
  private $groups: string[] = [];

  /**
   * Identifies if the soft delete feature is enabled
   */
  public $useSoftDelete: boolean = false;

  /**
   * Stores the field name for the soft delete flag
   */
  protected $isDeleted: string = "isDeleted";

  /**
   * Stores the field name for the soft delete timestamp
   */
  protected $deletedAt: string = "deletedAt";

  /**
   * Identifies if querying soft deleted data is enabled
   */
  private $withTrashed: boolean = false;

  /**
   * Identifies if querying only soft deleted data is enabled
   */
  private $onlyTrashed: boolean = false;

  /**
   * Stores the maximum number of records to return
   */
  protected $limit: number = 0;

  /**
   * Stores the number of records to skip
   */
  private $offset: number = 0;

  constructor(builder: IQueryBuilder) {
    this.$connection = builder.connection || MONGOLOQUENT_DATABASE_URI;
    this.$databaseName = builder.databaseName || MONGOLOQUENT_DATABASE_NAME;
    this.$collection =
      builder.collection || this.constructor.name.toLowerCase();
    this.$useSoftDelete = builder.useSoftDelete || false;
    this.$useTimestamps = builder.useTimestamps || true;
    this.$db = Database.getDb(this.$connection, this.$databaseName);
  }

  private getCollection<T extends typeof QueryBuilder>() {
    return this.$db.collection<FormSchema<T["$schema"]>>(this.$collection);
  }

  /**
   * Inserts a new document into the collection, applying timestamps and soft delete if applicable
   */
  public async insert<T extends typeof QueryBuilder>(
    doc: FormSchema<T["$schema"]>,
    options?: InsertOneOptions
  ): Promise<T["$schema"]> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Apply timestamps to the document if enabled
      let newDoc = this.checkUseTimestamps(doc);
      // Apply soft delete fields to the document if enabled
      newDoc = this.checkUseSoftdelete(newDoc);

      //      newDoc = this.checkRelationship(newDoc);
      // Insert the document into the collection
      const data = await collection?.insertOne(
        newDoc as OptionalUnlessRequiredId<FormSchema<T["$schema"]>>,
        options
      );

      this.resetQuery();
      // Return the inserted document with its ID
      return { _id: data?.insertedId as ObjectId, ...newDoc } as T["$schema"];
    } catch (error) {
      throw new Error(`Inserting document failed`);
    }
  }

  /**
   * Inserts multiple documents into the collection, applying timestamps and soft delete if applicable
   */
  public async insertMany<T extends typeof QueryBuilder>(
    docs: FormSchema<T["$schema"]>[],
    options?: BulkWriteOptions
  ): Promise<ObjectId[]> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Apply timestamps and soft delete fields to each document if enabled
      const newDocs = docs.map((el) => {
        let newEl = this.checkUseTimestamps(el);
        newEl = this.checkUseSoftdelete(newEl);
        // newEl = this.checkRelationship(newEl);

        return newEl;
      });

      // Insert the documents into the collection
      const data = await collection?.insertMany(
        newDocs as OptionalUnlessRequiredId<FormSchema<T["$schema"]>>[],
        options
      );

      const result: ObjectId[] = [];

      // Extract the inserted IDs from the result
      for (const key in data?.insertedIds) {
        result.push(
          data?.insertedIds[key as unknown as keyof typeof data.insertedIds]
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
   * Updates a single document in the collection that matches the query criteria
   */
  public async update<T extends typeof QueryBuilder>(
    doc: Partial<FormSchema<T["$schema"]>>,
    options: FindOneAndUpdateOptions = {}
  ) {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Generate the where conditions for the query
      //     await this.checkRelation();
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
            ...(newDoc as Partial<T["$schema"]>),
          },
        },
        {
          ...options,
          returnDocument: "after",
        }
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
   * Updates or creates a document based on the specified condition
   */
  async updateOrCreate<T extends typeof QueryBuilder>(
    filter: { [key: string]: any },
    doc: Partial<FormSchema<T["$schema"]>>
  ) {
    for (var key in filter) {
      if (doc.hasOwnProperty(key)) {
        this.where(key, filter[key]);
      }
    }

    const data = await this.update(doc);
    if (data) return data;

    return this.insert(doc as FormSchema<T["$schema"]>);
  }

  /**
   * Updates multiple documents in the collection, applying timestamps and soft delete if applicable
   */
  public async updateMany<T extends typeof QueryBuilder>(
    doc: Partial<FormSchema<T["$schema"]>>,
    options?: UpdateOptions
  ): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      // Generate the where conditions for the query
      //     await this.checkRelation();
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
            ...(newDoc as Partial<T["$schema"]>),
          },
        },
        options
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
   * Deletes documents by their IDs, applying soft delete if applicable
   */
  public async destroy(
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
   */
  public async delete<T extends typeof QueryBuilder>(): Promise<number> {
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

        const data = await collection?.updateMany(
          { ...filter },
          {
            $set: {
              ...(doc as Partial<T["$schema"]>),
            },
          }
        );

        this.resetQuery();

        return data?.modifiedCount || 0;
      }

      // Delete the documents from the collection
      const data = await collection?.deleteMany(filter);
      // Reset the query state
      this.resetQuery();

      return data?.deletedCount || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  /**
   * Helper function to validate and apply timestamps to documents
   * Handles both creation and update timestamps based on the model's configuration
   */
  private checkUseTimestamps<T extends typeof QueryBuilder>(
    doc: Partial<FormSchema<T["$schema"]>>,
    isNew: boolean = true
  ): Partial<FormSchema<T["$schema"]>> {
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
   */
  private checkUseSoftdelete<T extends typeof QueryBuilder>(
    doc: Partial<FormSchema<T["$schema"]>>,
    isDeleted: boolean = false
  ): Partial<FormSchema<T["$schema"]>> {
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
   * Sets columns to be selected in the query
   */
  public select(columns: string | string[]): this {
    this.setColumns(columns);
    return this;
  }

  /**
   * Sets columns to be excluded from the query results
   */
  public exclude(columns: string | string[]): this {
    this.setExcludes(columns);
    return this;
  }

  /**
   * Adds a where clause to filter query results
   */
  public where(column: string, operator: any, value: any = null): this {
    // Determine the value and operator
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    // Add the where clause to the $wheres array
    this.setWheres(column, _operator, _value, "and");

    return this;
  }

  /**
   * Adds an "or where" clause to the query
   */
  public orWhere(column: string, operator: any, value: any = null): this {
    // Determine the value and operator
    let _value = value || operator;
    let _operator = value ? operator : "eq";

    // Add the where clause to the $wheres array
    this.setWheres(column, _operator, _value, "or");

    return this;
  }

  /**
   * Adds a "where not" clause to the query
   */
  public whereNot(column: string, value: any): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", value, "and");

    return this;
  }

  /**
   * Adds an "or where not" clause to the query
   */
  public orWhereNot(column: string, value: any): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", value, "or");

    return this;
  }

  /**
   * Adds a "where in" clause to the query
   */
  public whereIn(column: string, values: any[]): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "in", values, "and");

    return this;
  }

  /**
   * Adds an "or where in" clause to the query
   */
  public orWhereIn(column: string, values: any[]): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "in", values, "or");

    return this;
  }

  /**
   * Adds a "where not in" clause to the query
   */
  public whereNotIn(column: string, values: any[]): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "nin", values, "and");

    return this;
  }

  /**
   * Adds an "or where not in" clause to the query
   */
  public orWhereNotIn(column: string, values: any[]): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "nin", values, "or");

    return this;
  }

  /**
   * Adds a "where between" clause to the query
   */
  public whereBetween(column: string, values: [number, number?]): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "between", values, "and");

    return this;
  }

  /**
   * Adds an "or where between" clause to the query
   */
  public orWhereBetween(column: string, values: [number, number?]): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "between", values, "or");

    return this;
  }

  /**
   * Adds a "where null" clause to the query
   */
  public whereNull(column: string): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "eq", null, "and");

    return this;
  }

  /**
   * Adds an "or where null" clause to the query
   */
  public OrWhereNull(column: string): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "eq", null, "or");

    return this;
  }

  /**
   * Adds a "where not null" clause to the query
   */
  public whereNotNull(column: string): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", null, "and");

    return this;
  }

  /**
   * Adds an "or where not null" clause to the query
   */
  public orWhereNotNull(column: string): this {
    // Add the where clause to the $wheres array
    this.setWheres(column, "ne", null, "or");

    return this;
  }

  /**
   * Sets the query to include trashed data
   */
  public withTrashed(): this {
    // Set the $withTrashed property to true
    this.$withTrashed = true;

    return this;
  }

  /**
   * Sets the query to include only trashed data
   */
  public onlyTrashed(): this {
    // Set the $onlyTrashed property to true
    this.$onlyTrashed = true;
    return this;
  }

  /**
   * Sets the "offset" value of the query
   */
  public offset(value: number): this {
    // Add the $skip stage to the $stages array
    this.$offset = value;

    return this;
  }

  /**
   * Alias to set the "offset" value of the query
   */
  public skip(value: number): this {
    // Call the offset method
    return this.offset(value);
  }

  /**
   * Sets the "limit" value of the query
   */
  public limit(value: number): this {
    // Add the $limit stage to the $stages array
    this.$limit = value;

    return this;
  }

  /**
   * Alias to set the "limit" value of the query
   */
  public take(value: number): this {
    // Call the limit method
    return this.limit(value);
  }

  /**
   * Sets the limit and offset for a given page
   */
  public forPage(page: number, limit: number = 15): this {
    // Set the offset and limit for the given page
    return this.offset((page - 1) * limit).limit(limit);
  }

  /**
   * Adds an order by clause to the query
   */
  public orderBy(
    column: string,
    order: string = "asc",
    caseSensitive: boolean = false
  ): this {
    // Add the order by clause to the $orders array
    this.setOrders({ column, order, caseSensitive });

    return this;
  }

  /**
   * Adds a group by clause to the query
   */
  public groupBy(column: string): this {
    // Add the group by clause to the $groups array
    this.setGroups(column);

    return this;
  }

  /**
   * Sets the ID and retrieves the model
   */
  public async find(id: string | ObjectId): Promise<this> {
    const _id = new ObjectId(id);
    this.setId(_id);

    const data = await this.first();
    Object.assign(this, data);

    return this;
  }

  /**
   * Retrieves all documents from the collection, excluding soft-deleted ones if applicable
   */
  public async all() {
    try {
      return this.get();
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching all documents failed`);
    }
  }

  /**
   * Retrieves documents based on the specified columns and query stages
   */
  public async get<T extends typeof QueryBuilder>(
    columns: string | string[] = []
  ) {
    try {
      // Add the specified columns to the query
      this.setColumns(columns);

      // Execute the aggregation pipeline
      const aggregate = await this.aggregate();

      // Convert the aggregation cursor to an array of documents
      const data = (await aggregate.toArray()) as T["$schema"][];

      const collection = new Collection(...data);
      return collection;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  /**
   * Retrieves the first document that matches the query criteria
   */
  public async first(columns: string | string[] = []) {
    try {
      // Retrieve the documents based on the specified columns
      const data = await this.get(columns);
      // Return the first document if it exists, otherwise return null
      if (data && data.length > 0) {
        return data[0];
      }

      return null;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching first document failed`);
    }
  }

  /**
   * Retrieves the first document that matches the query criteria or throws an exception if not found
   */
  public async firstOrFail(columns: string | string[] = []) {
    const data = await this.first(columns);
    if (!data) throw new MongoloquentNotFoundException();
    return data;
  }

  /**
   * Retrieves the first document that matches the specified condition or creates a new one
   */
  public async firstOrCreate<T extends typeof QueryBuilder>(
    doc: FormSchema<T["$schema"]>
  ) {
    const collection = this.getCollection();

    if (this.$useSoftDelete) {
      doc = { ...doc, [this.getIsDeleted()]: false };
    }

    const data = await collection?.findOne(doc);
    if (!data) return await this.insert(doc);

    return data;
  }

  public async pluck(columns: string | string[] = []) {
    return (await this.get()).pluck(columns as any);
  }

  /**
   * Retrieves the count of documents in the collection
   */
  public async count(): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      //     await this.checkRelation();
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
      this.resetQuery();
      return aggregate?.total || 0;
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching document count failed`);
    }
  }

  /**
   * Retrieves the maximum value of a specified field
   */
  public async max(field: string): Promise<number> {
    return this.aggregation(field, "max");
  }

  /**
   * Retrieves the minimum value of a specified field
   */
  public async min(field: string): Promise<number> {
    return this.aggregation(field, "min");
  }

  /**
   * Retrieves the average value of a specified field
   */
  public async avg(field: string): Promise<number> {
    return this.aggregation(field, "avg");
  }

  /**
   * Retrieves the sum of a specified field
   */
  public async sum(field: string): Promise<number> {
    return this.aggregation(field, "sum");
  }

  /**
   * Performs aggregation operations on a specified field
   */
  private async aggregation(field: string, type: string): Promise<number> {
    try {
      // Get the collection from the database
      const collection = this.getCollection();
      //await this.checkRelation();
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

  private setId(id: ObjectId | string) {
    this.$id = id;
  }

  /**
   * Sets the stages for the query
   */
  private setStages(doc: Document | Document[]): void {
    if (Array.isArray(doc)) this.$stages = [...this.$stages, ...doc];
    else this.$stages = [...this.$stages, doc];
  }

  /**
   * Retrieves the stages for the query
   */
  protected getStages(): Document[] {
    return this.$stages;
  }

  /**
   * Sets the columns to be selected
   */
  private setColumns(columns: string | string[]): void {
    if (Array.isArray(columns)) this.$columns = [...this.$columns, ...columns];
    else this.$columns = [...this.$columns, columns];
  }

  /**
   * Sets the columns to be excluded
   */
  private setExcludes(columns: string | string[]): void {
    if (Array.isArray(columns))
      this.$excludes = [...this.$excludes, ...columns];
    else this.$excludes = [...this.$excludes, columns];
  }

  /**
   * Adds a basic where clause to the query
   */
  private setWheres(
    column: string,
    operator: any,
    value: any,
    boolean: string = "and"
  ): void {
    // Determine type of query E|R|S
    const ep = ["eq", "ne", "=", "!="];
    let type = "R";
    if (ep.includes(operator)) type = "E";

    // Add the where clause to the $wheres array
    this.$wheres = [
      ...this.$wheres,
      { column, operator: operator, value, boolean, type },
    ];
  }

  /**
   * Sets the orders for the query
   */
  private setOrders(doc: IQueryOrder): void {
    if (Array.isArray(doc)) this.$orders = [...this.$orders, ...doc];
    else this.$orders = [...this.$orders, doc];
  }

  /**
   * Sets the groups for the query
   */
  private setGroups(doc: string): void {
    if (Array.isArray(doc)) this.$groups = [...this.$groups, ...doc];
    else this.$groups = [...this.$groups, doc];
  }

  /**
   * Gets the field name for the soft delete flag
   */
  public getIsDeleted(): string {
    return this.$isDeleted;
  }

  /**
   * Checks if the soft delete feature is enabled and applies the necessary conditions
   */
  private checkSoftDelete(): void {
    // Check if soft delete is enabled and apply the necessary conditions
    if (!this.$withTrashed && !this.$onlyTrashed && this.$useSoftDelete)
      this.where(this.$isDeleted, false);
  }

  /**
   * Generates the selected columns for a query
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
   * Generates the excluded columns for a query
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
   * Generates the conditions for a query
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
        (op) => op.operator === el.operator || op.mongoOperator === el.operator
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
   * Generates the orders for a query
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
   * Generates the groups for a query
   */
  private generateGroups(): void {
    let _id = {};

    this.$groups.forEach((el) => {
      _id = { ..._id, [el]: `$${el}` };
    });

    const $group = {
      _id,
      count: { $sum: 1 },
    };

    if (this.$groups.length > 0) this.setStages({ $group });
  }

  /**
   * Generates the limit for a query
   */
  protected generateLimit(): void {
    if (this.$limit > 0) this.setStages({ $limit: this.$limit });
  }

  /**
   * Generates the offset for a query
   */
  protected generateOffset(): void {
    if (this.$offset > 0) this.setStages({ $skip: this.$offset });
  }

  /**
   * Aggregates the query stages and lookups, then executes the aggregation pipeline
   */
  private async aggregate() {
    try {
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
      //const lookups = this.getLookups();
      const aggregate = collection?.aggregate([...stages]);

      // Reset the query and relation states
      this.resetQuery();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
  }

  /**
   * Resets all query parameters to their default values
   */
  private resetQuery(): void {
    this.$withTrashed = false;
    this.$onlyTrashed = false;
    this.$stages = [];
    this.$excludes = [];
    this.$wheres = [];
    this.$orders = [];
    this.$groups = [];
    this.$offset = 0;
    this.$limit = 0;
  }
}
