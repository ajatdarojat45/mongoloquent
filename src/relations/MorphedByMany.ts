import { Document } from "mongodb";
import Model from "../Model";
import Relation from "../Relation";
import {
  IRelationMorphedByMany,
  IRelationOptions,
} from "../interfaces/IRelation";

export default class MorphedByMany {
  /**
   * @note This method generates the lookup, select, and exclude stages for the MorphByMany relation.
   * @param {typeof Model} target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} type - The type of the morph.
   * @param {string} id - The ID of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {Document[]} The lookup stages.
   */
  static generate(morphedByMany: IRelationMorphedByMany): Document[] {
    // Generate the lookup stages for the MorphByMany relationship
    const lookup = this.lookup(morphedByMany);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (morphedByMany.options?.select)
      select = Relation.selectRelationColumns(
        morphedByMany.options.select,
        morphedByMany.alias
      );

    // Generate the exclude stages if options.exclude is provided
    if (morphedByMany.options?.exclude)
      exclude = Relation.excludeRelationColumns(
        morphedByMany.options.exclude,
        morphedByMany.alias
      );

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * @note This method generates the lookup stages for the MorphByMany relation.
   * @param {typeof Model} target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} type - The type of the morph.
   * @param {string} id - The ID of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphedByMany: IRelationMorphedByMany): Document[] {
    const lookup: Document[] = [];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphedByMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [{ $eq: [`$${morphedByMany.model.getIsDeleted()}`, false] }],
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
          foreignField: `${morphedByMany.parentModelName.toLowerCase()}Id`,
          as: "pivot",
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: [
                        `$${morphedByMany.morphType}`,
                        morphedByMany.model.name,
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
          from: morphedByMany.model.$collection,
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
