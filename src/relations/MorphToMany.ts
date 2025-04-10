import { Document, ObjectId } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphToMany } from "../interfaces/IRelation";

export default class MorphToMany<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  morph: string;
  morphId: string;
  morphType: string;
  morphCollectionName: string;

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

    // // Generate the sort stages if options.sort is provided
    // if (morphToMany.options?.sort) {
    //   const sort = LookupBuilder.sort(
    //     morphToMany.options?.sort[0],
    //     morphToMany.options?.sort[1],
    //   );
    //   lookup.push(sort);
    // }

    // // Generate the skip stages if options.skip is provided
    // if (morphToMany.options?.skip) {
    //   const skip = LookupBuilder.skip(morphToMany.options?.skip);
    //   lookup.push(skip);
    // }

    // // Generate the limit stages if options.limit is provided
    // if (morphToMany.options?.limit) {
    //   const limit = LookupBuilder.limit(morphToMany.options?.limit);
    //   lookup.push(limit);
    // }

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
