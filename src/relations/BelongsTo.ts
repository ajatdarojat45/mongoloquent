import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationBelongsTo } from "../interfaces/IRelation";
import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

export default class BelongsTo<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  foreignKey: keyof T;
  ownerKey: keyof M;

  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    foreignKey: keyof T,
    ownerKey: keyof M,
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.ownerKey = ownerKey;
    this.foreignKey = foreignKey;
    this.$connection = relatedModel["$connection"];
    this.$collection = relatedModel["$collection"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$databaseName = relatedModel["$databaseName"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$useTimestamps = relatedModel["$useTimestamps"];
    this.$isDeleted = relatedModel["$isDeleted"];
  }

  public all(): Promise<M[]> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.all();
  }

  public get<K extends keyof M>(...fields: (K | K[])[]) {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.get(...fields);
  }

  public paginate(page: number, limit: number): Promise<IModelPaginate> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.paginate(page, limit);
  }

  public first<K extends keyof M>(...fields: (K | K[])[]) {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.first(...fields);
  }

  public count(): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.count();
  }

  public sum<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.sum(field);
  }

  public min<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.min(field);
  }

  public max<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.max(field);
  }

  public avg<K extends keyof M>(field: K): Promise<number> {
    this.where(this.ownerKey, this.model["$original"][this.foreignKey]);
    return super.avg(field);
  }

  public associate(model: QueryBuilder<M>) {
    this.model[this.foreignKey as any] = model["$original"][this.ownerKey];
    return this.model;
  }

  public dissociate() {
    this.model[this.foreignKey as any] = null;
    return this.model;
  }

  public disassociate() {
    this.model[this.foreignKey as any] = null;
    return this.model;
  }

  /**
   * @note This method defines an inverse one-to-one or many relationship.
   * @param {IRelationBelongsTo} belongsTo - The belongsTo relation details.
   * @return {Document[]} The lookup stages.
   */
  public static generate(belongsTo: IRelationBelongsTo): Document[] {
    // Generate the lookup stages for the belongsTo relationship
    const lookup = this.lookup(belongsTo);

    // Generate the select stages if options.select is provided
    if (belongsTo.options?.select) {
      const select = LookupBuilder.select(
        belongsTo.options.select,
        belongsTo.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (belongsTo.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        belongsTo.options.exclude,
        belongsTo.alias,
      );
      lookup.push(...exclude);
    }

    // Return the combined lookup, select, and exclude stages
    return lookup;
  }

  /**
   * @note This method generates the lookup stages for the belongsTo relation.
   * @param {IRelationBelongsTo} belongsTo - The belongsTo relation details.
   * @return {Document[]} The lookup stages.
   */
  static lookup(belongsTo: IRelationBelongsTo): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (belongsTo.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${belongsTo.relatedModel["$isDeleted"]}`, false] },
            ],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: belongsTo.relatedModel["$collection"],
      localField: belongsTo.foreignKey,
      foreignField: belongsTo.ownerKey,
      as: belongsTo.alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({
      $lookup,
    });

    // Define the $unwind stage
    const _unwind = {
      $unwind: {
        path: `$${belongsTo.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    // Add the $unwind stage to the lookup array
    lookup.push(_unwind);

    return lookup;
  }
}
