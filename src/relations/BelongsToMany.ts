import { Document, ObjectId } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationBelongsToMany } from "../interfaces/IRelation";

/**
 * BelongsToMany relationship class
 *
 * Represents a many-to-many relationship between two models through a pivot model.
 *
 * @template T - Type of the parent model
 * @template M - Type of the related model
 * @template PM - Type of the pivot model
 * @extends {QueryBuilder<M>}
 */
export default class BelongsToMany<T, M, PM> extends QueryBuilder<M> {
  private model: Model<T>;
  private relatedModel: Model<M>;
  private pivotModel: Model<PM>;
  private foreignPivotKey: keyof PM;
  private relatedPivotKey: keyof PM;
  private parentKey: keyof T;
  private relatedKey: keyof M;

  /**
   * Creates a new BelongsToMany relationship
   *
   * @param {Model<T>} model - The parent model
   * @param {Model<M>} relatedModel - The related model
   * @param {Model<PM>} pivotModel - The pivot/junction model
   * @param {keyof PM} foreignPivotKey - The foreign key on the pivot table that references the parent model
   * @param {keyof PM} relatedPivotKey - The foreign key on the pivot table that references the related model
   * @param {keyof T} parentKey - The primary key on the parent model
   * @param {keyof M} relatedKey - The primary key on the related model
   */
  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    pivotModel: Model<PM>,
    foreignPivotKey: keyof PM,
    relatedPivotKey: keyof PM,
    parentKey: keyof T,
    relatedKey: keyof M,
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.pivotModel = pivotModel;
    this.foreignPivotKey = foreignPivotKey;
    this.relatedPivotKey = relatedPivotKey;
    this.parentKey = parentKey;
    this.relatedKey = relatedKey;
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
   * Attaches related models to the parent model
   *
   * @template D - Type of additional data to store in pivot table
   * @param {string | ObjectId | (string | ObjectId)[]} ids - IDs of related models to attach
   * @param {Partial<D>} doc - Additional data to store in pivot table
   * @returns {Promise<{message: string}>} Promise resolving to success message
   */
  public async attach<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<D> = {},
  ) {
    let objectIds: ObjectId[] = [];
    let query: Document = {};

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    const payload: object[] = [];

    objectIds.forEach((id) =>
      payload.push({
        [this.relatedPivotKey]: id,
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        ...doc,
      }),
    );

    const existingData = await this.pivotModel
      .withTrashed()
      .whereIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .get();

    const payloadToInsert: object[] = [];
    const idsToUpdate: ObjectId[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find((item: any) => {
        return (
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i])
        );
      });

      if (!existingItem) payloadToInsert.push(payload[i]);
      // @ts-ignore
      else if (existingItem?.[this.pivotModel["$isDeleted"]]) {
        // @ts-ignore
        idsToUpdate.push(existingItem._id);
      }
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await this.pivotModel.insertMany(payloadToInsert as any);
    }

    // restore data
    if (idsToUpdate.length > 0) {
      await this.pivotModel.whereIn("_id" as keyof PM, idsToUpdate).restore();
    }

    return {
      message: "Attach successfully",
    };
  }

  /**
   * Detaches related models from the parent model
   *
   * @param {string | ObjectId | (string | ObjectId)[]} ids - IDs of related models to detach
   * @returns {Promise<{message: string}>} Promise resolving to success message
   */
  public async detach(ids: string | ObjectId | (string | ObjectId)[]) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    await this.pivotModel
      .whereIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .delete();

    return {
      message: "Detach successfully",
    };
  }

  /**
   * Syncs the related models by attaching the specified IDs and detaching any others
   *
   * @template D - Type of additional data to store in pivot table
   * @param {string | ObjectId | (string | ObjectId)[]} ids - IDs of related models to sync
   * @param {Partial<D>} doc - Additional data to store in pivot table
   * @returns {Promise<{message: string}>} Promise resolving to success message
   */
  public async sync<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<D> = {},
  ) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const _payload: object[] = [];

    objectIds.forEach((id) =>
      _payload.push({
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        [this.relatedPivotKey]: id,
        ...doc,
      }),
    );

    // find data
    const existingData = await this.pivotModel
      .whereIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .get();

    // check data
    const payloadToInsert: object[] = [];

    // ids to update
    const idsToUpdate: ObjectId[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i]),
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
      // @ts-ignore
      else if (existingItem?.[this.pivotModel["$isDeleted"]])
        // @ts-ignore
        idsToUpdate.push(existingItem._id);
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await this.pivotModel.insertMany(payloadToInsert as any);
    }

    if (idsToUpdate.length > 0) {
      await this.pivotModel.whereIn("_id" as keyof PM, idsToUpdate).restore();
    }

    await this.pivotModel
      .whereNotIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .delete();

    return {
      message: "Sync successfully",
    };
  }

  /**
   * Syncs the specified related models without detaching existing ones
   *
   * @template D - Type of additional data to store in pivot table
   * @param {string | ObjectId | (string | ObjectId)[]} ids - IDs of related models to sync
   * @param {Partial<D>} doc - Additional data to store in pivot table
   * @returns {Promise<{message: string}>} Promise resolving to success message
   */
  public async syncWithoutDetaching<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<D> = {},
  ) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const _payload: object[] = [];

    objectIds.forEach((id) =>
      _payload.push({
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        [this.relatedPivotKey]: id,
        ...doc,
      }),
    );

    // find data
    const existingData = await this.pivotModel
      .whereIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .get();

    // check data
    const payloadToInsert: object[] = [];

    // ids to update
    const idsToUpdate: ObjectId[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i]),
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
      // @ts-ignore
      else if (existingItem?.[this.pivotModel["$isDeleted"]])
        // @ts-ignore
        idsToUpdate.push(existingItem._id);
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await this.pivotModel.insertMany(payloadToInsert as any);
    }

    if (idsToUpdate.length > 0) {
      await this.pivotModel.whereIn("_id" as keyof PM, idsToUpdate).restore();
    }

    return {
      message: "Sync successfully",
    };
  }

  /**
   * Syncs the related models and updates pivot values
   *
   * @template D - Type of additional data to store in pivot table
   * @param {string | ObjectId | (string | ObjectId)[]} ids - IDs of related models to sync
   * @param {Partial<D>} doc - Additional data to store in pivot table
   * @returns {Promise<{message: string}>} Promise resolving to success message
   */
  public async syncWithPivotValues<D>(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<D> = {},
  ) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const _payload: object[] = [];

    objectIds.forEach((id) =>
      _payload.push({
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        [this.relatedPivotKey]: id,
        ...doc,
      }),
    );

    // find data
    const existingData = await this.pivotModel
      .whereIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .get();

    // check data
    const payloadToInsert: object[] = [];
    const idsToUpdate: ObjectId[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i]),
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
      else idsToUpdate.push(objectIds[i]);
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await this.pivotModel.insertMany(payloadToInsert as any);
    }

    // update data
    if (idsToUpdate.length > 0) {
      await this.pivotModel
        .whereIn(this.relatedPivotKey, idsToUpdate)
        .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
        .updateMany(doc as any);
    }

    await this.pivotModel
      .whereNotIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .delete();

    return {
      message: "syncWithPivotValues successfully",
    };
  }

  /**
   * Toggles the relationship status - attaches records that don't exist and detaches those that do
   *
   * @param {string | ObjectId | (string | ObjectId)[]} ids - IDs to toggle attachment status
   * @returns {Promise<{message: string}>} Promise resolving to success message
   */
  public async toggle(ids: string | ObjectId | (string | ObjectId)[]) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const _payload: object[] = [];
    let qFind = {};

    qFind = {
      [this.relatedPivotKey]: {
        $in: objectIds,
      },
      [this.foreignPivotKey]: this.model["$original"][this.parentKey],
    };

    objectIds.forEach((id) =>
      _payload.push({
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        [this.relatedPivotKey]: id,
      }),
    );

    // find data
    const existingData = await this.pivotModel
      .withTrashed()
      .whereIn(this.relatedPivotKey, objectIds)
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .get();

    // check data
    const payloadToInsert: object[] = [];

    // check data
    const idsToDelete: any[] = [];

    // ids to restore
    const idsToRestore: ObjectId[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i]),
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
      // @ts-ignore
      else if (existingItem?.[this.pivotModel["$isDeleted"]])
        // @ts-ignore
        idsToRestore.push(existingItem._id);
      else
        idsToDelete.push(
          (_payload[i] as Record<keyof PM, any>)[this.relatedPivotKey],
        );
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await this.pivotModel.insertMany(payloadToInsert as any);
    }

    // restore data
    if (idsToRestore.length > 0) {
      await this.pivotModel.whereIn("_id" as keyof PM, idsToRestore).restore();
    }

    // delete data
    if (idsToDelete.length > 0) {
      await this.pivotModel
        .whereIn(this.relatedPivotKey, idsToDelete)
        .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
        .delete();
    }

    return {
      message: "toggle sync successfully",
    };
  }

  /**
   * Sets default condition for relation queries based on the parent model
   *
   * @private
   * @returns {Promise<void>}
   */
  private async setDefaultCondition() {
    const btmIds = await this.pivotModel
      .where(this.foreignPivotKey, this.model["$original"][this.parentKey])
      .pluck(this.relatedPivotKey);
    this.whereIn(this.relatedKey, btmIds);
  }

  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the BelongsToMany relation.
   * @param {IRelationBelongsToMany} belongsToMany - The BelongsToMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(belongsToMany: IRelationBelongsToMany): Document[] {
    // Generate the lookup stages for the BelongsToMany relationship
    const lookup = this.lookup(belongsToMany);

    // Generate the select stages if options.select is provided
    if (belongsToMany.options?.select) {
      const select = LookupBuilder.select(
        belongsToMany.options.select,
        belongsToMany.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (belongsToMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        belongsToMany.options.exclude,
        belongsToMany.alias,
      );
      lookup.push(...exclude);
    }

    // // Generate the sort stages if options.sort is provided
    // if (belongsToMany.options?.sort) {
    //   const sort = LookupBuilder.sort(
    //     belongsToMany.options?.sort[0],
    //     belongsToMany.options?.sort[1],
    //   );
    //   lookup.push(sort);
    // }

    // // Generate the skip stage if options.skip is provided
    // if (belongsToMany.options?.skip) {
    //   const skip = LookupBuilder.skip(belongsToMany.options?.skip);
    //   lookup.push(skip);
    // }

    // // Generate the limit stage if options.limit is provided
    // if (belongsToMany.options?.limit) {
    //   const limit = LookupBuilder.limit(belongsToMany.options?.limit);
    //   lookup.push(limit);
    // }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the BelongsToMany relation.
   * @param {IRelationBelongsToMany} belongsToMany - The BelongsToMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(belongsToMany: IRelationBelongsToMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (belongsToMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${belongsToMany.relatedModel.getIsDeleted()}`, false] },
            ],
          },
        },
      });
    }

    belongsToMany.model["$nested"].forEach(el => {
      if (typeof belongsToMany.relatedModel[el] === "function") {
        belongsToMany.relatedModel["$alias"] = el
        const nested = belongsToMany.relatedModel[el]()
        pipeline.push(...nested.model.$lookups)
      }
    })

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: belongsToMany.pivotModel["$collection"],
          localField: belongsToMany.parentKey,
          foreignField: belongsToMany.foreignPivotKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: belongsToMany.relatedModel["$collection"],
          localField: `pivot.${belongsToMany.relatedPivotKey}`,
          foreignField: belongsToMany.relatedKey,
          as: belongsToMany.alias || "pivot",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      },
    );

    return lookup;
  }
}
