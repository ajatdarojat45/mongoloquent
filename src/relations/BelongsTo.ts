import Relation from "../Relation"
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";
import { Document } from "mongodb";

export default class BelongsTo extends Relation {
  /**
   * Define an inverse one-to-one or many relationship.
   *
   * @param  typeof  Model  $related
   * @param  string  $foreignKey
   * @param  string  $ownerKey
   * @param  string  $relation
   * @return Model
   */
  public static generate(related: typeof Model, foreignKey: string, ownerKey: string = "_id", alias: string, options: IRelationOptions): Document[] {
    const lookup = this.lookup(related, foreignKey, ownerKey, alias)
    let select: Document[] = []
    let exclude: Document[] = []

    if (options.select)
      select = this.selectRelationColumns(options.select, alias)

    if (options.exclude)
      select = this.excludeRelationColumns(options.exclude, alias)

    return [...lookup, ...select, ...exclude]
  }

  /**
   * generate lookup for belongsTo relation 
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string ownerKey
   * @param  string alias
   *
   * @return mongodb/Document[] 
   */
  static lookup(related: typeof Model, foreignKey: string, ownerKey: string = "_id", alias: string): Document[] {
    const collection = related.$collection;
    const lookup: Document[] = []
    const pipeline: Document[] = []
    const useSoftDelete = related.$useSoftDelete

    if (useSoftDelete) {
      pipeline.push(
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$isDeleted", false] }],
            },
          },
        },
      );
    }

    const $lookup = {
      from: collection,
      localField: foreignKey,
      foreignField: ownerKey,
      as: alias,
      pipeline: pipeline,
    };

    lookup.push({
      $lookup,
    });

    const _unwind = {
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    };

    lookup.push(_unwind);

    return lookup
  }
}
