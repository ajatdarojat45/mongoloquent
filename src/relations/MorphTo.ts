import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphTo } from "../interfaces/IRelation";

/**
 * MorphTo relationship class
 *
 * Represents a polymorphic inverse relationship where a model belongs to another model,
 * but the related model could be of multiple types.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @extends {QueryBuilder<M>}
 */
export default class MorphTo<T, M> extends QueryBuilder<M> {
  private model: Model<T>;
  private relatedModel: Model<M>;
  private morph: string;
  private morphId: keyof T;
  private morphType: keyof T;

  /**
   * Creates a new MorphTo relationship
   *
   * @param {Model<T>} model - The parent model
   * @param {Model<M>} relatedModel - The related model
   * @param {string} morph - The base name for the morph relation
   */
  constructor(model: Model<T>, relatedModel: Model<M>, morph: string) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.morph = morph;
    this.morphId = `${morph}Id` as keyof T;
    this.morphType = `${morph}Type` as keyof T;

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
  public async get<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
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
  public first<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
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
  public async sum<K extends keyof M>(
    field: K | (string & {}),
  ): Promise<number> {
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
  public async min<K extends keyof M>(
    field: K | (string & {}),
  ): Promise<number> {
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
  public async max<K extends keyof M>(
    field: K | (string & {}),
  ): Promise<number> {
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
  public async avg<K extends keyof M>(
    field: K | (string & {}),
  ): Promise<number> {
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
    this.where(this.morphType as any, this.model.constructor.name).where(
      this.morphId as any,
      (this.model["$original"] as any)["_id"],
    );
  }

  /**
   * Generates the lookup, select, and exclude stages for the MorphTo relation.
   * @param {IRelationMorphTo} morphTo - The MorphTo relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(morphTo: IRelationMorphTo): Document[] {
    // Generate the lookup stages for the MorphTo relationship
    const alias = morphTo.alias || "alias";
    const lookup = this.lookup(morphTo);

    // Generate the select stages if options.select is provided
    if (morphTo.options?.select) {
      const select = LookupBuilder.select(morphTo.options.select, alias);
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphTo.options?.exclude) {
      const exclude = LookupBuilder.exclude(morphTo.options.exclude, alias);
      lookup.push(...exclude);
    }

    // Return the combined lookup, select, and exclude stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphTo relation.
   * @param {IRelationMorphTo} morphTo - The MorphTo relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphTo: IRelationMorphTo): Document[] {
    const alias = morphTo.alias || "alias";
    const lookup: Document[] = [{ $project: { alias: 0 } }];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphTo.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphTo.relatedModel.getIsDeleted()}`, false] },
              {
                $eq: [`$${morphTo.morphType}`, morphTo.model.constructor.name],
              },
            ],
          },
        },
      });
    } else {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: [`$${morphTo.morphType}`, morphTo.model.constructor.name],
              },
            ],
          },
        },
      });
    }

    morphTo.model["$nested"].forEach((el) => {
      if (typeof morphTo.relatedModel[el] === "function") {
        morphTo.relatedModel["$alias"] = el;
        const nested = morphTo.relatedModel[el]();
        pipeline.push(...nested.model.$lookups);
      }
    });

    // Define the $lookup stage
    const $lookup = {
      from: morphTo.relatedModel["$collection"],
      localField: "_id",
      foreignField: `${morphTo.morphId}`,
      as: alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $unwind stage to deconstruct the array field
    lookup.push({
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
