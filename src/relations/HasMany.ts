import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

export default class HasMany {
  /**
   * generate lookup, select and exclude for has many relation 
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   * @param  string alias
   * @return mongodb/Document[] 
   */
  static generate(related: typeof Model, foreignKey: string, localKey: string = "_id", alias: string, options: IRelationOptions): Document[] {
    const lookup = this.lookup(related, foreignKey, localKey, alias)
    let select: Document[] = []
    let exclude: Document[] = []

    if (options.select)
      select = Relation.selectRelationColumns(options.select, alias)

    if (options.exclude)
      select = Relation.excludeRelationColumns(options.exclude, alias)

    return [...lookup, ...select, ...exclude]
  }

  /**
   * generate lookup for has many relation 
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   * @param  string alias
   * @return mongodb/Document[] 
   */
  static lookup(related: typeof Model, foreignKey: string, localKey: string = "_id", alias: string): Document[] {
    const collection = related.$collection;
    const lookup: Document[] = []
    const pipeline: Document[] = []

    if (related.$useSoftDelete) {
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
      localField: localKey,
      foreignField: foreignKey,
      as: alias || "alias",
      pipeline: pipeline,
    };

    lookup.push({ $lookup });
    lookup.push({
      $project: {
        alias: 0,
      },
    });

    return lookup
  }
}
