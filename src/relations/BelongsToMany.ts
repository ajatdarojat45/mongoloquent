import { Document, ObjectId, OptionalUnlessRequiredId } from "mongodb";
import { IRelationBelongsToMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";
import QueryBuilder from "../QueryBuilder";
import Model from "../Model";
import { IModelPaginate } from "../interfaces/IModel";
import { FormSchema } from "../types/schema";

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
    relatedKey: keyof M
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

  public async paginate(page: number, limit: number): Promise<IModelPaginate> {
    await this.setDefaultCondition();

    return super.paginate(page, limit);
  }

  public first<K extends keyof M>(...fields: (K | K[])[]) {
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

  public async attach(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<PM> = {}
  ) {
    let objectIds: ObjectId[] = [];
    let query: Document = {};

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.pivotModel["getCollection"]();
    const payload: object[] = [];

    query = {
      [this.relatedPivotKey]: {
        $in: objectIds,
      },
      [this.foreignPivotKey]: this.model["$original"][this.parentKey],
    };

    objectIds.forEach((id) =>
      payload.push({
        [this.relatedPivotKey]: id,
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        ...doc,
      })
    );

    const existingData = await collection.find(query as any).toArray();
    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find((item: any) => {
        return (
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i])
        );
      });

      // insert if  data does not exist
      if (!existingItem) {
        await collection.insertOne(
          payload[i] as OptionalUnlessRequiredId<FormSchema<PM>>
        );
      }
    }

    return {
      message: "Attach successfully",
    };
  }

  public async detach(ids: string | ObjectId | (string | ObjectId)[]) {
    let objectIds: ObjectId[] = [];
    let query: Document = {};

    if (!Array.isArray(ids)) objectIds = ids ? [new ObjectId(ids)] : [];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.pivotModel["getCollection"]();

    query = {
      [this.relatedPivotKey]: {
        $in: objectIds,
      },
      [this.foreignPivotKey]: this.model["$original"][this.parentKey],
    };

    await collection.deleteMany(query as any);

    return {
      message: "Detach successfully",
    };
  }

  public async sync(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<PM> = {}
  ) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.pivotModel["getCollection"]();
    const _payload: object[] = [];
    let qFind = {};
    let qDelete = {};

    qFind = {
      [this.relatedPivotKey]: {
        $in: objectIds,
      },
      [this.foreignPivotKey]: this.model["$original"][this.parentKey],
    };

    qDelete = {
      [this.relatedPivotKey]: {
        $nin: objectIds,
      },
      [this.foreignPivotKey]: this.model["$original"][this.parentKey],
    };

    objectIds.forEach((id) =>
      _payload.push({
        [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        [this.relatedPivotKey]: id,
        ...doc,
      })
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // check data
    const payloadToInsert: object[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i])
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await collection.insertMany(payloadToInsert as any);
    }

    // delete data
    await collection.deleteMany(qDelete);
    return {
      message: "Sync successfully",
    };
  }

  public async syncWithoutDetaching(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<PM> = {}
  ) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.pivotModel["getCollection"]();
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
        ...doc,
      })
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // check data
    const payloadToInsert: object[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i])
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await collection.insertMany(payloadToInsert as any);
    }

    return {
      message: "syncWithoutDetaching successfully",
    };
  }

  public async syncWithPivotValues(
    ids: string | ObjectId | (string | ObjectId)[],
    doc: Partial<PM> = {}
  ) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.pivotModel["getCollection"]();
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
        ...doc,
      })
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // check data
    const payloadToInsert: object[] = [];
    const idsToUpdate: ObjectId[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i])
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
      else idsToUpdate.push(objectIds[i]);
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await collection.insertMany(payloadToInsert as any);
    }

    // update data
    if (idsToUpdate.length > 0) {
      await collection.updateMany(
        {
          [this.relatedPivotKey]: {
            $in: idsToUpdate,
          },
          [this.foreignPivotKey]: this.model["$original"][this.parentKey],
        } as any,
        {
          $set: doc,
        }
      );
    }

    return {
      message: "syncWithPivotValues successfully",
    };
  }

  public async toggle(ids: string | ObjectId | (string | ObjectId)[]) {
    let objectIds: ObjectId[] = [];

    if (!Array.isArray(ids)) objectIds = [new ObjectId(ids)];
    else objectIds = ids.map((el) => new ObjectId(el));

    const collection = this.pivotModel["getCollection"]();
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
      })
    );

    // find data
    const existingData = await collection.find(qFind).toArray();

    // check data
    const payloadToInsert: object[] = [];

    // check data
    const idsToDelete: any[] = [];

    for (let i = 0; i < objectIds.length; i++) {
      const existingItem = existingData.find(
        (item: any) =>
          JSON.stringify(item[this.relatedPivotKey]) ===
          JSON.stringify(objectIds[i])
      );
      if (!existingItem) payloadToInsert.push(_payload[i]);
      else
        idsToDelete.push(
          (_payload[i] as Record<keyof PM, any>)[this.relatedPivotKey]
        );
    }

    // insert data
    if (payloadToInsert.length > 0) {
      await collection.insertMany(payloadToInsert as any);
    }

    // delete data
    console.log("idsToDelete", idsToDelete);
    if (idsToDelete.length > 0) {
      await collection.deleteMany({
        [this.relatedPivotKey as string]: {
          $in: idsToDelete,
        },
        [this.foreignPivotKey as string]:
          this.model["$original"][this.parentKey],
      } as any);
    }

    return {
      message: "toggle sync successfully",
    };
  }

  private async setDefaultCondition() {
    const btmColl = this.pivotModel["getCollection"]();
    const filterObj: Record<string, any> = {};
    filterObj[this.foreignPivotKey as string] =
      this.model["$original"][this.parentKey];

    const btmIds = await btmColl
      .find(filterObj)
      .map(
        (el) => el[this.relatedPivotKey as keyof typeof el] as unknown as any
      )
      .toArray();

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
        belongsToMany.alias
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (belongsToMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        belongsToMany.options.exclude,
        belongsToMany.alias
      );
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    if (belongsToMany.options?.sort) {
      const sort = LookupBuilder.sort(
        belongsToMany.options?.sort[0],
        belongsToMany.options?.sort[1]
      );
      lookup.push(sort);
    }

    // Generate the skip stage if options.skip is provided
    if (belongsToMany.options?.skip) {
      const skip = LookupBuilder.skip(belongsToMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stage if options.limit is provided
    if (belongsToMany.options?.limit) {
      const limit = LookupBuilder.limit(belongsToMany.options?.limit);
      lookup.push(limit);
    }

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
      }
    );

    return lookup;
  }
}
