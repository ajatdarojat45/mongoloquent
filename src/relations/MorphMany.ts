import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationMorphMany } from "../interfaces/IRelation";
import { FormSchema } from "../types/schema";
import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

export default class MorphMany<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  morph: string;
  morphId: string;
  morphType: string;

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

  public firstOrNew(filter: Partial<M>, doc: Partial<FormSchema<M>>) {
    return super.firstOrNew(filter, doc);
  }

  public firstOrCreate(filter: Partial<M>, doc: Partial<FormSchema<M>>) {
    return super.firstOrCreate(filter, doc);
  }

  public updateOrCreate(filter: Partial<M>, doc: Partial<FormSchema<M>>) {
    return super.updateOrCreate(filter, doc);
  }

  // @ts-ignore
  public save(doc: Partial<M>) {
    const data = {
      ...doc,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    } as FormSchema<M>;

    return this.insert(data);
  }

  public saveMany(docs: Partial<M>[]) {
    const data = docs.map((doc) => ({
      ...doc,
      [this.morphType]: this.model.constructor.name,
      [this.morphId]: (this.model["$original"] as any)["_id"],
    })) as FormSchema<M>[];

    return this.insertMany(data);
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

    // Generate the sort stages if options.sort is provided
    if (morphMany.options?.sort) {
      const sort = LookupBuilder.sort(
        morphMany.options?.sort[0],
        morphMany.options?.sort[1],
      );
      lookup.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (morphMany.options?.skip) {
      const skip = LookupBuilder.skip(morphMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (morphMany.options?.limit) {
      const limit = LookupBuilder.limit(morphMany.options?.limit);
      lookup.push(limit);
    }

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
    if (morphMany.model["$useSoftDelete"]) {
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
