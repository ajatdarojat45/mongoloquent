import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

export default class MorphMany {
  /**
   * generate lookup, select and exclude for MorphMany relation 
   *
   * @param Model target
   * @param string name
   * @param string type
   * @param string id
   * @param string ownerKey
   * @param string alias
   * @param options IRelationOptions
   *
   * @return mongodb/Document[] 
   */
  static generate(
    target: typeof Model,
    name: string,
    type: string,
    id: string,
    ownerKey: string = "_id",
    alias: string,
    options: IRelationOptions
  ): Document[] {
    const lookup = this.lookup(
      target,
      name,
      type,
      id,
      ownerKey,
      alias,
    )
    let select: Document[] = []
    let exclude: Document[] = []

    if (options.select)
      select = Relation.selectRelationColumns(options.select, alias)

    if (options.exclude)
      select = Relation.excludeRelationColumns(options.exclude, alias)

    return [...lookup, ...select, ...exclude]
  }

  /**
   * generate lookup for MorphMany relation 
   *
   * @param Model target
   * @param string name
   * @param string type
   * @param string id
   * @param string ownerKey
   * @param string alias
   *
   * @return mongodb/Document[] 
   */
  static lookup(
    target: typeof Model,
    name: string,
    type: string,
    id: string,
    ownerKey: string = "_id",
    alias: string,
  ): Document[] {
    const lookup: Document[] = []
    const pipeline: Document[] = []

    if (target.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: ["$isDeleted", false] },
              {
                $eq: [`$${type}`, name],
              },
            ],
          },
        },
      })
    } else {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: [`$${type}`, name],
              },
            ],
          },
        },
      })
    }

    const $lookup = {
      from: target.$collection,
      localField: ownerKey,
      foreignField: id,
      as: alias,
      pipeline: pipeline,
    };
    lookup.push({ $lookup });

    return lookup
  }
}
