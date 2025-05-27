import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationBelongsTo } from "../interfaces/IRelation";

/**
 * Represents a BelongsTo relationship between two models.
 * This class handles the inverse side of a one-to-many or one-to-one relationship.
 * @template T - The type of the model that belongs to another model
 * @template M - The type of the related model (parent)
 */
export default class BelongsTo<T, M> extends QueryBuilder<M> {
  private model: Model<T>;
  private relatedModel: Model<M>;
  private foreignKey: keyof T;
  private ownerKey: keyof M;

  /**
   * Creates a new BelongsTo relation instance.
   * @param {Model<T>} model - The model that belongs to another model
   * @param {Model<M>} relatedModel - The related model (parent)
   * @param {keyof T} foreignKey - The foreign key on the owner model
   * @param {keyof M} ownerKey - The key on the related model that the foreign key references
   */
  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    foreignKey: keyof T,
    ownerKey: keyof M,
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.ownerKey = ownerKey;
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
   * Retrieves all related records.
   * @returns {Promise<M[]>} Promise that resolves with all matching related records
   */
  public all(): Promise<M[]> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.all();
  }

  /**
   * Retrieves specified fields from related records.
   * @template K - The keys of the related model
   * @param {(K | K[])[]} fields - The fields to retrieve
   * @returns {Promise<Pick<M, K>[]>} Promise that resolves with the selected fields
   */
  public get<K extends keyof M>(...fields: (K | K[])[]) {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.get(...fields);
  }

  /**
   * Retrieves paginated related records.
   * @param {number} page - The page number
   * @param {number} limit - The number of records per page
   * @returns {Promise<IModelPaginate>} Promise that resolves with paginated result
   */
  public paginate(
    page: number = 1,
    limit: number = 15,
  ): Promise<IModelPaginate> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.paginate(page, limit);
  }

  /**
   * Retrieves the first related record.
   * @template K - The keys of the related model
   * @param {(K | K[])[]} fields - The fields to retrieve
   * @returns {Promise<Pick<M, K> | null>} Promise that resolves with the first matching record or null
   */
  public first<K extends keyof M>(...fields: (K | K[])[]) {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.first(...fields);
  }

  /**
   * Counts the number of related records.
   * @returns {Promise<number>} Promise that resolves with the count of related records
   */
  public count(): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.count();
  }

  /**
   * Calculates the sum of a field in related records.
   * @template K - The keys of the related model
   * @param {K} field - The field to sum
   * @returns {Promise<number>} Promise that resolves with the sum
   */
  public sum<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.sum(field);
  }

  /**
   * Finds the minimum value of a field in related records.
   * @template K - The keys of the related model
   * @param {K} field - The field to check
   * @returns {Promise<number>} Promise that resolves with the minimum value
   */
  public min<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.min(field);
  }

  /**
   * Finds the maximum value of a field in related records.
   * @template K - The keys of the related model
   * @param {K} field - The field to check
   * @returns {Promise<number>} Promise that resolves with the maximum value
   */
  public max<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.max(field);
  }

  /**
   * Calculates the average of a field in related records.
   * @template K - The keys of the related model
   * @param {K} field - The field to average
   * @returns {Promise<number>} Promise that resolves with the average value
   */
  public avg<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.avg(field);
  }

  /**
   * Associates the related model with the current model.
   * @param {QueryBuilder<M>} model - The related model to associate
   * @returns {Model<T>} The current model instance
   */
  public associate(model: QueryBuilder<M>) {
    this.model[this.foreignKey as any] = model["$original"][this.ownerKey];
    return this.model;
  }

  /**
   * Removes the association between the current model and its related model.
   * @returns {Model<T>} The current model instance
   */
  public dissociate() {
    this.model[this.foreignKey as any] = null;
    return this.model;
  }

  /**
   * Alias for dissociate method. Removes the association between models.
   * @returns {Model<T>} The current model instance
   * @deprecated Use dissociate() instead
   */
  public disassociate() {
    this.model[this.foreignKey as any] = null;
    return this.model;
  }

  /**
   * Generates the MongoDB aggregation pipeline stages for belongsTo relationships.
   * @param {IRelationBelongsTo} belongsTo - The belongsTo relation details
   * @return {Document[]} The MongoDB aggregation pipeline stages
   */
  public static generate(belongsTo: IRelationBelongsTo): Document[] {
    // Generate the lookup stages for the belongsTo relationship
    const lookup = this.lookup(belongsTo);

    // Generate the select stages if options.select is provided
    if (belongsTo.options?.select) {
      const select = LookupBuilder.select(
        belongsTo.options.select,
        belongsTo.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (belongsTo.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        belongsTo.options.exclude,
        belongsTo.alias,
      );
      lookup.push(...exclude);
    }

    // Return the combined lookup, select, and exclude stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the belongsTo relation.
   * @param {IRelationBelongsTo} belongsTo - The belongsTo relation details
   * @return {Document[]} The MongoDB lookup pipeline stages
   */
  static lookup(belongsTo: IRelationBelongsTo): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (belongsTo.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${belongsTo.relatedModel["$isDeleted"]}`, false] },
            ],
          },
        },
      });
    }

    belongsTo.model["$nested"].forEach(el => {
      if (typeof belongsTo.relatedModel[el] === "function") {
        belongsTo.relatedModel["$alias"] = el
        const nested = belongsTo.relatedModel[el]()
        pipeline.push(...nested.model.$lookups)
      }
    })

    // Define the $lookup stage
    const $lookup = {
      from: belongsTo.relatedModel["$collection"],
      localField: belongsTo.foreignKey,
      foreignField: belongsTo.ownerKey,
      as: belongsTo.alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({
      $lookup,
    });

    // Define the $unwind stage
    const _unwind = {
      $unwind: {
        path: `$${belongsTo.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    // Add the $unwind stage to the lookup array
    lookup.push(_unwind);

    return lookup;
  }
}
