import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationHasMany } from "../interfaces/IRelation";
import { FormSchema } from "../types/schema";

/**
 * HasMany relationship class for handling one-to-many relationships between models
 * @template T Type of the parent model
 * @template M Type of the related model(s)
 * @extends QueryBuilder<M>
 */
export default class HasMany<T, M> extends QueryBuilder<M> {
  /**
   * Parent model instance
   * @type {Model<T>}
   */
  model: Model<T>;

  /**
   * Related model instance
   * @type {Model<M>}
   */
  relatedModel: Model<M>;

  /**
   * Local key on the parent model (usually the primary key)
   * @type {keyof T}
   */
  localKey: keyof T;

  /**
   * Foreign key on the related model that references the parent model
   * @type {keyof M}
   */
  foreignKey: keyof M;

  /**
   * Creates a new HasMany relationship instance
   * @param {Model<T>} model Parent model instance
   * @param {Model<M>} relatedModel Related model instance
   * @param {keyof M} foreignKey Foreign key on the related model
   * @param {keyof T} localKey Local key on the parent model
   */
  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    foreignKey: keyof M,
    localKey: keyof T,
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.localKey = localKey;
    this.foreignKey = foreignKey;
    this.$connection = relatedModel["$connection"];
    this.$collection = relatedModel["$collection"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$databaseName = relatedModel["$databaseName"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$useTimestamps = relatedModel["$useTimestamps"];
    this.$isDeleted = relatedModel["$isDeleted"];
  }

  /**
   * Gets the first matching related model or initializes a new one with the relationship context
   * @param {Partial<FormSchema<M>>} filter Filter to find an existing model
   * @param {Partial<FormSchema<M>>} [doc] Default values for the new model if none found
   * @returns {Promise<M>} Found or initialized model with relationship attributes
   */
  public firstOrNew(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const _filter = {
      ...filter,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;
    return super.firstOrNew(_filter, doc);
  }

  /**
   * Gets the first matching related model or creates a new one with the relationship context
   * @param {Partial<FormSchema<M>>} filter Filter to find an existing model
   * @param {Partial<FormSchema<M>>} [doc] Values for the new model if none found
   * @returns {Promise<M>} Found or created model with relationship attributes
   */
  public firstOrCreate(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const _filter = {
      ...filter,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;
    return super.firstOrCreate(_filter, doc);
  }

  /**
   * Updates a related model if it exists or creates it with the relationship context
   * @param {Partial<FormSchema<M>>} filter Filter to find an existing model
   * @param {Partial<FormSchema<M>>} doc Values for update or creation
   * @returns {Promise<M>} Updated or created model with relationship attributes
   */
  public updateOrCreate(
    filter: Partial<FormSchema<M>>,
    doc: Partial<FormSchema<M>>,
  ) {
    const _filter = {
      ...filter,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;
    return super.updateOrCreate(_filter, doc);
  }

  /**
   * Saves a new related model with the relationship context
   * @param {Partial<M>} doc Model data to save
   * @returns {Promise<M>} Created model with relationship attributes
   */
  // @ts-ignore
  public save(doc: Partial<M>) {
    const data = {
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;

    return this.insert(data);
  }

  /**
   * Saves multiple new related models with the relationship context
   * @param {Partial<M>[]} docs Array of model data to save
   * @returns {Promise<ObjectId[]>} Array of created model IDs
   */
  public saveMany(docs: Partial<M>[]) {
    const data = docs.map((doc) => ({
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    })) as FormSchema<M>[];

    return this.insertMany(data);
  }

  /**
   * Alias for save method
   * @param {Partial<M>} doc Model data to create
   * @returns {Promise<M>} Created model with relationship attributes
   */
  // @ts-ignore
  public create(doc: Partial<M>) {
    return this.save(doc);
  }

  /**
   * Alias for saveMany method
   * @param {Partial<M>[]} docs Array of model data to create
   * @returns {Promise<ObjectId[]>} Array of created model IDs
   */
  // @ts-ignore
  public createMany(docs: Partial<M>[]) {
    return this.saveMany(docs);
  }

  /**
   * Gets all related models for this relationship
   * @returns {Promise<M[]>} Array of related models
   */
  public all(): Promise<M[]> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.all();
  }

  /**
   * Gets related models with specified fields
   * @template K Key type of the related model
   * @param {...(K | K[])[]} fields Fields to select
   * @returns {Promise<Collection<M>>} Collection of related models
   */
  public get<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.get(...fields);
  }

  /**
   * Gets paginated related models
   * @param {number} [page=1] Page number
   * @param {number} [limit=15] Items per page
   * @returns {Promise<IModelPaginate>} Paginated results with metadata
   */
  public paginate(
    page: number = 1,
    limit: number = 15,
  ): Promise<IModelPaginate> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.paginate(page, limit);
  }

  /**
   * Gets the first related model matching the criteria
   * @template K Key type of the related model
   * @param {...(K | K[])[]} fields Fields to select
   * @returns {Promise<M | null>} First matching related model or null
   */
  public first<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.first(...fields);
  }

  /**
   * Counts the number of related models
   * @returns {Promise<number>} Count of related models
   */
  public count(): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.count();
  }

