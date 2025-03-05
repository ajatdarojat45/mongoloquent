import { Document } from "mongodb";
import Relation from "../Relation";
import { IRelationMorphTo } from "../interfaces/IRelation";

export default class MorphTo {
  /**
   * Generates the lookup, select, and exclude stages for the MorphTo relation.
   * @param {IRelationMorphTo} morphTo - The MorphTo relation configuration.
   * @return {Document[]} The combined lookup, select, and exclude stages.
   */
  static generate(morphTo: IRelationMorphTo): Document[] {
    // Generate the lookup stages for the MorphTo relationship
    const alias = morphTo.alias || "alias";
    const lookup = this.lookup(morphTo);
    let select: any = [];
    let exclude: any = [];

    // Generate the select stages if options.select is provided
    if (morphTo.options?.select)
      select = Relation.selectRelationColumns(morphTo.options.select, alias);

    // Generate the exclude stages if options.exclude is provided
    if (morphTo.options?.exclude)
      exclude = Relation.excludeRelationColumns(morphTo.options.exclude, alias);

    // Return the combined lookup, select, and exclude stages
    return [...lookup, ...select, ...exclude];
  }

  /**
   * Generates the lookup stages for the MorphTo relation.
   * @param {IRelationMorphTo} morphTo - The MorphTo relation configuration.
   * @return {Document[]} The lookup stages.
   */
  static lookup(morphTo: IRelationMorphTo): Document[] {
    const alias = morphTo.alias || "alias";
    const lookup: Document[] = [{ $project: { alias: 0 } }];
    const pipeline: Document[] = [];

    // Add soft delete condition to the pipeline if enabled
    if (morphTo.model.$useSoftDelete) {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $eq: [`$${morphTo.model.getIsDeleted()}`, false] },
              {
                $eq: [`$${morphTo.morphType}`, morphTo.parentModelName],
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
                $eq: [`$${morphTo.morphType}`, morphTo.parentModelName],
              },
            ],
          },
        },
      });
    }

    // Define the $lookup stage
    const $lookup = {
      from: morphTo.model.$collection,
      localField: "_id",
      foreignField: `${morphTo.morphId}`,
      as: alias,
      pipeline: pipeline,
    };

    // Add the $lookup stage to the lookup array
    lookup.push({ $lookup });

    // Define the $unwind stage
    lookup.push({
      $unwind: {
        path: `$${alias}`,
        preserveNullAndEmptyArrays: true,
      },
    });

    return lookup;
  }
}
