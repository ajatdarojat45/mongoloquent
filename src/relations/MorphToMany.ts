import { Document, ObjectId } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphToMany } from "../interfaces/IRelation";

/**
 * MorphToMany relationship class
 *
 * Represents a polymorphic many-to-many relationship where a model can be related to many instances
 * of another model through a morph table.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @extends {QueryBuilder<M>}
 */
export default class MorphToMany<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;

  /**
   * Creates a new MorphToMany relationship
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
  public async first<K extends keyof M>(
    ...fields: (K | (string & {}) | (K | (string & {}))[])[]
  ) {
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
   * Attaches one or more related models to the parent model
   *
   * @template D - Type of additional pivot table data
   * @param {string | ObjectId | (string | ObjectId)[]} ids - ID or IDs of related models to attach
   * @param {Partial<D>} [doc] - Additional data to store in the pivot table
   * @returns {Promise<{message: string}>} Promise resolving to a success message
   */
  public async attach<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc?: Partial<D>,
  ) {
    let objectIds: ObjectId[] = [];
    let query = {};
    const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this["getCollection"](this.morphCollectionName);
    const _payload: object[] = [];

    query = {
      [foreignKey]: { $in: objectIds },
      [this.morphId]: this.model?.["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [foreignKey]: id,
        [this.morphId]: this.model?.["$id"],
        [this.morphType]: this.model.constructor.name,
        ...doc,
      }),
    );

    // find data
    const existingData = await collection.find(query).toArray();

    // payload to insert
    const payloadToInsert: object[] = [];
    const idsToUpdate: ObjectId[] = [];

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find((item: any) => {
        return (
          JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i])
        );
      });

      if (!existingItem) payloadToInsert.push(_payload[i]);
    }

    // insert data
    if (payloadToInsert.length > 0)
      await collection.insertMany(payloadToInsert as any);

    return {
      message: "Attach successfully",
    };
  }

  /**
   * Detaches one or more related models from the parent model
   *
   * @param {string | ObjectId | (string | ObjectId)[]} ids - ID or IDs of related models to detach (null/undefined to detach all)
   * @returns {Promise<{message: string}>} Promise resolving to a success message
   */
  public async detach(ids: string | ObjectId | (string | ObjectId)[]) {
    let objectIds: ObjectId[] = [];
    let isDeleteAll = false;
    const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    if (!Array.isArray(ids)) {
      objectIds = ids ? [new ObjectId(ids)] : [];
      isDeleteAll = !ids && true;
    } else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this["getCollection"](this.morphCollectionName);
    const query = {
      [foreignKey]: { $in: objectIds },
      [this.morphId]: this.model?.["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    isDeleteAll && delete query[foreignKey];

    await collection.deleteMany(query as any);

    return {
      message: "Detach successfully",
    };
  }

  /**
   * Syncs the relationship with the given IDs (attaches new relations, detaches removed relations)
   *
   * @template D - Type of additional pivot table data
   * @param {string | ObjectId | (string | ObjectId)[]} ids - ID or IDs to sync with
   * @param {Partial<D>} [doc] - Additional data to store in the pivot table
   * @returns {Promise<{message: string}>} Promise resolving to a success message
   */
  public async sync<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc?: Partial<D>,
  ) {
    let objectIds: ObjectId[] = [];
    const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    if (!Array.isArray(ids)) {
      objectIds = [new ObjectId(ids)];
    } else {
      objectIds = ids.map((el) => new ObjectId(el));
    }

    const collection = this["getCollection"](this.morphCollectionName);
    const _payload: object[] = [];
    let qFind = {};
    let qDelete = {};

    qFind = {
      [foreignKey]: { $in: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    qDelete = {
      [foreignKey]: { $nin: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [foreignKey]: id,
        [this.morphId]: this.model["$id"],
        [this.morphType]: this.model.constructor.name,
        ...doc,
      }),
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // payload to insert
    const payloadToInsert: object[] = [];

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
      );

      // insert if data does not exist
      if (!existingItem) payloadToInsert.push(_payload[i]);
    }

    // insert data
    if (payloadToInsert.length > 0)
      await collection.insertMany(payloadToInsert as any);

    // delete data
    await collection.deleteMany(qDelete);

    return {
      message: "Sync successfully",
    };
  }

  /**
   * Syncs the relationship with the given IDs without detaching existing relations
   *
   * @template D - Type of additional pivot table data
   * @param {string | ObjectId | (string | ObjectId)[]} ids - ID or IDs to sync with
   * @param {Partial<D>} [doc] - Additional data to store in the pivot table
   * @returns {Promise<{message: string}>} Promise resolving to a success message
   */
  public async syncWithoutDetaching<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc?: Partial<D>,
  ) {
    let objectIds: ObjectId[] = [];
    const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    if (!Array.isArray(ids)) {
      objectIds = [new ObjectId(ids)];
    } else {
      objectIds = ids.map((el) => new ObjectId(el));
    }

    const collection = this["getCollection"](this.morphCollectionName);
    const _payload: object[] = [];
    let qFind = {};
    let qDelete = {};
    let key = "";

    qFind = {
      [foreignKey]: { $in: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    qDelete = {
      [foreignKey]: { $nin: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [foreignKey]: id,
        [this.morphId]: this.model["$id"],
        [this.morphType]: this.model.constructor.name,
        ...doc,
      }),
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // payload to insert
    const payloadToInsert: object[] = [];

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
      );

      // insert if data does not exist
      if (!existingItem) payloadToInsert.push(_payload[i]);
    }

    // insert data
    if (payloadToInsert.length > 0)
      await collection.insertMany(payloadToInsert as any);

    return {
      message: "Sync successfully",
    };
  }

  /**
   * Syncs the relationship with the given IDs and updates pivot values for existing relations
   *
   * @template D - Type of additional pivot table data
   * @param {string | ObjectId | (string | ObjectId)[]} ids - ID or IDs to sync with
   * @param {Partial<D>} doc - Additional data to store/update in the pivot table
   * @returns {Promise<{message: string}>} Promise resolving to a success message
   */
  public async syncWithPivotValue<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<D>,
  ) {
    let objectIds: ObjectId[] = [];
    const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    if (!Array.isArray(ids)) {
      objectIds = [new ObjectId(ids)];
    } else {
      objectIds = ids.map((el) => new ObjectId(el));
    }

    const collection = this["getCollection"](this.morphCollectionName);
    const _payload: object[] = [];
    let qFind = {};
    let qDelete = {};

    qFind = {
      [foreignKey]: { $in: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    qDelete = {
      [foreignKey]: { $nin: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [foreignKey]: id,
        [this.morphId]: this.model["$id"],
        [this.morphType]: this.model.constructor.name,
        ...doc,
      }),
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // payload to insert
    const payloadToInsert: object[] = [];
    const idsToUpdate: ObjectId[] = [];

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
      );

      // insert if data does not exist
      if (!existingItem) payloadToInsert.push(_payload[i]);
      else idsToUpdate.push(objectIds[i]);
    }

    // insert data
    if (payloadToInsert.length > 0)
      await collection.insertMany(payloadToInsert as any);

    // update data
    if (idsToUpdate.length > 0) {
      await collection.updateMany(
        {
          [foreignKey as any]: { $in: idsToUpdate as any },
        },
        {
          $set: doc as any,
        },
      );
    }

    // delete data
    await collection.deleteMany(qDelete);

    return {
      message: "Sync successfully",
    };
  }

  /**
   * Toggles the relationship with the given IDs (attaches if not present, detaches if present)
   *
   * @param {string | ObjectId | (string | ObjectId)[]} ids - ID or IDs to toggle
   * @returns {Promise<{message: string}>} Promise resolving to a success message
   */
  public async toggle(ids: string | ObjectId | (string | ObjectId)[]) {
    let objectIds: ObjectId[] = [];
    const foreignKey = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    if (!Array.isArray(ids)) {
      objectIds = [new ObjectId(ids)];
    } else {
      objectIds = ids.map((el) => new ObjectId(el));
    }

    const collection = this["getCollection"](this.morphCollectionName);
    const _payload: object[] = [];
    let qFind = {};
    let qDelete = {};

    qFind = {
      [foreignKey]: { $in: objectIds },
      [this.morphId]: this.model["$id"],
      [this.morphType]: this.model.constructor.name,
    };

    objectIds.forEach((id) =>
      _payload.push({
        [foreignKey]: id,
        [this.morphId]: this.model["$id"],
        [this.morphType]: this.model.constructor.name,
      }),
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // payload to insert
    const payloadToInsert: object[] = [];

    // ids to delete
    const idsToDelete: ObjectId[] = [];

    // check data
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[foreignKey]) === JSON.stringify(objectIds[i]),
      );

      // insert if data does not exist
      if (!existingItem) payloadToInsert.push(_payload[i]);
      else idsToDelete.push(objectIds[i]);
    }

    // insert data
    if (payloadToInsert.length > 0)
      await collection.insertMany(payloadToInsert as any);

    // delete data
    if (idsToDelete.length > 0) {
      const qDelete = {
        [foreignKey]: { $in: idsToDelete },
        [this.morphId]: this.model["$id"],
        [this.morphType]: this.model.constructor.name,
      };

      await collection.deleteMany(qDelete as any);
    }

    return {
      message: "Toggle sync successfully",
    };
  }

  /**
   * Sets default condition for relation queries based on the parent model
   *
   * @private
   * @returns {Promise<void>}
   */
  private async setDefaultCondition() {
    const mtmColl = this["getCollection"](this.morphCollectionName);
    const key = `${this.relatedModel.constructor.name.toLowerCase()}Id`;

    const mtmIds = await mtmColl
      .find({
        [this.morphType]: this.model.constructor.name,
        [this.morphId]: (this.model["$original"] as any)["_id"],
      } as any)
      .map((el) => el[key as keyof typeof el])
      .toArray();

    this.whereIn("_id" as keyof M, mtmIds);
  }

  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the MorphToMany relation.
   * @param {IRelationMorphToMany} morphToMany - The MorphToMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(morphToMany: IRelationMorphToMany): Document[] {
    // Generate the lookup stages for the MorphToMany relationship
    const lookup = this.lookup(morphToMany);

    // Generate the select stages if options.select is provided
    if (morphToMany.options?.select) {
      const select = LookupBuilder.select(
        morphToMany.options.select,
        morphToMany.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphToMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        morphToMany.options.exclude,
        morphToMany.alias,
      );
      lookup.push(...exclude);
    }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphToMany relation.
   * @param {IRelationMorphToMany} morphToMany - The MorphToMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphToMany: IRelationMorphToMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphToMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphToMany.relatedModel.getIsDeleted()}`, false] },
            ],
          },
        },
      });
    }

    // Generate the sort stages if options.sort is provided
    if (morphToMany.options?.sort) {
      const sort = LookupBuilder.sort(
        morphToMany.options?.sort[0],
        morphToMany.options?.sort[1],
      );
      pipeline.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (morphToMany.options?.skip) {
      const skip = LookupBuilder.skip(morphToMany.options?.skip);
      pipeline.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (morphToMany.options?.limit) {
      const limit = LookupBuilder.limit(morphToMany.options?.limit);
      pipeline.push(limit);
    }

    morphToMany.model["$nested"].forEach((el) => {
      if (typeof morphToMany.relatedModel[el] === "function") {
        morphToMany.relatedModel["$alias"] = el;
        const nested = morphToMany.relatedModel[el]();
        pipeline.push(...nested.model.$lookups);
      }
    });

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: morphToMany.morphCollectionName,
          localField: "_id",
          foreignField: morphToMany.morphId,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        `$${morphToMany.morphType}`,
                        morphToMany.model.constructor.name,
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
          from: morphToMany.relatedModel["$collection"],
          localField: `pivot.${morphToMany.relatedModel.constructor.name.toLowerCase()}Id`,
          foreignField: "_id",
          as: morphToMany.alias || "alias",
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
