import { Document } from "mongodb";
import Relation from "../Relation";
import { IRelationMorphToMany } from "../interfaces/IRelation";

export default class MorphToMany {
  /**
   * Generates the lookup, select, and exclude stages for the MorphToMany relation.
   * @param {IRelationMorphToMany} morphToMany - The MorphToMany relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(morphToMany: IRelationMorphToMany): Document[] {
    // Generate the lookup stages for the MorphToMany relationship
    const lookup = this.lookup(morphToMany);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (morphToMany.options?.select)
      select = Relation.selectRelationColumns(
        morphToMany.options.select,
        morphToMany.alias
      );

    // Generate the exclude stages if options.exclude is provided
    if (morphToMany.options?.exclude)
      exclude = Relation.excludeRelationColumns(
        morphToMany.options.exclude,
        morphToMany.alias
      );

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * Generates the lookup stages for the MorphToMany relation.
   * @param {IRelationMorphToMany} morphToMany - The MorphToMany relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphToMany: IRelationMorphToMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphToMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${morphToMany.model.getIsDeleted()}`, false] }],
          },
        },
      });
    }

    // Define the $lookup stages
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
                      $eq: [
                        `$${morphToMany.morphType}`,
                        morphToMany.parentModelName,
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
