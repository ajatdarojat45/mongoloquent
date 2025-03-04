import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationOptions } from "../interfaces/IRelation";

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
  static generate(
    target: typeof Model,
    name: string,
    modelName: string,
    type: string,
    id: string,
    ownerKey: string = "_id",
    alias: string,
    options: IRelationOptions
  ): Document[] {
    const lookup = this.lookup(
      target,
      modelName,
      name,
      type,
      id,
      ownerKey,
      alias
    );
    let select: any = [];
    let exclude: any = [];

    if (options?.select)
      select = Relation.selectRelationColumns(options.select, alias);

    if (options?.exclude)
      select = Relation.excludeRelationColumns(options.exclude, alias);

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
  static lookup(
    target: typeof Model,
    modelName: string,
    name: string,
    type: string,
    id: string,
    ownerKey: string = "_id",
    alias: string
  ): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    if (target.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${target.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    lookup.push(
      {
        $lookup: {
          from: `${name}s`,
          localField: ownerKey,
          foreignField: id,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [`$${type}`, modelName],
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
          from: target.$collection,
          localField: `pivot.${target.name.toLowerCase()}Id`,
          foreignField: ownerKey,
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

    return lookup;
  }
}
