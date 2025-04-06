import { Document, ObjectId } from "mongodb";
import { IRelationMorphedByMany } from "../interfaces/IRelation";
import LookupBuilder from "./LookupBuilder.ts";
import QueryBuilder from "../QueryBuilder";
import Model from "../Model";
import { IModelPaginate } from "../interfaces/IModel";

export default class MorphedByMany<T, M> extends QueryBuilder<M> {
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
    const mbmColl = this["getCollection"](this.morphCollectionName);

    const mbmIds = await mbmColl
      .find({
        [this.morphType]: this.relatedModel.constructor.name,
        [`${this.model.constructor.name.toLowerCase()}Id`]: this.model["$id"],
      } as any)
      .map((el) => el[this.morphId as keyof typeof el] as unknown as ObjectId)
      .toArray();

    this.whereIn("_id" as keyof M, mbmIds);
  }

  /**
   * Generates the lookup, select, exclude, sort, skip, and limit stages for the MorphByMany relation.
   * @param {IRelationMorphedByMany} morphedByMany - The MorphByMany relation configuration.
   * @return {Document[]} The combined lookup, select, exclude, sort, skip, and limit stages.
   */
  static generate(morphedByMany: IRelationMorphedByMany): Document[] {
    // Generate the lookup stages for the MorphByMany relationship
    const lookup = this.lookup(morphedByMany);

    // Generate the select stages if options.select is provided
    if (morphedByMany.options?.select) {
      const select = LookupBuilder.select(
        morphedByMany.options.select,
        morphedByMany.alias
      );
      lookup.push(...select);
    }

    // Generate the exclude stages if options.exclude is provided
    if (morphedByMany.options?.exclude) {
      const exclude = LookupBuilder.exclude(
        morphedByMany.options.exclude,
        morphedByMany.alias
      );
      lookup.push(...exclude);
    }

    // Generate the sort stages if options.sort is provided
    if (morphedByMany.options?.sort) {
      const sort = LookupBuilder.sort(
        morphedByMany.options?.sort[0],
        morphedByMany.options?.sort[1]
      );
      lookup.push(sort);
    }

    // Generate the skip stages if options.skip is provided
    if (morphedByMany.options?.skip) {
      const skip = LookupBuilder.skip(morphedByMany.options?.skip);
      lookup.push(skip);
    }

    // Generate the limit stages if options.limit is provided
    if (morphedByMany.options?.limit) {
      const limit = LookupBuilder.limit(morphedByMany.options?.limit);
      lookup.push(limit);
    }

    // Return the combined lookup, select, exclude, sort, skip, and limit stages
    return lookup;
  }

  /**
   * Generates the lookup stages for the MorphByMany relation.
   * @param {IRelationMorphedByMany} morphedByMany - The MorphByMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphedByMany: IRelationMorphedByMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphedByMany.relatedModel["$useSoftDelete"]) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphedByMany.relatedModel.getIsDeleted()}`, false] },
            ],
          },
        },
      });
    }

    // Define the $lookup stages
    lookup.push(
      {
        $lookup: {
          from: morphedByMany.morphCollectionName,
          localField: "_id",
          foreignField: `${morphedByMany.model.constructor.name.toLowerCase()}Id`,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        `$${morphedByMany.morphType}`,
                        morphedByMany.relatedModel.constructor.name,
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
          from: morphedByMany.relatedModel["$collection"],
          localField: `pivot.${morphedByMany.morphId}`,
          foreignField: "_id",
          as: morphedByMany.alias || "alias",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
          alias: 0,
        },
      }
    );

    return lookup;
  }
}
