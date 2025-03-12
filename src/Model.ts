import {
  BulkWriteOptions,
  FindOneAndUpdateOptions,
  InsertOneOptions,
  ObjectId,
  UpdateFilter,
  UpdateOptions,
} from "mongodb";
import Relation from "./Relation";
import dayjs from "./utils/dayjs";
import { TIMEZONE } from "./configs/app";
import { IModelPaginate } from "./interfaces/IModel";
import { IRelationTypes } from "./interfaces/IRelation";
import { throws } from "assert";
import ModelNotFoundException from "./exceptions/ModelNotFoundException";

export default class Model extends Relation {
  /**
   * @note This property defines timestamps for the document.
   *
   * @var string
   */
  protected static $useTimestamps: boolean = true;

  /**
   * @note This property defines timezones for the document.
   *
   * @var string
   */
  protected static $timezone: string = TIMEZONE;

  /**
   * @note This property defines the name of the "created at" column.
   *
   * @var string
   */
  protected static $createdAt = "CREATED_AT";

  /**
   * @note This property defines the name of the "updated at" column.
   *
   * @var string
   */
  protected static $updatedAt = "UPDATED_AT";

  /**
   * @note This method retrieves all documents from the collection, excluding soft-deleted ones if applicable.
   *
   * @return Promise<WithId<Document>[]>
   */
  public static async all() {
    try {
      // Get the collection from the database
      const collection = this.getCollection();

      let query = {};

      // If soft delete is enabled, exclude soft-deleted documents
      if (this.$useSoftDelete) query = { [this.getIsDeleted()]: false };

      // Retrieve all documents matching the query
      return await collection.find(query).toArray();
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching all documents failed`);
    }
  }

  /**
   * @note This method retrieves documents based on the specified columns and query stages.
   *
   * @param columns - The columns to retrieve.
   * @return Promise<Document[]>
   */
  public static async get(columns: string | string[] = []) {
    try {
      // Add the specified columns to the query
      this.setColumns(columns);

      // Execute the aggregation pipeline
      const aggregate = await this.aggregate();

      // Convert the aggregation cursor to an array of documents
      return await aggregate.toArray();
    } catch (error) {
      console.log(error);
      throw new Error(`Fetching documents failed`);
    }
  }

  /**
   * @note This method retrieves paginated documents from the collection.
   *
   * @param page - The page number to retrieve.
   * @param perPage - The number of documents per page.
   * @return Promise<IPaginate>
   */
  public static async paginate(
    page: number = 1,
    limit: number = this.$limit
  ): Promise<IModelPaginate> {
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
   * @note This method retrieves the first document that matches the query criteria.
   *
   * @param columns - The columns to retrieve.
   * @return Promise<Document|null>
   */
  public static async first(columns: string | string[] = []) {
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

  public static async firstWhere(
    column: string,
    operator: any,
    value: any = null
  ) {
    this.where(column, operator, value);
    return this.first();
  }

  public static async firstOrFail(columns: string | string[] = []) {
    const data = await this.first(columns);

    if (!data) throw new ModelNotFoundException();

    return data;
  }

  public static async firstOrCreate(doc: object) {
    const collection = this.getCollection();

    const data = await collection.findOne(doc);
    if (!data) return await this.insert(doc);

    return data;
  }

  public static async firstOrNew(doc: object) {
    return this.firstOrCreate(doc);
  }

  /**
   * @note This method retrieves the values of a specific column from the query results.
   *
   * @param column - The column to pluck.
   * @return Promise<any>
   */
  public static async pluck(column: string): Promise<any> {
    try {
      // Retrieve the documents matching the query
      const data = (await this.get()) as any[];

      // Map the documents to extract the values of the specified column
      return data.map((el) => el[column]);
    } catch (error) {
      console.log(error);
      throw new Error(`Plucking column values failed`);
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
      return { _id: data.insertedId, ...newDoc };
    } catch (error) {
      console.log(error);
      throw new Error(`Inserting document failed`);
    }
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
    docs: object[],
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

  static async updateOrCreate(doc: { [key: string]: any }) {
    const collection = this.getCollection();
    const data = await collection.findOne(doc);
    if (!data) return this.insert(doc);

    for (var key in doc) {
      if (doc.hasOwnProperty(key)) {
        this.where(key, doc[key]);
      }
    }

    return this.update(doc);
  }

  /**
   * @note This method updates multiple documents in the collection, applying timestamps and soft delete if applicable.
   *
   * @param doc - The documents to update.
   * @param options - Optional update options.
   * @return Promise<number>
   */
  public static async update(
    doc: UpdateFilter<Document>,
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
   * @note This method deletes documents by their IDs, applying soft delete if applicable.
   *
   * @param ids - The ids of the documents to destroy.
   * @return Promise<{ deletedCount: number }>
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
   * @note This method deletes multiple documents from the collection, applying soft delete if applicable.
   *
   * @return Promise<{ deletedCount: number }>
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

        return data.modifiedCount
      }

      // Delete the documents from the collection
      const data = await collection.deleteMany(filter);
      // Reset the query state
      this.reset();

      return data.deletedCount
    } catch (error) {
      console.log(error);
      throw new Error(`Deleting multiple documents failed`);
    }
  }

  /**
   * @note This method forcefully deletes documents from the collection, bypassing soft delete.
   *
   * This method protects developers from running forceDelete when the trait is missing.
   *
   * @return Promise<{ deletedCount: number }>
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
      return data.deletedCount
    } catch (error) {
      console.log(error);
      throw new Error(`Force deleting documents failed`);
    }
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

      return data.deletedCount
    } catch (error) {
      console.log(error);
      throw new Error(`Force destroying documents failed`);
    }
  }

  /**
   * @note This method restores soft deleted documents by setting isDeleted to false.
   *
   * @return Promise<{ modifiedCount: number }>
   */
  public static async restore(): Promise<number> {
    try {
      // Only include soft-deleted documents in the query
      this.onlyTrashed();

      // Update the documents to mark them as not deleted
      return await this.update({ [this.$isDeleted]: false });
    } catch (error) {
      console.log(error);
      throw new Error(`Restoring documents failed`);
    }
  }

  /**
   * @note This method performs aggregation operations on a specified field.
   *
   * @param field - The field to aggregate.
   * @param type - The type of aggregation (e.g., "max", "min", "avg", "sum").
   * @return Promise<number>
   */
  private static async aggregation(
    field: string,
    type: string
  ): Promise<number> {
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
                [`$${type}`]: `$${field}`,
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
   * @note This method retrieves the maximum value of a specified field.
   *
   * @param field - The field to get the maximum value of.
   * @return Promise<number>
   */
  public static async max(field: string): Promise<number> {
    return this.aggregation(field, "max");
  }

  /**
   * @note This method retrieves the minimum value of a specified field.
   *
   * @param field - The field to get the minimum value of.
   * @return Promise<number>
   */
  public static async min(field: string): Promise<number> {
    return this.aggregation(field, "min");
  }

  /**
   * @note This method retrieves the average value of a specified field.
   *
   * @param field - The field to get the average value of.
   * @return Promise<number>
   */
  public static async avg(field: string): Promise<number> {
    return this.aggregation(field, "avg");
  }

  public static async average(field: string) {
    return this.avg(field)
  }

  /**
   * @note This method retrieves the sum of a specified field.
   *
   * @param field - The field to get the sum of.
   * @return Promise<number>
   */
  public static async sum(field: string): Promise<number> {
    return this.aggregation(field, "sum");
  }

  /**
   * @note This method retrieves the count of documents in the collection.
   *
   * @return Promise<number>
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

  public static async contains(value: any): Promise<boolean> {
    const collection = this.getCollection()
    const exists = await collection.findOne({
      $expr: {
        $gt: [
          {
            $size: {
              $filter: {
                input: { $objectToArray: "$$ROOT" },
                as: "field",
                cond: { $eq: ["$$field.v", value] }
              }
            }
          },
          0
        ]
      }
    }) !== null;

    return exists
  }

  /**
   * @note This method aggregates the query stages and lookups, then executes the aggregation pipeline.
   *
   * @return Promise<AggregationCursor<Document>>
   */
  private static async aggregate() {
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
      const aggregate = collection.aggregate([...stages, ...lookups]);

      // Reset the query and relation states
      this.reset();

      return aggregate;
    } catch (error) {
      console.log(error);
      throw new Error(`Aggregation failed`);
    }
  }

  /**
   * @note This method applies created_at and updated_at timestamps to the document if $useTimestamps is true.
   *
   * @param doc - The document to check.
   * @param isNew - Whether the document is new.
   * @return object
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
   * @note This method applies isDeleted and deleted_at fields to the document if $useSoftDelete is true.
   *
   * @param doc - The document to check.
   * @param isDeleted - Whether the document is deleted.
   * @return object
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
   * @note This method checks and applies relationship fields to the document.
   *
   * @param doc - The document to check.
   * @return object
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
   * @note This method resets the query and relation states.
   */
  private static reset(): void {
    const relatedModel = this.getRelatedModel();
    if (relatedModel) relatedModel.reset();

    this.resetQuery();
    this.resetRelation();
  }

  /**
   * @note This method checks and applies relationship conditions to the query.
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
