import { Document } from "mongodb";
import Relation from "../Relation"
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

export default class HasManyThrough {
  /**
   * generate lookup, select and exclude for HasManyThrough relation 
   *
   * @param Model related
   * @param Model through
   * @param string firstKey
   * @param string secondKey
   * @param string localKey
   * @param string secondLocalKey
   * @param string alias
   * @param options IRelationOptions
   *
   * @return mongodb/Document[] 
   */
  static generate(related: typeof Model, through: typeof Model, firstKey: string, secondKey: string, localKey: string = "_id", secondLocalKey: string = "_id", alias: string, options: IRelationOptions): Document[] {
    const lookup = this.lookup(related, through, firstKey, secondKey, localKey, secondLocalKey, alias)
    let select: Document[] = []
    let exclude: Document[] = []

    if (options.select)
      select = Relation.selectRelationColumns(options.select, alias)

    if (options.exclude)
      select = Relation.excludeRelationColumns(options.exclude, alias)

    return [...lookup, ...select, ...exclude]

  }

  /**
   * generate lookup for HasManyThrough relation 
   *
   * @param Model related
   * @param Model through
   * @param string firstKey
   * @param string secondKey
   * @param string localKey
   * @param string secondLocalKey
   * @param string alias
   *
   * @return mongodb/Document[] 
   */
  static lookup(related: typeof Model, through: typeof Model, firstKey: string, secondKey: string, localKey: string = "_id", secondLocalKey: string = "_id", alias: string): Document[] {
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

    lookup.push(
      {
        $lookup: {
          from: through.$collection,
          localField: localKey,
          foreignField: firstKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: related.$collection,
          localField: `pivot.${secondLocalKey}`,
          foreignField: `${secondKey}`,
          as: alias || "alias",
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

    return lookup
  }
}
