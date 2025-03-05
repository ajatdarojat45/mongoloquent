import { Document } from "mongodb";
import Relation from "../Relation";
import Model from "../Model";
import { IRelationMorphMany, IRelationOptions } from "../interfaces/IRelation";

export default class MorphMany {
  /**
   * @note This method generates the lookup, select, and exclude stages for the MorphMany relation.
   * @param {typeof Model} target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} type - The type of the morph.
   * @param {string} id - The ID of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @param {IRelationOptions} options - The options for the relation.
   * @return {Document[]} The lookup stages.
   */
  static generate(morphMany: IRelationMorphMany): Document[] {
    // Generate the lookup stages for the MorphMany relationship
    const alias = morphMany.alias || "alias"

    const lookup = this.lookup(morphMany);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (morphMany.options?.select)
      select = Relation.selectRelationColumns(morphMany.options.select, alias);

    // Generate the exclude stages if options.exclude is provided
    if (morphMany.options?.exclude)
      exclude = Relation.excludeRelationColumns(morphMany.options.exclude, alias);

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * @note This method generates the lookup stages for the MorphMany relation.
   * @param {typeof Model} target - The target model.
   * @param {string} name - The name of the morph.
   * @param {string} type - The type of the morph.
   * @param {string} id - The ID of the morph.
   * @param {string} [ownerKey="_id"] - The owner key.
   * @param {string} alias - The alias for the relation.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphMany: IRelationMorphMany): Document[] {
    const lookup: Document[] = [{ $project: { alias: 0 } }];
    const pipeline: Document[] = [];
    const alias = morphMany.alias || "alias"

    // Add soft delete condition to the pipeline if enabled
    if (morphMany.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphMany.model.getIsDeleted()}`, false] },
              {
                $eq: [`$${morphMany.morphType}`, morphMany.parentModelName],
              },
            ],
          },
        },
      });
    } else {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: [`$${morphMany.morphType}`, morphMany.parentModelName],
              },
            ],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: morphMany.model.$collection,
      localField: "_id",
      foreignField: morphMany.morphId,
      as: alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    return lookup;
  }
}
