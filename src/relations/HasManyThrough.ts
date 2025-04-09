import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationHasManyThrough } from "../interfaces/IRelation";

export default class HasManyThrough<T, M, TM> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  throughModel: Model<TM>;
  foreignKey: keyof TM;
  foreignKeyThrough: keyof M;
  localKey: keyof T;
  localKeyThrough: keyof TM;

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

    // Generate the sort stages if options.sort is provided
    if (hasManyThrough.options?.sort) {
      const sort = LookupBuilder.sort(
        hasManyThrough.options?.sort[0],
        hasManyThrough.options?.sort[1],
      );
      lookup.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (hasManyThrough.options?.skip) {
      const skip = LookupBuilder.skip(hasManyThrough.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (hasManyThrough.options?.limit) {
      const limit = LookupBuilder.limit(hasManyThrough.options?.limit);
      lookup.push(limit);
    }

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
