import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphMany } from "../interfaces/IRelation";
import { FormSchema } from "../types/schema";

/**
 * MorphMany relationship class
 *
 * Represents a polymorphic one-to-many relationship where the related models can belong to more than one type of model.
 * For example, images might belong to posts or products through a polymorphic relation.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @extends {QueryBuilder<M>}
 */
export default class MorphMany<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  morph: string;
  morphId: string;
  morphType: string;

  /**
   * Creates a new MorphMany relationship
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

    this.$connection = relatedModel["$connection"];
    this.$collection = relatedModel["$collection"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$databaseName = relatedModel["$databaseName"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$useTimestamps = relatedModel["$useTimestamps"];
    this.$isDeleted = relatedModel["$isDeleted"];
  }

  /**
   * Finds the first record matching the filter or creates a new model instance with given attributes
   *
   * @param {Partial<FormSchema<M>>} filter - The filter to search for
   * @param {Partial<FormSchema<M>>} [doc] - The attributes to create a new instance with if none found
   * @returns {Promise<M>} Promise resolving to the found or new model instance
   */
  public firstOrNew(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const _filter = {
      ...filter,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    } as FormSchema<M>;
    return super.firstOrNew(_filter, doc);
  }

  /**
   * Finds the first record matching the filter or creates and persists a new model instance with given attributes
   *
   * @param {Partial<FormSchema<M>>} filter - The filter to search for
   * @param {Partial<FormSchema<M>>} [doc] - The attributes to create a new instance with if none found
   * @returns {Promise<M>} Promise resolving to the found or created model instance
   */
  public firstOrCreate(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const _filter = {
      ...filter,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    } as FormSchema<M>;

    return super.firstOrCreate(_filter, doc);
  }

  /**
   * Updates a record matching the filter or creates a new one with given attributes
   *
   * @param {Partial<FormSchema<M>>} filter - The filter to search for
   * @param {Partial<FormSchema<M>>} [doc] - The attributes to update or create with
   * @returns {Promise<M>} Promise resolving to the updated or created model instance
   */
  public updateOrCreate(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const _filter = {
      ...filter,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    } as FormSchema<M>;

    return super.updateOrCreate(_filter, doc);
  }

  /**
   * Saves a new related model instance with morph fields automatically set
   *
   * @param {Partial<FormSchema<M>>} doc - The attributes for the new model instance
   * @returns {Promise<M>} Promise resolving to the saved model instance
   */
  // @ts-ignore
  public save(doc: Partial<FormSchema<M>>) {
    const data = {
      ...doc,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    } as FormSchema<M>;

    return this.insert(data);
  }

  /**
   * Saves multiple related model instances with morph fields automatically set
   *
   * @param {Partial<FormSchema<M>>[]} docs - Array of attributes for the new model instances
   * @returns {Promise<M[]>} Promise resolving to the saved model instances
   */
  public saveMany(docs: Partial<FormSchema<M>>[]) {
    const data = docs.map((doc) => ({
      ...doc,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    })) as FormSchema<M>[];

    return this.insertMany(data);
  }

  /**
   * Creates a new related model instance (alias for save)
   *
   * @param {Partial<FormSchema<M>>} doc - The attributes for the new model instance
   * @returns {Promise<M>} Promise resolving to the created model instance
   */
  // @ts-ignore
  public create(doc: Partial<FormSchema<M>>) {
    return this.save(doc);
  }

  /**
   * Creates multiple related model instances (alias for saveMany)
   *
   * @param {Partial<FormSchema<M>>[]} docs - Array of attributes for the new model instances
   * @returns {Promise<M[]>} Promise resolving to the created model instances
   */
  // @ts-ignore
  public createMany(docs: Partial<FormSchema<M>>[]) {
    return this.saveMany(docs);
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
    this.where(this.morphType as keyof M, this.model.constructor.name).where(
      this.morphId as keyof M,
      (this.model["$original"] as any)["_id"],
    );
  }

  /**
   * Generates the lookup, select, and exclude stages for the MorphMany relation.
   * @param {IRelationMorphMany} morphMany - The MorphMany relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(morphMany: IRelationMorphMany): Document[] {
    // Generate the lookup stages for the MorphMany relationship
    const alias = morphMany.alias || "alias";
    const lookup = this.lookup(morphMany);

    // Generate the select stages if options.select is provided
    if (morphMany.options?.select) {
      const select = LookupBuilder.select(morphMany.options.select, alias);
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(morphMany.options.exclude, alias);
      lookup.push(...exclude);
    }

    // // Generate the sort stages if options.sort is provided
    // if (morphMany.options?.sort) {
    //   const sort = LookupBuilder.sort(
    //     morphMany.options?.sort[0],
    //     morphMany.options?.sort[1],
    //   );
    //   lookup.push(sort);
    // }

    // // Generate the skip stages if options.skip is provided
    // if (morphMany.options?.skip) {
    //   const skip = LookupBuilder.skip(morphMany.options?.skip);
    //   lookup.push(skip);
    // }

    // // Generate the limit stages if options.limit is provided
    // if (morphMany.options?.limit) {
    //   const limit = LookupBuilder.limit(morphMany.options?.limit);
    //   lookup.push(limit);
    // }

    // Return the combined lookup, select, and exclude stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphMany relation.
   * @param {IRelationMorphMany} morphMany - The MorphMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphMany: IRelationMorphMany): Document[] {
    const lookup: Document[] = [{ $project: { alias: 0 } }];
    const pipeline: Document[] = [];
    const alias = morphMany.alias || "alias";

    // Add soft delete condition to the pipeline if enabled
    if (morphMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphMany.relatedModel.getIsDeleted()}`, false] },
              {
                $eq: [
                  `$${morphMany.morphType}`,
                  morphMany.model.constructor.name,
                ],
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
                $eq: [
                  `$${morphMany.morphType}`,
                  morphMany.model.constructor.name,
                ],
              },
            ],
          },
        },
      });
    }

    morphMany.model["$nested"].forEach(el => {
      if (typeof morphMany.relatedModel[el] === "function") {
        morphMany.relatedModel["$alias"] = el
        const nested = morphMany.relatedModel[el]()
        pipeline.push(...nested.model.$lookups)
      }
    })

    // Define the $lookup stage
    const $lookup = {
      from: morphMany.relatedModel["$collection"],
      localField: "_id",
      foreignField: morphMany.morphId,
      as: alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    return lookup;
  }
}
