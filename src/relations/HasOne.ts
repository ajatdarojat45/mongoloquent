import { Document } from "mongodb";
import Model from "../Model";
import Relation from "../Relation";
import { IRelationOptions } from "../interfaces/IRelation";

export default class HashOne extends Relation {
  /**
   * generate lookup, select and exclude for has one relation 
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   * @param  string alias
   * @return mongodb/Document[] 
   */
  static generate(related: typeof Model | string, foreignKey: string, localKey: string = "_id", alias: string, options: IRelationOptions): Document[] {
    const lookup = this.lookup(related, foreignKey, localKey, alias)
    let select: Document[] = []
    let exclude: Document[] = []

    if (options.select)
      select = this.selectRelationColumns(options.select, alias)

    if (options.exclude)
      select = this.excludeRelationColumns(options.exclude, alias)

    return [...lookup, ...select, ...exclude]
  }

  /**
   * generate lookup for has one relation 
   *
   * @param Model related
   * @param  string foreignKey
   * @param  string localKey
   * @param  string alias
   * @return mongodb/Document[] 
   */
  static lookup(related: typeof Model | string, foreignKey: string, localKey: string = "_id", alias: string): Document[] {
    const collection = typeof related === "string" ? related : related.$collection;
    const lookup: Document[] = []
    const pipeline: Document[] = []
    let useSoftDelete: boolean = false;

    if (typeof related !== "string") {
      useSoftDelete = related.$useSoftDelete
    }

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
      localField: localKey,
      foreignField: foreignKey,
      as: alias,
      pipeline: pipeline,
    };

    lookup.push({ $lookup });
    lookup.push({
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}

