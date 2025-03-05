import { Document } from "mongodb";
import Relation from "../Relation";
import { IRelationMorphToMany } from "../interfaces/IRelation";

export default class MorphToMany {
  /**
   * generate lookup, select and exclude for MorphToMany relation
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
  static generate(morphToMany: IRelationMorphToMany): Document[] {
    const lookup = this.lookup(morphToMany);
    let select: any = [];
    let exclude: any = [];

    if (morphToMany.options?.select)
      select = Relation.selectRelationColumns(morphToMany.options.select, morphToMany.alias);

    if (morphToMany.options?.exclude)
      select = Relation.excludeRelationColumns(morphToMany.options.exclude, morphToMany.alias);

    return [...lookup, ...select, ...exclude];
  }

  /**
   * generate lookup for MorphToMany relation
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
  static lookup(morphToMany: IRelationMorphToMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    if (morphToMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${morphToMany.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    lookup.push(
      {
        $lookup: {
          from: morphToMany.morphCollectionName,
          localField: "_id",
          foreignField: morphToMany.morphId,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [`$${morphToMany.morphType}`, morphToMany.parentModelName],
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
          from: morphToMany.model.$collection,
          localField: `pivot.${morphToMany.foreignKey}`,
          foreignField: "_id",
          as: morphToMany.alias || "alias",
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
