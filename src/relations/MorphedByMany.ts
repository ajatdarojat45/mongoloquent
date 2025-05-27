import { Document, ObjectId } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphedByMany } from "../interfaces/IRelation";

/**
 * MorphedByMany relationship class
 *
 * Represents a polymorphic many-to-many relationship where the current model can be related to many instances
 * of other models through a morph table.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @extends {QueryBuilder<M>}
 */
export default class MorphedByMany<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;

  /**
   * Creates a new MorphedByMany relationship
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
    this.morphId = `${morph}Id`;
    this.morphType = `${morph}Type`;
    this.morphCollectionName = `${morph}s`;

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
  public async all(): Promise<M[]> {
    await this.setDefaultCondition();
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
  public first<K extends keyof M>(...fields: (K | K[])[]) {
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
    const mbmColl = this["getCollection"](this.morphCollectionName);

    const mbmIds = await mbmColl
      .find({
        [this.morphType]: this.relatedModel.constructor.name,
        [`${this.model.constructor.name.toLowerCase()}Id`]: this.model["$id"],
      } as any)
      .map((el) => el[this.morphId as keyof typeof el] as unknown as ObjectId)
      .toArray();

    this.whereIn("_id" as keyof M, mbmIds);
  }

  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the MorphByMany relation.
   * @param {IRelationMorphedByMany} morphedByMany - The MorphByMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(morphedByMany: IRelationMorphedByMany): Document[] {
    // Generate the lookup stages for the MorphByMany relationship
    const lookup = this.lookup(morphedByMany);

    // Generate the select stages if options.select is provided
    if (morphedByMany.options?.select) {
      const select = LookupBuilder.select(
        morphedByMany.options.select,
        morphedByMany.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphedByMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        morphedByMany.options.exclude,
        morphedByMany.alias,
      );
      lookup.push(...exclude);
    }

    // // Generate the sort stages if options.sort is provided
    // if (morphedByMany.options?.sort) {
    //   const sort = LookupBuilder.sort(
    //     morphedByMany.options?.sort[0],
    //     morphedByMany.options?.sort[1],
    //   );
    //   lookup.push(sort);
    // }

    // // Generate the skip stages if options.skip is provided
    // if (morphedByMany.options?.skip) {
    //   const skip = LookupBuilder.skip(morphedByMany.options?.skip);
    //   lookup.push(skip);
    // }

    // // Generate the limit stages if options.limit is provided
    // if (morphedByMany.options?.limit) {
    //   const limit = LookupBuilder.limit(morphedByMany.options?.limit);
    //   lookup.push(limit);
    // }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphByMany relation.
   * @param {IRelationMorphedByMany} morphedByMany - The MorphByMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphedByMany: IRelationMorphedByMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphedByMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphedByMany.relatedModel.getIsDeleted()}`, false] },
            ],
          },
        },
      });
    }

    morphedByMany.model["$nested"].forEach(el => {
      if (typeof morphedByMany.relatedModel[el] === "function") {
        morphedByMany.relatedModel["$alias"] = el
        const nested = morphedByMany.relatedModel[el]()
        pipeline.push(...nested.model.$lookups)
      }
    })

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: morphedByMany.morphCollectionName,
          localField: "_id",
          foreignField: `${morphedByMany.model.constructor.name.toLowerCase()}Id`,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        `$${morphedByMany.morphType}`,
                        morphedByMany.relatedModel.constructor.name,
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: morphedByMany.relatedModel["$collection"],
          localField: `pivot.${morphedByMany.morphId}`,
          foreignField: "_id",
          as: morphedByMany.alias || "alias",
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
