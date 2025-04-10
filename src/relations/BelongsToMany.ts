import { Document, ObjectId } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationBelongsToMany } from "../interfaces/IRelation";

export default class BelongsToMany<T, M, PM> extends QueryBuilder<M> {
  private model: Model<T>;
  private relatedModel: Model<M>;
  private pivotModel: Model<PM>;
  private foreignPivotKey: keyof PM;
  private relatedPivotKey: keyof PM;
  private parentKey: keyof T;
  private relatedKey: keyof M;

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

  public all(): Promise<M[]> {
    return super.all();
  }

  public async get<K extends keyof M>(...fields: (K | K[])[]) {
    await this.setDefaultCondition();
    return super.get(...fields);
  }

  public async paginate(
    page: number = 1,
    limit: number = 15,
  ): Promise<IModelPaginate> {
    await this.setDefaultCondition();

    return super.paginate(page, limit);
  }

  public async first<K extends keyof M>(...fields: (K | K[])[]) {
    await this.setDefaultCondition();
    return super.first(...fields);
  }

  public async count(): Promise<number> {
    await this.setDefaultCondition();
    return super.count();
  }

  public async sum<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.sum(field);
  }

  public async min<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.min(field);
  }

  public async max<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.max(field);
  }

  public async avg<K extends keyof M>(field: K): Promise<number> {
    await this.setDefaultCondition();
    return super.avg(field);
  }

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
