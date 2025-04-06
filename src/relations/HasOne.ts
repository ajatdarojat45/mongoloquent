import { Document } from "mongodb";
import { IRelationHasOne } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";
import QueryBuilder from "../QueryBuilder";
import Model from "../Model";
import { IModelPaginate } from "../interfaces/IModel";

export default class HasOne<T, M> extends QueryBuilder<M> {
  model: Model<T>;
  relatedModel: Model<M>;
  foreignKey: keyof M;
  localKey: keyof T;

  constructor(
    model: Model<T>,
    relatedModel: Model<M>,
    foreignKey: keyof M,
    localKey: keyof T
  ) {
    super();
    this.model = model;
    this.relatedModel = relatedModel;
    this.foreignKey = foreignKey;
    this.localKey = localKey;

    this.$connection = relatedModel["$connection"];
    this.$collection = relatedModel["$collection"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$databaseName = relatedModel["$databaseName"];
    this.$useSoftDelete = relatedModel["$useSoftDelete"];
    this.$useTimestamps = relatedModel["$useTimestamps"];
    this.$isDeleted = relatedModel["$isDeleted"];
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

  static generate(hasOne: IRelationHasOne): Document[] {
    const lookup = this.lookup(hasOne);

    if (hasOne.options?.select) {
      const select = LookupBuilder.select(hasOne.options.select, hasOne.alias);
      lookup.push(...select);
    }

    if (hasOne.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        hasOne.options.exclude,
        hasOne.alias
      );
      lookup.push(...exclude);
    }

    return lookup;
  }

  static lookup(hasOne: IRelationHasOne): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (hasOne.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${hasOne.relatedModel["$isDeleted"]}`, false] }],
          },
        },
      });
    }

    const $lookup = {
      from: hasOne.relatedModel["$collection"],
      localField: hasOne.localKey,
      foreignField: hasOne.foreignKey,
      as: hasOne.alias,
      pipeline: pipeline,
    };

    lookup.push({ $lookup });

    lookup.push({
      $unwind: {
        path: `$${hasOne.alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