  /**
   * Calculates the sum of a field across all related models
   * @template K Key type of the related model
   * @param {K} field Field to sum
   * @returns {Promise<number>} Sum of the field values
   */
  public sum<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.sum(field);
  }

  /**
   * Finds the minimum value of a field across all related models
   * @template K Key type of the related model
   * @param {K} field Field to check
   * @returns {Promise<number>} Minimum value of the field
   */
  public min<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.min(field);
  }

  /**
   * Finds the maximum value of a field across all related models
   * @template K Key type of the related model
   * @param {K} field Field to check
   * @returns {Promise<number>} Maximum value of the field
   */
  public max<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.max(field);
  }

  /**
   * Calculates the average value of a field across all related models
   * @template K Key type of the related model
   * @param {K} field Field to average
   * @returns {Promise<number>} Average value of the field
   */
  public avg<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.avg(field);
  }

  /**
   * Generates MongoDB aggregation pipeline stages for hasMany relationship
   * @param {IRelationHasMany} hasMany Relationship configuration
   * @returns {Document[]} Array of MongoDB aggregation stages
   */
  public static generate(hasMany: IRelationHasMany): Document[] {
    // Generate the lookup stages for the hasMany relationship
    const lookup = this.lookup(hasMany);

    // Generate the select stages if options.select is provided
    if (hasMany.options?.select) {
      const select = LookupBuilder.select(
        hasMany.options.select,
        hasMany.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        hasMany.options.exclude,
        hasMany.alias,
      );
      lookup.push(...exclude);
    }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Creates the lookup stage for the hasMany relationship
   * @param {IRelationHasMany} hasMany Relationship configuration
   * @returns {Document[]} Array of MongoDB aggregation lookup stages
   */
  public static lookup(hasMany: IRelationHasMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasMany.relatedModel["$isDeleted"]}`, false] }],
          },
        },
      });
    }

    // Generate the sort stages if options.sort is provided
    if (hasMany.options?.sort) {
      const sort = LookupBuilder.sort(
        hasMany.options?.sort[0],
        hasMany.options?.sort[1],
      );
      pipeline.push(sort);
    }

    //  Generate the skip stages if options.skip is provided
    if (hasMany.options?.skip) {
      const skip = LookupBuilder.skip(hasMany.options?.skip);
      pipeline.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (hasMany.options?.limit) {
      const limit = LookupBuilder.limit(hasMany.options?.limit);
      pipeline.push(limit);
    }

    hasMany.model["$nested"].forEach((el) => {
      if (typeof hasMany.relatedModel[el] === "function") {
        hasMany.relatedModel["$alias"] = el;
        const nested = hasMany.relatedModel[el]();
        pipeline.push(...nested.model.$lookups);
      }
    });

    // Define the $lookup stage
    const $lookup = {
      from: hasMany.relatedModel["$collection"],
      localField: hasMany.localKey,
      foreignField: hasMany.foreignKey,
      as: hasMany.alias || "alias",
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $project stage to exclude the alias field
    lookup.push({
      $project: {
        alias: 0,
      },
    });

    return lookup;
  }
}
