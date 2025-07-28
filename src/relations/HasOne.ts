import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationHasOne } from "../interfaces/IRelation";

/**
 * HasOne relationship class
 *
 * Represents a one-to-one relationship between two models where the related model
 * contains a foreign key referencing the parent model.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @extends {QueryBuilder<M>}
 */
export default class HasOne<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  foreignKey: keyof M;
  localKey: keyof T;

  /**
   * Creates a new HasOne relationship
   *
   * @param {Model<T>} model - The parent model
   * @param {Model<M>} relatedModel - The related model
   * @param {keyof M} foreignKey - The foreign key on the related model that references the parent model
   * @param {keyof T} localKey - The primary key on the parent model
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
    this.foreignKey = foreignKey;
    this.localKey = localKey;

    this.$connection = relatedModel["$connection"];
    this.$collection = relatedModel["$collection"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$databaseName = relatedModel["$databaseName"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$useTimestamps = relatedModel["$useTimestamps"];
    this.$isDeleted = relatedModel["$isDeleted"];
  }

  /**
   * Retrieves all related records
   *
   * @returns {Promise<M[]>} Promise resolving to an array of related model instances
   */
  public all(): Promise<M[]> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.all();
  }

  /**
   * Retrieves related records with specified fields
   *
   * @template K - Keys of the related model
   * @param {...(K | K[])[]} fields - Fields to retrieve
   * @returns {Promise<Pick<M, K>[]>} Promise resolving to an array of related model instances with selected fields
   */
  public get<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.get(...fields);
  }

  /**
   * Paginates the related records
   *
   * @param {number} page - Page number (starting from 1)
   * @param {number} limit - Number of records per page
   * @returns {Promise<IModelPaginate>} Promise resolving to paginated results
   */
  public paginate(
    page: number = 1,
    limit: number = 15,
  ): Promise<IModelPaginate> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.paginate(page, limit);
  }

  /**
   * Retrieves the first related record with specified fields
   *
   * @template K - Keys of the related model
   * @param {...(K | K[])[]} fields - Fields to retrieve
   * @returns {Promise<Pick<M, K> | null>} Promise resolving to the first related record or null
   */
  public first<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.first(...fields);
  }

  /**
   * Counts the number of related records
   *
   * @returns {Promise<number>} Promise resolving to the count of related records
   */
  public count(): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.count();
  }

  /**
   * Calculates the sum of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to sum
   * @returns {Promise<number>} Promise resolving to the sum
   */
  public sum<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.sum(field);
  }

  /**
   * Finds the minimum value of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to find minimum value for
   * @returns {Promise<number>} Promise resolving to the minimum value
   */
  public min<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.min(field);
  }

  /**
   * Finds the maximum value of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to find maximum value for
   * @returns {Promise<number>} Promise resolving to the maximum value
   */
  public max<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.max(field);
  }

  /**
   * Calculates the average value of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to calculate average for
   * @returns {Promise<number>} Promise resolving to the average value
   */
  public avg<K extends keyof M>(field: K | (string & {})): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.avg(field);
  }

  /**
   * Generates the lookup, select, and exclude stages for the HasOne relation.
   *
   * @param {IRelationHasOne} hasOne - The HasOne relation configuration.
   * @return {Document[]} The combined lookup, select and exclude stages.
   */
  static generate(hasOne: IRelationHasOne): Document[] {
    const lookup = this.lookup(hasOne);

    if (hasOne.options?.select) {
      const select = LookupBuilder.select(hasOne.options.select, hasOne.alias);
      lookup.push(...select);
    }

    if (hasOne.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        hasOne.options.exclude,
        hasOne.alias,
      );
      lookup.push(...exclude);
    }

    return lookup;
  }

  /**
   * Generates the lookup stages for the HasOne relation.
   *
   * @param {IRelationHasOne} hasOne - The HasOne relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(hasOne: IRelationHasOne): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasOne.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasOne.relatedModel["$isDeleted"]}`, false] }],
          },
        },
      });
    }

    const $lookup = {
      from: hasOne.relatedModel["$collection"],
      localField: hasOne.localKey,
      foreignField: hasOne.foreignKey,
      as: hasOne.alias,
      pipeline: pipeline,
    };

    lookup.push({ $lookup });

    lookup.push({
      $unwind: {
        path: `$${hasOne.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
