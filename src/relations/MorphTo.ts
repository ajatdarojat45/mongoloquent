import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphTo } from "../interfaces/IRelation";
import { FormSchema } from "../types/schema.js";

export default class MorphTo<T, M> extends QueryBuilder<M> {
  private model: Model<T>;
  private relatedModel: Model<M>;
  private morph: string;
  private morphId: keyof T;
  private morphType: keyof T;

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

  // @ts-ignore
  public save(doc: Partial<M>) {
    const data = {
      ...doc,
      [this.morphId]: this.model["$original"]["_id" as keyof Partial<T>],
      [this.morphType]: this.model.constructor.name,
    } as FormSchema<M>;

    return this.insert(data);
  }

  // @ts-ignore
  public create(doc: Partial<M>) {
    return this.save(doc);
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
    this.where("_id" as keyof M, this.model["$original"][this.morphId]);
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
            $and: [{ $eq: [`$${morphTo.relatedModel.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: morphTo.relatedModel["$collection"],
      foreignField: "_id",
      localField: `${morphTo.morphId}`,
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
