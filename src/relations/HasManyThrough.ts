import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationHasManyThrough } from "../interfaces/IRelation";

/**
 * HasManyThrough relationship class
 *
 * Represents a relationship where a model can access distant relations through an intermediate model.
 * For example, a Country model might have many Posts through a User model.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @template TM - Type of the intermediate/through model
 * @extends {QueryBuilder<M>}
 */
export default class HasManyThrough<T, M, TM> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  throughModel: Model<TM>;
  foreignKey: keyof TM;
  foreignKeyThrough: keyof M;
  localKey: keyof T;
  localKeyThrough: keyof TM;

  /**
   * Creates a new HasManyThrough relationship
   *
   * @param {Model<T>} model - The parent model
   * @param {Model<M>} relatedModel - The related model
   * @param {Model<TM>} throughModel - The intermediate model
   * @param {keyof TM} foreignKey - The foreign key on the intermediate model that references the parent model
   * @param {keyof M} foreignKeyThrough - The foreign key on the related model that references the intermediate model
   * @param {keyof T} localKey - The primary key on the parent model
   * @param {keyof TM} localKeyThrough - The primary key on the intermediate model
   */
  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    throughModel: Model<TM>,
    foreignKey: keyof TM,
    foreignKeyThrough: keyof M,
    localKey: keyof T,
    localKeyThrough: keyof TM,
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.throughModel = throughModel;
    this.foreignKey = foreignKey;
    this.foreignKeyThrough = foreignKeyThrough;
    this.localKey = localKey;
    this.localKeyThrough = localKeyThrough;
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
    return super.all();
  }

  /**
   * Retrieves related records with specified fields
   *
   * @template K - Keys of the related model
   * @param {...(K | K[])[]} fields - Fields to retrieve
   * @returns {Promise<Pick<M, K>[]>} Promise resolving to an array of related model instances with selected fields
   */
  public async get<K extends keyof M>(...fields: (K | K[])[]) {
    await this.setDefaultCondition();
    return super.get(...fields);
  }

  /**
   * Paginates the related records
   *
   * @param {number} page - Page number (starting from 1)
   * @param {number} limit - Number of records per page
   * @returns {Promise<IModelPaginate>} Promise resolving to paginated results
   */
  public async paginate(
    page: number = 1,
    limit: number = 15,
  ): Promise<IModelPaginate> {
    await this.setDefaultCondition();

    return super.paginate(page, limit);
  }

  /**
   * Retrieves the first related record with specified fields
   *
   * @template K - Keys of the related model
   * @param {...(K | K[])[]} fields - Fields to retrieve
   * @returns {Promise<Pick<M, K> | null>} Promise resolving to the first related record or null
   */
  public async first<K extends keyof M>(...fields: (K | K[])[]) {
    await this.setDefaultCondition();
    return super.first(...fields);
  }

  /**
   * Counts the number of related records
   *
   * @returns {Promise<number>} Promise resolving to the count of related records
   */
  public async count(): Promise<number> {
    await this.setDefaultCondition();
    return super.count();
  }

  /**
   * Calculates the sum of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to sum
   * @returns {Promise<number>} Promise resolving to the sum
   */
  public async sum<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.sum(field);
  }

  /**
   * Finds the minimum value of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to find minimum value for
   * @returns {Promise<number>} Promise resolving to the minimum value
   */
  public async min<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.min(field);
  }

  /**
   * Finds the maximum value of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to find maximum value for
   * @returns {Promise<number>} Promise resolving to the maximum value
   */
  public async max<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.max(field);
  }

  /**
   * Calculates the average value of a field in related records
   *
   * @template K - Keys of the related model
   * @param {K} field - The field to calculate average for
   * @returns {Promise<number>} Promise resolving to the average value
   */
  public async avg<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.avg(field);
  }

  /**
   * Sets default condition for relation queries based on the parent model
   *
   * @private
   * @returns {Promise<void>}
   */
  private async setDefaultCondition() {
    const hmtIds = await this.throughModel
      .withTrashed()
      .where(this.foreignKey, this.model["$original"][this.localKey])
      .pluck(this.localKeyThrough);

    this.whereIn(this.foreignKeyThrough, hmtIds);
  }

  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the HasManyThrough relation.
   * @param {IRelationHasManyThrough} hasManyThrough - The HasManyThrough relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(hasManyThrough: IRelationHasManyThrough): Document[] {
    // Generate the lookup stages for the HasManyThrough relationship
    const lookup = this.lookup(hasManyThrough);

    // Generate the select stages if options.select is provided
    if (hasManyThrough.options?.select) {
      const select = LookupBuilder.select(
        hasManyThrough.options.select,
        hasManyThrough.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasManyThrough.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        hasManyThrough.options.exclude,
        hasManyThrough.alias,
      );
      lookup.push(...exclude);
    }

    // // Generate the sort stages if options.sort is provided
    // if (hasManyThrough.options?.sort) {
    //   const sort = LookupBuilder.sort(
    //     hasManyThrough.options?.sort[0],
    //     hasManyThrough.options?.sort[1],
    //   );
    //   lookup.push(sort);
    // }

    // // Generate the skip stages if options.skip is provided
    // if (hasManyThrough.options?.skip) {
    //   const skip = LookupBuilder.skip(hasManyThrough.options?.skip);
    //   lookup.push(skip);
    // }

    // // Generate the limit stages if options.limit is provided
    // if (hasManyThrough.options?.limit) {
    //   const limit = LookupBuilder.limit(hasManyThrough.options?.limit);
    //   lookup.push(limit);
    // }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the HasManyThrough relation.
   * @param {IRelationHasManyThrough} hasManyThrough - The HasManyThrough relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(hasManyThrough: IRelationHasManyThrough): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasManyThrough.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${hasManyThrough.relatedModel["$isDeleted"]}`, false] },
            ],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: hasManyThrough.throughModel["$collection"],
          localField: hasManyThrough.localKey,
          foreignField: hasManyThrough.foreignKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: hasManyThrough.relatedModel["$collection"],
          localField: `pivot.${hasManyThrough.localKeyThrough}`,
          foreignField: `${hasManyThrough.foreignKeyThrough}`,
          as: hasManyThrough.alias || "alias",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
          alias: 0,
        },
      },
    );

    return lookup;
  }
}
