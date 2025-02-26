import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";


export default class BelongsToMany extends Relation {
  /**
   * generate lookup, select and exclude for BelongsToMany relation 
   *
   * @param Model related
   * @param Model table
   * @param string foreignPivotKey
   * @param string relatedPivotKey
   * @param string parentKey
   * @param string relatedKey
   * @param string alias
   * @param options IRelationOptions
   *
   * @return mongodb/Document[] 
   */
  static generate(related: typeof Model, table: typeof Model, foreignPivotKey: string, relatedPivotKey: string, parentKey: string = "_id", relatedKey: string = "_id", alias: string, options: IRelationOptions): Document[] {
    const lookup = this.lookup(related, table, foreignPivotKey, relatedPivotKey, parentKey, relatedKey, alias)
    let select: Document[] = []
    let exclude: Document[] = []

    if (options.select)
      select = this.selectRelationColumns(options.select, alias)

    if (options.exclude)
      select = this.excludeRelationColumns(options.exclude, alias)

    return [...lookup, ...select, ...exclude]
  }

  /**
   * generate lookup for BelongsToMany relation 
   *
   * @param Model related
   * @param Model table
   * @param string foreignPivotKey
   * @param string relatedPivotKey
   * @param string parentKey
   * @param string relatedKey
   * @param string alias
   *
   * @return mongodb/Document[] 
   */
  static lookup(related: typeof Model, table: typeof Model, foreignPivotKey: string, relatedPivotKey: string, parentKey: string = "_id", relatedKey: string = "_id", alias: string): Document[] {
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

    lookup.push(
      {
        $lookup: {
          from: table,
          localField: parentKey,
          foreignField: foreignPivotKey,
          as: "pivot",
        },
      },
      {
        $lookup: {
          from: collection,
          localField: `pivot.${relatedPivotKey}`,
          foreignField: relatedKey,
          as: alias || "pivot",
          pipeline,
        },
      },
      {
        $project: {
          pivot: 0,
        },
      }
    );

    return lookup
  }
}
