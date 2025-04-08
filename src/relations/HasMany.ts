import { Document } from "mongodb";

import LookupBuilder from "./LookupBuilder.ts";

import Model from "../Model";
import QueryBuilder from "../QueryBuilder";
import { IModelPaginate } from "../interfaces/IModel";
import { IRelationHasMany } from "../interfaces/IRelation";
import { FormSchema } from "../types/schema";

export default class HasMany<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  localKey: keyof T;
  foreignKey: keyof M;

  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    foreignKey: keyof M,
    localKey: keyof T,
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.localKey = localKey;
    this.foreignKey = foreignKey;
    this.$connection = relatedModel["$connection"];
    this.$collection = relatedModel["$collection"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$databaseName = relatedModel["$databaseName"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$useTimestamps = relatedModel["$useTimestamps"];
    this.$isDeleted = relatedModel["$isDeleted"];
  }

  public firstOrNew(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const data = {
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;
    return super.firstOrNew(filter, data);
  }

  public firstOrCreate(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const data = {
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;
    return super.firstOrCreate(filter, data);
  }

  public updateOrCreate(
    filter: Partial<FormSchema<M>>,
    doc?: Partial<FormSchema<M>>,
  ) {
    const data = {
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;
    return super.updateOrCreate(filter, data);
  }

  // @ts-ignore
  public save(doc: Partial<M>) {
    const data = {
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    } as FormSchema<M>;

    return this.insert(data);
  }

  public saveMany(docs: Partial<M>[]) {
    const data = docs.map((doc) => ({
      ...doc,
      [this.foreignKey]: this.model["$original"][this.localKey],
    })) as FormSchema<M>[];

    return this.insertMany(data);
  }

  // @ts-ignore
  public create(doc: Partial<M>) {
    return this.save(doc);
  }

  // @ts-ignore
  public createMany(docs: Partial<M>[]) {
    return this.saveMany(docs);
  }

  public all(): Promise<M[]> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.all();
  }

  public get<K extends keyof M>(...fields: (K | K[])[]) {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.get(...fields);
  }

  public paginate(page: number, limit: number): Promise<IModelPaginate> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.paginate(page, limit);
  }

  public first<K extends keyof M>(...fields: (K | K[])[]) {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.first(...fields);
  }

  public count(): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.count();
  }

  public sum<K extends keyof M>(field: K): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.sum(field);
  }

  public min<K extends keyof M>(field: K): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.min(field);
  }

  public max<K extends keyof M>(field: K): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.max(field);
  }

  public avg<K extends keyof M>(field: K): Promise<number> {
    this.where(this.foreignKey, this.model["$original"][this.localKey]);
    return super.avg(field);
  }

  public static generate(hasMany: IRelationHasMany): Document[] {
    // Generate the lookup stages for the hasMany relationship
    const lookup = this.lookup(hasMany);

    // Generate the select stages if options.select is provided
    if (hasMany.options?.select) {
      const select = LookupBuilder.select(
        hasMany.options.select,
        hasMany.alias,
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (hasMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        hasMany.options.exclude,
        hasMany.alias,
      );
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    // if (hasMany.options?.sort) {
    //   const sort = LookupBuilder.sort(
    //     hasMany.options?.sort[0],
    //     hasMany.options?.sort[1],
    //   );
    //   lookup.push(sort);
    // }

    // Generate the skip stages if options.skip is provided
    // if (hasMany.options?.skip) {
    //   const skip = LookupBuilder.skip(hasMany.options?.skip);
    //   lookup.push(skip);
    // }

    // Generate the limit stages if options.limit is provided
    // if (hasMany.options?.limit) {
    //   const limit = LookupBuilder.limit(hasMany.options?.limit);
    //   lookup.push(limit);
    // }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  public static lookup(hasMany: IRelationHasMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasMany.relatedModel["$isDeleted"]}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: hasMany.relatedModel["$collection"],
      localField: hasMany.localKey,
      foreignField: hasMany.foreignKey,
      as: hasMany.alias || "alias",
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $project stage to exclude the alias field
    lookup.push({
      $project: {
        alias: 0,
      },
    });

    return lookup;
  }
}
